const { Collection, REST } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

class CommandHandler {
  constructor(client, options) {
    this.client = client;
    this.options = options || {};
    client.commands = new Collection();
    this.rest = new REST({ version: '10' }).setToken(options.token); // Set the token here
  }

  loadCommands() {
    const foldersPath = path.join(__dirname, '..', 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
          command.execute(this.client); // Pass the client instance to the command
          this.commands.set(command.data.name, command);
        } else {
          console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
      }
    }

    console.log(`Loaded ${this.commands.size} commands.`);
  }

  async registerCommands() {
    const commands = [];
    const commandsPath = path.join(__dirname, '..', 'commands');

    try {
      const categories = fs.readdirSync(commandsPath);

      for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);

        // Check if it's a directory before reading files inside
        if (fs.statSync(categoryPath).isDirectory()) {
          const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

          for (const file of commandFiles) {
            const filePath = path.join(categoryPath, file);
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
              commands.push(command.data.toJSON());
            } else {
              console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
          }
        }
      }

      try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await this.rest.put(
          `/applications/${this.client.application.id}/guilds/${this.options.guildId}/commands`,
          { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = CommandHandler;
