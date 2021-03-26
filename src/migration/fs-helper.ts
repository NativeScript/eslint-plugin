import { resolve } from 'path';
import { promises as fs } from 'fs';
const { readFile, readdir } = fs;

export async function readFiles(files: string[]): Promise<Array<{ name: string, content: string }>> {
    const promises = files.map(file => readFile(file, { encoding: 'utf-8' }))
    const contents = await Promise.all(promises);
    const nameContentMap = contents.map((content, index) => ({
        name: files[index],
        content: content
    }));

    return nameContentMap;
}

export async function getFilesList(directory: string, ext = ''): Promise<string[]> {
    const files: string[] = [];

    const filesIterator = getFilesGenerator(directory) as string[];
    for await (const file of filesIterator) {
        if (file.endsWith(ext)) {
            files.push(file);
        }
    }

    return files;
}

async function* getFilesGenerator(directory: string) {
    const directoryEntries = await readdir(directory, { withFileTypes: true });

    for (const entry of directoryEntries) {
        const file = resolve(directory, entry.name);
        if (entry.isDirectory()) {
            yield* getFilesGenerator(file);
        } else {
            yield file;
        }
    }
}
