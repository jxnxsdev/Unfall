import discord from 'discord.js';

import { macros } from '../modules/macros';

export const name = 'searchmacro';
export const description = 'Search for macros and get information about them.';
export const options: discord.ApplicationCommandOptionData[] = [
    {
        name: 'macro',
        type: discord.ApplicationCommandOptionType.String,
        description: 'The name of the macro to search for.',
        required: true,
        autocomplete: true
    },
    {
        name: 'raw',
        type: discord.ApplicationCommandOptionType.Boolean,
        description: 'Get the raw macro data.',
        required: false
    }
];

export async function execute(interaction: discord.CommandInteraction, client: discord.Client) {
    const macro = interaction.options.get('macro').value as string;
    let raw = false;

    if (interaction.options.get('raw')) {
        raw = interaction.options.get('raw').value as boolean;
    }

    let macroData = null;

    for (const m of macros) {
        if (m.name === macro) {
            macroData = m;
            break;
        }
    }

    if (!macroData) {
        await interaction.reply({ content: 'No macro found with that name.', ephemeral: true });
        return;
    }

    if (raw) {
        await interaction.reply({ content: `\`\`\`json\n${JSON.stringify(macroData, null, 4)}\n\`\`\`` });
        return;
    }

    const embed = new discord.EmbedBuilder()
        .setTitle('Macro Information')
        .addFields(
            { name: 'Name', value: macroData.name },
            { name: 'Creator', value: `<@${macroData.ownerID}> | ${macroData.ownerTag}` }
        )
        .setDescription('```' + macroData.text + '```')
        .setColor("#FF0000");

    await interaction.reply({ embeds: [embed] });
};