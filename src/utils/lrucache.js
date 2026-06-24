export default class LRU {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }
    get(key) {
        if (!this.cache.has(key)) {
            return -1;
        }
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }
    set(key, value) {
        if (this.cache.size >= this.capacity) {
            const lruKey = this.cache.keys().next().value;
            this.cache.delete(lruKey);
        }
        this.cache.set(key, value);
    }
}
