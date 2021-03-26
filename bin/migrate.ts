#!/usr/bin/env node

import { fixFilesInDirectory } from '../src/migration';

(async () => {
    const directory = process.argv[2];
    try {
        await fixFilesInDirectory(directory);
    } catch(e) {
        console.error(e);
        throw e;
    }
})();
