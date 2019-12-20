/* eslint-disable func-names */
/* eslint-disable object-shorthand */
/* eslint-disable no-invalid-this */
/* eslint-disable global-require */
"use strict";

// Require Third-party Dependencies
const { Ework } = require("ework");

/**
 * @function initASTWorkers
 * @param {number} [numWorkers=10]
 * @param {object} [initData]
 * @returns {any}
 */
function initASTWorkers(numWorkers = 5, initData = {}) {
    return new Ework(function(data) {
        try {
            const { dest, file, isProjectUsingESM } = data;
            const isESM = this.path.extname(file) === ".mjs" ? true : isProjectUsingESM;

            const str = this.readFile(this.path.join(dest, file), "utf-8");
            const isMinified = !file.includes(".min") && this.isCodeMinified(str);

            const { dependencies, isSuspect } = this.searchRuntimeDependencies(str, isESM);

            return { isMinified, isSuspect, deps: [...dependencies] };
        }
        catch (error) {
            return null;
        }
    }, {
        init: function() {
            const { readFileSync } = require("fs");
            const { searchRuntimeDependencies } = require("./ast");
            this.path = require("path");
            this.isCodeMinified = require("is-minified-code");
            this.readFile = readFileSync;
            this.searchRuntimeDependencies = searchRuntimeDependencies;

            console.log(this.isCodeMinified);
            console.log(this.searchRuntimeDependencies);
        },
        initData,
        numWorkers
    });
}

module.exports = { initASTWorkers };
