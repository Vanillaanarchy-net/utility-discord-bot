import chalk from 'chalk';

import type { Guild } from "discord.js";

export async function registerCommands(guild: Guild) {
    try {
        const commandsData = [
            {
                name: 'ping',
                description: 'Replies with pong! 🏓'
            }
        ];

        const size = await guild.commands.set(commandsData);

        console.log(chalk.green(`Commands registered successfully in guild: ${guild.name}`));

    } catch (error) {
        console.error(chalk.red(`Error registering commands in guild ${guild.name}:`, error));
    }
}