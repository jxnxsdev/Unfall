import discord from 'discord.js';
import fs from 'fs';
import path from 'path';

export async function autocompleteHandler(interaction: discord.AutocompleteInteraction, client: discord.Client) {
    // get all js files in the autocomplete directory
    const commandFiles = fs.readdirSync(path.resolve(__dirname, '../autocomplete')).filter(file => file.endsWith('.js'));
    // get the command name from the interaction
    const commandName = interaction.commandName;
    // find the command file that matches the command name
    for (const file of commandFiles) {
        const command = require(`../autocomplete/${file}`);
        if (command.name === commandName) {
            await command.execute(interaction, client).catch(console.error);
            break;
        }
    }
}