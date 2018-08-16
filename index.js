module.exports = (iterators, opts = {}) => {

  let done = false;

  let interrupt;
  const interruptPromise = new Promise((resolve, reject) => {
    interrupt = error => error ? reject(error) : resolve();
  });

  const throwAll = error => iterators.forEach(i => i.throw(error));
  const returnAll = () => iterators.forEach(i => i.return());

  const merged = {};

  const queue = new Map(iterators.map(i => [i, new Set]));

  const race = () => Promise.race([interruptPromise, ...Array.from(queue).map(([, [pending]]) => pending).filter(Boolean)]);

  const updateQueue = (input) => iterators.forEach(iterator => {
    const q = queue.get(iterator);
    if (q && !q.size) {
      const promise = iterator.next(input).then(({ value, done: iDone }) => {
        q.delete(promise);
        if (iDone) {
          queue.delete(iterator);
        }
        return { iterator, value };
      }).catch(error => {
        q.delete(promise);
        queue.delete(iterator);
        merged.throw(error);
        throwAll(error);
        throw error;
      });
      q.add(promise);
    }
  });

  const getValue = ({ iterator, value } = {}) => opts.yieldIterator ? { value: { iterator, value }, done } : { value, done };

  merged.next = async (input) => {
    updateQueue(input);
    try {
      const result = await race();
      if (result) {
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
    done = true;
    throwAll(error);
    interrupt(error);
    return getValue();
  };

  merged.return = (value) => {
    done = true;
    returnAll();
    interrupt();
    return getValue({ value });
  };

  merged[Symbol.asyncIterator] = () => merged;

  return merged;
};
