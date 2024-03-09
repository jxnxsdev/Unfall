import discord from 'discord.js';
import { macros } from '../modules/macros';

export const name = 'searchmacro';

export async function execute(interaction: discord.AutocompleteInteraction, client: discord.Client) {
    const macro = interaction.options.getString('macro');
    if (!macro) return;

    let includedMacros: discord.ApplicationCommandOptionChoiceData[] = [];

    let count = 0;

    for (const m of macros) {
        if (count >= 25) break;
        if (m.name.includes(macro)) {
            includedMacros.push({ name: m.name, value: m.name });
            count++;
        }
    }

    interaction.respond(includedMacros);
}