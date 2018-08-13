module.exports = async function* merge(iterators, opts = {}) {
  const queue = new Map(iterators.map(i => [i]));
  const getOutstanding = () => Array.from(queue.keys()).map(iterator => {
    const existing = queue.get(iterator);
    if (existing) {
      return existing;
    } else {
      const data = iterator.next();
      const promise = data.then ? data.then(data => ({ iterator, data })) : Promise.resolve({ iterator, data });
      queue.set(iterator, promise);
      return promise;
    }
  }).filter(Boolean);

  try {
    while (true) {
      const outstanding = getOutstanding();
      if (!outstanding.length) break;
      const { iterator, data } = await Promise.race(outstanding);
      queue.set(iterator, null);
      if (data.done) {
        queue.delete(iterator);
      }
      const value = opts.yieldIterator ? { iterator, data } : data.value;
      yield value
    }
  } catch (error) {
    iterators.forEach(i => i.throw(error));
    throw error;
  } finally {
    iterators.forEach(i => i.return());
  }
};
