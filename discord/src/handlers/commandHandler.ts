import discord from 'discord.js';
import fs from 'fs';
import path from 'path';

export async function registerCommands(client: discord.Client) {
    const commandJson: discord.ApplicationCommandData[] = [];
    const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        const { name, description, options } = command;

        commandJson.push({ name, description, options });
    }

    for (const [, guild] of client.guilds.cache) {
        await guild.commands.set(commandJson);
        console.log(`Registered commands in ${guild.name}`);
    }

    console.log('Commands registered');
}

export async function execute(interaction: discord.CommandInteraction, client: discord.Client) {
    const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        if (interaction.commandName === command.name) {
            command.execute(interaction, client);
            break;
        }
    }
}