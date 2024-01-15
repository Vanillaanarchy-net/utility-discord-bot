import type { ChatInputCommandInteraction as Interaction } from "discord.js";

import { readdir, stat } from "fs/promises";
import { resolve, parse } from "path";

const __root = resolve(__dirname, "out", "commands");

declare global {
    interface Executor {
        execute: (interaction: Interaction) => void | PromiseLike<void>;
    }
}

interface Command extends Executor {
    name: string;
    sub?: string;
    group?: string;
}

async function* loadIterator(source: string = __root, parent: string[] = []) {
    if (parent.length > 2) return;

    for (const entry of await readdir(source)) {
        const path = resolve(source, entry);
        const desc = await stat(path);

        if (desc.isDirectory()) {
            yield* await loadIterator(path, parent.concat(entry));
        } else if (entry.endsWith('.js')) {
            const name = entry.slice(0, entry.lastIndexOf('.js'));
            const exec = (await import(path)) as { default: Executor };

            switch (parent.length) {
                case 0: yield <Command> { ...exec.default, name }; break;
                case 1: yield <Command> { ...exec.default, name: parent[0], sub: name }; break;
                case 2: yield <Command> { ...exec.default, name: parent[0], group: parent[1], sub: name }; break;
            }
        }
    }
}

export async function loadCommands() {
    const commands: Command[] = [];

    for await (const command of loadIterator()) {
        commands.push(command);
    }

    return commands;
}