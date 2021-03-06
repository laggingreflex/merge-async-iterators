module.exports = (iterators, opts = {}) => {

  const org = iterators.reduce((org, iterator, i, iterators) => {
    if (!iterator.next) {
      org.set(iterators[i] = iterator[Symbol.iterator](), iterator);
    }
    return org;
  }, new Map);

  let done = false;

  let interrupt, interruptPromise = new Promise((resolve, reject) => {
    interrupt = ({ error, value }) => error ? reject(error) : resolve(value);
  });

  const throwAll = error => iterators.forEach(i => i.throw && i.throw(error));
  const returnAll = value => iterators.forEach(i => i.return && i.return(value));

  const merged = {};

  const queue = new Map(iterators.map(i => [i]));

  const race = () => {
    const q = Array.from(queue).map(([, pending]) => pending).filter(Boolean);
    if (!q.length) return;
    return Promise.race([interruptPromise, ...q]);
  };

  const updateQueue = (input) => queue.forEach((i, iterator) => {
    if (queue.get(iterator)) return;
    let promise = iterator.next(input);
    if (!promise.then) {
      promise = Promise.resolve(promise);
    }
    promise = promise.then(data => ({ ...data, iterator }));
    queue.set(iterator, promise);
  });

  const getValue = ({ iterator, value } = {}) => opts.yieldIterator ? {
    value: {
      iterator: org.get(iterator) || iterator,
      value
    },
    done
  } : { value, done };

  merged.next = async (input) => {
    if (done) return getValue();
    updateQueue(input);
    try {
      const result = await race();
      if (result) {
        if (result.done) {
          queue.delete(result.iterator);
        } else {
          queue.set(result.iterator, null);
        }
        if (!queue.size) {
          done = true;
        }
        return getValue(result);
      } else {
        done = true;
        returnAll();
        return getValue();
      }
    } catch (error) {
      done = true;
      throwAll(error);
      throw error;
    }
  };

  merged.throw = error => {
    /* TODO: don't set done=true unconditionally here, check to see how other iterators handle the throw */
    if (done) return { done }
    done = true;
    throwAll(error);
    interrupt({ error });
    return getValue();
  };

  merged.return = (value) => {
    if (done) return { done }
    done = true;
    returnAll(value);
    interrupt({ value });
    return getValue({ value });
  };

  merged[Symbol.asyncIterator] = () => merged;

  return merged;
};
