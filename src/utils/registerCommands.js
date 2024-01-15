import chalk from 'chalk';

/**
 * @param {import('discord.js').Guild} guild 
 */
export async function registerCommands(guild) {
    try {
        const commandsData = [
            {
                name: 'ping',
                description: 'Replies with pong! 🏓'
            }
        ];

        await guild.commands.set(commandsData);

        console.log(chalk.green(`Commands registered successfully in guild: ${guild.name}`));

    } catch (error) {
        console.error(chalk.red(`Error registering commands in guild ${guild.name}:`, error));
    }
}
