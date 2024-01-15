import "./utils/__dirname.js";

import { Client } from "discord.js";
import { loadCommands } from "./utils/loadCommands.js";
import { registerCommands } from "./utils/registerCommands.js";
import { createInterface } from 'readline';

import chalk, { type Chalk } from 'chalk';

declare global {
    function log(message: string, color?: string): void;
}

globalThis.log = function (message, color) {
    console.log(new Date(), chalk[color ?? "reset"](message));
}

!async function () {
    if (process.argv.includes('--register-commands')) {
        const client = new Client({
            intents: ['Guilds']
        });

        try {
            await client.login(process.env.TOKEN);
            log('Bot successfully logged in.');

            const guild = await client.guilds.fetch(process.env.GUILD_ID);
            log(`Fetched guild: ${guild.name}`);

            await registerCommands(guild);
            log('Commands registered successfully.');
        } catch (e) {
            log(`Error: ${e}`, 'red')
            return;
        }

        log('Logging off...');
        return client.destroy();
    }

    const commands = await loadCommands();

    const client = new Client({
        intents: ['Guilds']
    });

    const cli = createInterface(process.stdin, process.stdout);

    cli.once('SIGINT', async () => {
        log('Logging off...');
        await client.destroy();

        cli.close();
    });

    client.once('ready', () => {
        log('Bot started!');
    });

    client.on('interactionCreate', async (interaction) => {
        if (interaction.isChatInputCommand()) {
            const name = interaction.commandName;

            const sub = interaction.options.getSubcommand(false);
            const group = interaction.options.getSubcommandGroup(false);

            if (group !== null)
                return commands.find((v) => v.name === name && v.sub == sub && v.group == group).execute(interaction);

            else if (sub !== null)
                return commands.find((v) => v.name === name && v.sub == sub).execute(interaction);

            else
                return commands.find((v) => v.name === name).execute(interaction);
        }
    });

    log('Logging in...');
    await client.login(process.env.TOKEN);
} ();
