"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a live view snapshot to be served by {@link LiveViewServer}.
 * @property {string} pageUrl
 * @property {string} htmlContent
 * @property {number} screenshotIndex
 * @property {Date} createdAt
 * @ignore
 */
class Snapshot {
    /**
     * @param {Object} props
     * @param {string} props.pageUrl
     * @param {string} props.htmlContent
     * @param {number} props.screenshotIndex
     */
    constructor(props) {
        this.pageUrl = props.pageUrl;
        this.htmlContent = props.htmlContent;
        this.screenshotIndex = props.screenshotIndex;
        this.createdAt = new Date();
    }
    /**
     * @return {number}
     */
    age() {
        return Date.now() - this.createdAt;
    }
}
exports.default = Snapshot;
