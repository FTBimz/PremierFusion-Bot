const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Paste your custom emoji code here (e.g. '<:google_translate:134567890123456789>')
const CUSTOM_EMOJI = '<:google_translate:134567890123456789>'; 

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Translate text using Google Translate')
        .addStringOption(opt => 
            opt.setName('text')
               .setDescription('Text to translate')
               .setRequired(true)
        )
        .addStringOption(opt => 
            opt.setName('target')
               .setDescription('Target language (Default: Indonesian)')
               .setRequired(false)
               .addChoices(
                   { name: 'Indonesian (ID)', value: 'id' },
                   { name: 'English (EN)', value: 'en' },
                   { name: 'Japanese (JA)', value: 'ja' },
                   { name: 'Korean (KO)', value: 'ko' },
                   { name: 'Arabic (AR)', value: 'ar' },
                   { name: 'Chinese Simplified (ZH-CN)', value: 'zh-cn' },
                   { name: 'French (FR)', value: 'fr' },
                   { name: 'German (DE)', value: 'de' },
                   { name: 'Spanish (ES)', value: 'es' },
                   { name: 'Russian (RU)', value: 'ru' },
                   { name: 'Thai (TH)', value: 'th' },
                   { name: 'Vietnamese (VI)', value: 'vi' },
                   { name: 'Portuguese (PT)', value: 'pt' },
                   { name: 'Italian (IT)', value: 'it' },
                   { name: 'Dutch (NL)', value: 'nl' },
                   { name: 'Hindi (HI)', value: 'hi' },
                   { name: 'Filipino / Tagalog (TL)', value: 'tl' },
                   { name: 'Turkish (TR)', value: 'tr' },
                   { name: 'Malay (MS)', value: 'ms' },
                   { name: 'Ukrainian (UK)', value: 'uk' },
                   { name: 'Polish (PL)', value: 'pl' },
                   { name: 'Swedish (SV)', value: 'sv' },
                   { name: 'Greek (EL)', value: 'el' },
                   { name: 'Czech (CS)', value: 'cs' },
                   { name: 'Hungarian (HU)', value: 'hu' }
               )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const text = interaction.options.getString('text');
        const targetLang = interaction.options.getString('target') || 'id';

        let translatedText = null;
        let detectedLang = 'AUTO';

        // 1. Primary Google Translate API request
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                },
                timeout: 8000
            });

            if (response.data && response.data[0]) {
                translatedText = response.data[0].map(item => item[0]).join('');
                detectedLang = (response.data[2] || 'AUTO').toUpperCase();
            }
        } catch (err) {
            console.warn('[Translate] Google API rate-limited, switching to fallback...');
        }

        // 2. Fallback MyMemory API request if Google API hits 429
        if (!translatedText) {
            try {
                const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=Autodetect|${targetLang}`;
                const response = await axios.get(myMemoryUrl, { timeout: 8000 });
                if (response.data && response.data.responseData) {
                    translatedText = response.data.responseData.translatedText;
                }
            } catch (err) {
                console.error('[Translate Error]', err.message);
            }
        }

        if (!translatedText) {
            return interaction.editReply({ content: '<:red_tick:1552640233164771338> **Translate Error**: Failed to translate text. Please try again later.' });
        }

        // NativeAuto-style Embed with Custom Application Emoji
        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setTitle(`<:google_translate:1570689232396361828> Google Translate`)
            .setDescription(
                `**${detectedLang}:**\n${text}\n\n` +
                `**${targetLang.toUpperCase()}:**\n${translatedText}`
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};