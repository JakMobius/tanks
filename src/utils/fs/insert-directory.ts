import {promises as fs} from 'fs';
import path from 'path';
import copyDirectory from './copy-directory';

export default async function insertDirectory(from: string, to: string) {
    let list = await fs.readdir(from);

    for(let name of list) {
        const each_path = path.resolve(from, name)
        const stat = await fs.stat(each_path)

        if(stat.isDirectory()) {
            await copyDirectory(each_path, to)
        } else {
            await fs.copyFile(each_path, path.resolve(to, name))
        }
    }
};