import { promises as fs } from 'fs';
const { writeFile } = fs;

import { verifyAndFixFileContent } from './eslint-fix';
import { getFilesList, readFiles } from './fs-helper';

export async function fixFilesInDirectory(directory = ''): Promise<void> {
    const files = await getFilesList(directory, '.ts');
    const fileContents = await readFiles(files);

    const reports = fileContents
        .map(({ content, name }) => verifyAndFixFileContent(content, name))
        .filter(({ fixed }) => !!fixed);

    for (const { fileName, output } of reports) {
        await writeFile(fileName, output);
    }
}
