import discord from 'discord.js';

export const name = 'ping';
export const description = 'Ping!';
export const options: discord.ApplicationCommandOptionData[] = [];

export async function execute(interaction: discord.CommandInteraction, client: discord.Client) {
    await interaction.reply('Pong!');
};