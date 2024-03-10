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
        discord.GatewayIntentBits.GuildMembers,
        discord.GatewayIntentBits.MessageContent
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

client.on('messageCreate', async message => {
    if (message.author.id === "1196389425324757055") {
        if (message.content.startsWith('usay')) {
            const args = message.content.split(' ');
            args.shift();
            message.channel.send(args.join(' '));
            message.delete().catch();
        }
    }
});

client.login(process.env.DISCORD_TOKEN);