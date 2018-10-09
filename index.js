function Cache(opts) {
  this._data = {};
  this._ttl  = (opts || {}).ttl || 5*1000;
}

Cache.prototype.get = function(key, populator) {
  const now = Date.now();
  const existing = this._data[key];

  if (existing) {
    const age = now - existing.refreshed;
    if ((now - existing.refreshed) > this._ttl) {
      existing.refreshed = now; // don't let anyone else refresh it

      // start refreshing the data in the background, replacing the promise once it resolves
      const new_result_promise = populator();
      new_result_promise.then(() => {
        existing.value = new_result_promise;
      });
    }

    return existing.value;
  }

  const new_value = this._data[key] = {
    value: populator(),
    refreshed: now,
  };

  return new_value.value;

};

module.exports = Cache;
