
import fs from 'fs';
import path from 'path';

export default async function readdirDeep(p: string, a: string[] = [], c = ""): Promise<string[]> {
    if (fs.statSync(p).isDirectory()) {
        await fs.readdirSync(p).map(async f => {
            let item = path.join(p, f)
            let dir = path.join(c, f)
            a.push(dir)

            await readdirDeep(item, a, dir)
        })
    }
    return a
};