import "./src/utils/__dirname.js";

import { Client } from "discord.js";
import { loadCommands } from "./src/utils/loadCommands.js";
import { registerCommands } from "./src/utils/registerCommands.js";
import { createInterface } from 'readline';

!async function () {
    if (process.argv.includes('--register-commands')) {
        const client = new Client({
            intents: ['Guilds']
        });

        try {
            await client.login(process.env.TOKEN);
        
            const guild = await client.guilds.fetch(process.env.GUILD_ID);
        
            await registerCommands(guild);
        } catch (e) {
            return console.error(e);
        }

        return client.destroy();
    }

    const commands = await loadCommands();

    const client = new Client({
        intents: ['Guilds']
    });

    const cli = createInterface(process.stdin, process.stdout);

    cli.once('SIGINT', async () => {
        await client.destroy();

        cli.close();
    });

    client.once('ready', () => {
        console.log('Bot started!');
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

    await client.login(process.env.TOKEN);
} ();