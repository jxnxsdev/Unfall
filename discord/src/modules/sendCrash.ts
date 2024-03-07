import discord from 'discord.js';
import { client } from '..';
import * as types from '../types';

export async function sendCrash(crash: types.processed_crash) {
    const data: types.data = JSON.parse(crash.data);
    // @ts-ignore
    const modString = data.mods.map(mod => `${mod.name}:${mod.version}`).join(', ');

    const isLiveness = data.causes.includes("liveness");
    const isHook = data.causes.includes("hook");
    const isCrashMod = data.causes.includes("libcrashmod.so");

    const time = new Date(crash.crash_time);
    const unix = Math.floor(time.getTime() / 1000);

    let description = `
        **Player ID:** ${crash.player_id}
        **Crash Time:** <t:${unix}:R>
        **Version:** ${crash.version}

        **Mods:**
        ${modString}
    `;

    if (isLiveness) {
        description = "**LIVENESS CRASH**\n\n" + description;
    } else if (isHook) {
        description = "**HOOK CRASH**\n\n" + description;
    } else if (isCrashMod) {
        description = `**Looks like ${crash.player_id} was screwed over by crashmod**`;
    } else {
        description += `\n\n**Coulprits:**\n${data.causes.join('\n')}`;
    }

    const embed = new discord.EmbedBuilder()
        .setTitle("New Crash: " + crash.crash_id)
        .setDescription(description)
        .setColor("#FF0000")
        .setURL(`https://analyzer.questmodding.com/crashes/${crash.crash_id}`);

    if (isCrashMod) {
        embed.setImage("https://media1.tenor.com/m/9ccpdUqcvXIAAAAC/iu.gif");
    }

    await sendEmbed(embed);
}

async function sendEmbed(embed: discord.EmbedBuilder) {
    const channels = process.env.CRASH_CHANNELS.split(',');

    for (const channel of channels) {
        try {
            const c = await client.channels.fetch(channel) as discord.TextChannel;
            await c.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
        }
    }
}
