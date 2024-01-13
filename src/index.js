// lib/index.js
require('dotenv').config({ path: './config/.env' });
const DiscordGroupManager = require('./lib/group-manager');
const CommandHandler = require('./lib/command-handler');

// Use a lowercase 'i' for the variable name
const { Client, GatewayIntentBits } = require('discord.js');

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildBans,
  GatewayIntentBits.GuildEmojisAndStickers,
  GatewayIntentBits.GuildIntegrations,
  GatewayIntentBits.GuildWebhooks,
  GatewayIntentBits.GuildInvites,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildPresences,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.GuildMessageTyping,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.DirectMessageReactions,
  GatewayIntentBits.DirectMessageTyping,
];

const client = new Client({ intents });
client.commands = new Map();
const commandHandler = new CommandHandler(client, {
  token: process.env.BOT_TOKEN,
  guildId: process.env.GUILD_ID,
});

const groupManager = new DiscordGroupManager();

// Example usage of the group manager
groupManager.createGroup('1234567890', 'TeamA');
groupManager.addUserToGroup('1234567890', 'TeamA', '987654321');

// Example usage of the command handler
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  commandHandler.loadCommands();
  commandHandler.registerCommands();
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('There was an error executing the command.');
  }
});

client.login(process.env.BOT_TOKEN);
