import { globby } from 'globby';
import { parse } from 'path';

import { stat } from 'fs/promises';

const __root = `${__dirname}/src/commands`;
const __exp = /(?<c>(?<ca>[^/]*)*\/(?<cb>[^/]*)\/(?<cc>[^/]*))|(?<b>(?<ba>[^/]*)\/(?<bb>[^/]*))|(?<a>[^/]*)/;

/**
 * @param {string} str 
 */
function getIndex(str) {
    const res = __exp.exec(str);

    const isA = res.groups.a !== undefined;
    const isB = (!isA) && res.groups.b !== undefined;
    const isC = (!isB) && res.groups.b !== undefined;

    if (isA) return { name: res.groups.a };
    if (isB) return { name: res.groups.ba, sub: res.groups.bb };
    if (isC) return { name: res.groups.ca, sub: res.groups.cc, group: res.groups.cb };
}

export async function loadCommands() {
    const names = (await globby(`${__root}/**/*.js`))
        .filter((f) => __exp.test(f.slice(__root.length + 1, f.indexOf('.js'))))
        .map((f) => [ f, getIndex(f.slice(__root.length + 1, f.indexOf('.js'))) ]);

    const exec = await Promise.all(names.map((e) => import(e[0])));
    const entries = names.map((e, i) => ({ ...e[1], ...exec[i] }));

    return entries;
}