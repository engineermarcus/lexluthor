import { BOT_NAME, BOT_VERSION, PREFIX, OWNER_NUMBER } from '../settings.js';

const MENU_IMAGE = 'https://i.pinimg.com/736x/b2/da/ab/b2daab948936d5dd320eeb2d6209f8ce.jpg';
const CHANNEL_JID = '120363426440331517@newsletter';
const CHANNEL_NAME = 'Luthor MD';

function getMenuText() {
    return `
╔═══════════════════════╗
║    *${BOT_NAME} v${BOT_VERSION}*    
╚═══════════════════════╝

👤 *Owner:* ${OWNER_NUMBER}
🔰 *Prefix:* ${PREFIX}
🌐 *Status:* Online 24/7

━━━━━━━━━━━━━━━━━━━━━━

⚙️ *CORE COMMANDS*
╔════════════════════
║ ${PREFIX}ping
║ ${PREFIX}alive
║ ${PREFIX}menu / ${PREFIX}help
╚════════════════════

🛠️ *UTILITY COMMANDS*
╔════════════════════
║ ${PREFIX}sticker / ${PREFIX}s
║ ${PREFIX}toimg / ${PREFIX}toimage  
║ ${PREFIX}tts <text or reply>
║ ${PREFIX}swahili / ${PREFIX}english
║ ${PREFIX}french / ${PREFIX}spanish
║ ${PREFIX}arabic / ${PREFIX}german
║ _(reply or write text after)_
╚════════════════════

🎭 *FUN COMMANDS*
╔════════════════════
║ ${PREFIX}meme — random meme
║ ${PREFIX}yesno — yes or no with gif
║ ${PREFIX}insult — roast someone
║ ${PREFIX}bs — corporate nonsense
║ ${PREFIX}joke — dad joke
║ ${PREFIX}bored — activity suggestion
║ ${PREFIX}8ball <question> — fortune
╚════════════════════

👥 *GROUP COMMANDS*
╔════════════════════
║ ${PREFIX}stalkall — DM all members
║ ${PREFIX}stalk — DM replied member
║ ${PREFIX}kick — kick replied member
║ ${PREFIX}mute — mute replied member
║ ${PREFIX}unmute — unmute replied member
║ ${PREFIX}muteall — mute everyone
║ ${PREFIX}unmuteall — unmute everyone
╚════════════════════

━━━━━━━━━━━━━━━━━━━━━━
_Powered by ${BOT_NAME}_
`.trim();
}

export async function sendMenu(sock, from, msg) {
    try {
        await sock.sendMessage(from, {
            image: { url: MENU_IMAGE },
            caption: getMenuText(),
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: CHANNEL_JID,
                    serverMessageId: 1,
                    newsletterName: CHANNEL_NAME
                },
                externalAdReply: {
                    title: BOT_NAME,
                    body: 'Tap to view official channel',
                    mediaType: 1,
                    sourceUrl: `https://whatsapp.com/channel/${CHANNEL_JID.split('@')[0]}`,
                    thumbnailUrl: MENU_IMAGE,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: msg });
        console.log('✅ Menu sent');
    } catch (error) {
        console.error('❌ Menu error:', error.message);
    }
}