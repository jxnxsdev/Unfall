import discord from 'discord.js';
import { config } from 'dotenv';
import * as cmdHandler from './handlers/commandHandler';
import * as db from './modules/database';
import * as websocket from './modules/websocket';
import { autocompleteHandler } from './handlers/autocompleteHandler';
config();

export const client = new discord.Client({
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
    await db.connect();
    await websocket.connect();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    cmdHandler.execute(interaction, client).catch((e) => {
        console.error(e);
        interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isAutocomplete()) return;

    autocompleteHandler(interaction, client).catch((e) => {
        console.error(e);
        interaction.respond([{"name": "No options available", "value": "error"}]);
    });
});

client.login(process.env.DISCORD_TOKEN);