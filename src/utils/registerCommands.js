/**
 * @param {import('discord.js').Guild} guild 
 */
export async function registerCommands(guild) {
    return guild.commands.set([
        {
            name: 'ping',
            description: 'Replies with pong! 🏓'
        }
    ]);
}