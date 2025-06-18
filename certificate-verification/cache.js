// cache.js
const cache = new Map();

function setCache(key, value, ttl = 3600) {
  const expiry = Date.now() + ttl * 1000;
  cache.set(key, { value, expiry });

  setTimeout(() => {
    if (cache.has(key) && cache.get(key).expiry <= Date.now()) {
      cache.delete(key);
    }
  }, ttl * 1000);
}

function getCache(key) {
  const item = cache.get(key);
  if (!item || item.expiry <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

module.exports = { setCache, getCache };
