#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const { fixFilesInDirectory } = require('../dist/src/migration');

(async () => {
    const directory = process.argv[2];
    try {
        await fixFilesInDirectory(directory);
    } catch(e) {
        console.error(e);
        throw e;
    }
})();
