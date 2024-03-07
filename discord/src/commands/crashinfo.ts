import discord from 'discord.js';
import * as db from '../modules/database';

export const name = 'crashinfo';
export const description = 'Get information about a crash.';
export const options: discord.ApplicationCommandOptionData[] = [
    {
        name: 'crash_id',
        type: discord.ApplicationCommandOptionType.String,
        description: 'The ID of the crash.',
        required: true
    }
];

export async function execute(interaction: discord.CommandInteraction, client: discord.Client) {
    const crash_id = interaction.options.get('crash_id').value as string;
    const conn = await db.getConnection();
    // @ts-ignore
    const [rows, fields] = await conn.query('SELECT * FROM crashes WHERE crash_id = ?', [crash_id]).catch(console.error);
    // @ts-ignore
    if (rows.length === 0) {
        await interaction.reply({ content: 'No crash found with that ID.', ephemeral: true });
        return;
    }
    // @ts-ignore
    const crash = rows[0];
    const data = JSON.parse(crash.data);
    let modsString = ``;
    for (const mod of data.mods) {
        modsString += `${mod.name}, `;
    }
    modsString = modsString.slice(0, -2);
    const embed = new discord.EmbedBuilder()
        .setTitle('Crash Information')
        .addFields(
            { name: 'Crash ID', value: crash.crash_id },
            { name: 'Player ID', value: crash.player_id },
            { name: 'Crash Time', value: new Date(crash.crash_time).toUTCString() },
            { name: 'Game Version', value: crash.version },
            { name: 'Mods', value: modsString || 'None' },
            { name: 'Crash Header', value: data.header },
            { name: 'Crash Causes', value: data.causes.join(', ') || 'None' }
        )
        .setColor("#FF0000")
        .setURL(`https://analyzer.questmodding.com/crashes/${crash.crash_id}`);
    await interaction.reply({ embeds: [embed] });
};