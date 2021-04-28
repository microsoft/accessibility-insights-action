"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_log_1 = require("../utils_log");
/**
 * Abstract class with pre-defined method to connect to the Crawlers class by the "use" crawler method.
 */
class CrawlerExtension {
    constructor() {
        this.name = this.constructor.name;
        this.log = utils_log_1.default.child({ prefix: this.name });
    }
    getCrawlerOptions() {
        throw new Error(`${this.name} has not implemented "getCrawlerOptions" method.`);
    }
}
exports.default = CrawlerExtension;
