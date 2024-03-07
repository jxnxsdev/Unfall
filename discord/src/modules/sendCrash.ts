import discord from 'discord.js';
import { client } from '..';
import * as types from '../types';

export async function sendCrash(crash: types.processed_crash) {
    let data: types.data = JSON.parse(crash.data);

    let modString = ``;

    for (let i = 0; i < data.mods.length; i++) {
        // @ts-ignore
        modString += `${data.mods[i].name}:${data.mods[i].version}, `;
    }

    modString = modString.slice(0, -2);

    let embed = new discord.EmbedBuilder()
    .setTitle("New Crash: " + crash.crash_id);

    if (data.causes.includes("liveness")) {
        embed.setDescription(`
            **LIVENESS CRASH**

            **Player ID:** ${crash.player_id}
            **Crash Time:** ${crash.crash_time}
            **Version:** ${crash.version}

            **Mods:**
            ${modString}
        `)
    }else if (data.causes.includes("hook")) {
        embed.setDescription(`
            **HOOK CRASH**

            **Player ID:** ${crash.player_id}
            **Crash Time:** ${crash.crash_time}
            **Version:** ${crash.version}

            **Mods:**
            ${modString}
        `)
    } if (data.causes.includes("libCrashMod.so")) {
        embed.setDescription(`
            **Looks like ${crash.player_id} was screwed over by crashmod**
        `);
        embed.setImage("https://media1.tenor.com/m/9ccpdUqcvXIAAAAC/iu.gif")
    } else {
        embed.setDescription(`
            **Player ID:** ${crash.player_id}
            **Crash Time:** ${crash.crash_time}
            **Version:** ${crash.version}

            **Mods:**
            ${modString}

            **Coulprits:**
            ${data.causes.join('\n')}
        `)
    }

    embed.setColor("#FF0000");
    embed.setURL(`https://analyzer.questmodding.com/crashes/${crash.crash_id}`);
    
    const channels = process.env.CRASH_CHANNELS.split(',');

    sendEmbed(embed).catch(console.error);
}

async function sendEmbed(embed: discord.EmbedBuilder) {
    const channels = process.env.CRASH_CHANNELS.split(',');

    for (const channel of channels) {
        let c = await client.channels.fetch(channel) as discord.TextChannel;
        await c.send({
            embeds: [embed]
        }).catch(console.error);
    }
}