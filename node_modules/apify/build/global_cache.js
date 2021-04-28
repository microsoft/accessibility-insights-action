"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LruCache = require("apify-shared/lru_cache");
/**
 * Used to manage all globally created caches, such as request queue cache
 * or dataset cache. Before creation of this class, those caches were
 * created as module scoped globals - untouchable. This proved problematic
 * especially in tests, where caches would prevent test separation.
 */
class GlobalCache {
    constructor() {
        this.caches = new Map();
    }
    create(name, maxSize) {
        const newCache = new LruCache({ maxLength: maxSize });
        this.caches.set(name, newCache);
        return newCache;
    }
    clear(name) {
        const cache = this.caches.get(name);
        cache.clear();
    }
    clearAll() {
        this.caches.forEach(cache => cache.clear());
    }
}
exports.default = new GlobalCache();
