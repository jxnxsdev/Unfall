import discord from 'discord.js';
import fs from 'fs';
import path from 'path';

export async function registerCommands(client: discord.Client) {

    let commandJson: discord.ApplicationCommandData[] = [];

    const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        
        const name = command.name;
        const description = command.description;
        const options = command.options;

        commandJson.push({ name, description, options });
    }

    for (const guild of client.guilds.cache) {
        const commands = await guild[1].commands.set(commandJson);
        console.log(`Registered commands in ${guild[1].name}`);
    }

    console.log('Commands registered');
}

export async function execute(interaction: discord.CommandInteraction, client: discord.Client) {
    const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        if (interaction.commandName === command.name) {
            command.execute(interaction, client);
        }
    }
}