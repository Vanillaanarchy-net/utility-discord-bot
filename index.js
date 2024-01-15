import "./src/utils/__dirname.js";
import { Client } from "discord.js";
import { loadCommands } from "./src/utils/loadCommands.js";
import { registerCommands } from "./src/utils/registerCommands.js";
import { createInterface } from 'readline';
import chalk from 'chalk';

const log = (message, color = 'white') => {
    console.log(chalk[color](message));
};

!async function () {
    if (process.argv.includes('--register-commands')) {
        const client = new Client({
            intents: ['Guilds']
        });

        try {
            await client.login(process.env.TOKEN);
            log('Bot successfully logged in.', 'green');

            const guild = await client.guilds.fetch(process.env.GUILD_ID);
            log(`Fetched guild: ${guild.name}`, 'cyan');

            await registerCommands(guild);
            log('Commands registered successfully.', 'yellow');
        } catch (e) {
            console.error(chalk.red('Error:', e));
            return;
        }

        log('Destroying client...', 'magenta');
        return client.destroy();
    }

    const commands = await loadCommands();

    const client = new Client({
        intents: ['Guilds']
    });

    const cli = createInterface(process.stdin, process.stdout);

    cli.once('SIGINT', async () => {
        log('Destroying client...', 'magenta');
        await client.destroy();

        cli.close();
    });

    client.once('ready', () => {
        log('Bot started!', 'green');
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

    log('Logging in...', 'cyan');
    await client.login(process.env.TOKEN);
} ();
