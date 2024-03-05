import discord from 'discord.js';
import { config } from 'dotenv';
import * as cmdHandler from './handlers/commandHandler';
config();

const client = new discord.Client({
    intents: [
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.GuildMessages,
        discord.GatewayIntentBits.GuildMessageReactions,
        discord.GatewayIntentBits.GuildMembers
    ]
});

client.on('ready', async () => {
    console.log('Bot is ready');
    await cmdHandler.registerCommands(client);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    cmdHandler.execute(interaction, client).catch((e) => {
        console.error(e);
        interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    });
});

client.login(process.env.DISCORD_TOKEN);
