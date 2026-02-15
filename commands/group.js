// group.js
import { 
    OWNER_NUMBER,
    WELCOME, GOODBYE,
    WELCOME_MESSAGE,
    GOODBYE_MESSAGE,
    ANTI_DELETE,
    ANTI_LINK,
    STALK_MESSAGE } from '../settings.js';
import fs from 'fs';

const mutedUsers = new Map();
const muteAll = new Map();
const CACHE_FILE = './temp.txt';


// ── Message Cache ──────────────────────────────────────────────────────────

function readCache() {
    try {
        if (!fs.existsSync(CACHE_FILE)) return {};
        return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } catch { return {}; }
}

function writeCache(cache) {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), 'utf-8');
    } catch (err) {
        console.error('❌ Cache write error:', err.message);
    }
}
export function cacheMessage(msg) {
    if (!msg.message || msg.key.fromMe) return;
    const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption || null;
    if (!body) return;

    const cache = readCache();
    cache[msg.key.id] = {
        body,
        from: msg.key.remoteJid,
        sender: msg.key.participant || msg.key.remoteJid,
        senderName: msg.pushName || 'Unknown'
    };

    const keys = Object.keys(cache);
    if (keys.length > 500) delete cache[keys[0]];

    writeCache(cache);
}
// ── Helpers ────────────────────────────────────────────────────────────────

async function isBotAdmin(sock, groupJid) {
    try {
        const meta = await sock.groupMetadata(groupJid);
        const botLid = sock.authState.creds.me?.lid?.split(':')[0].split('@')[0];
        const botPhone = sock.user.id.split(':')[0].split('@')[0];
        const bot = meta.participants.find(p => {
            const pNumber = p.id.split(':')[0].split('@')[0];
            return pNumber === botLid || pNumber === botPhone;
        });
        return bot?.admin === 'admin' || bot?.admin === 'superadmin';
    } catch (err) {
        console.error('❌ isBotAdmin error:', err.message);
        return false;
    }
}

async function isSenderAdmin(sock, groupJid, senderJid) {
    try {
        const meta = await sock.groupMetadata(groupJid);
        const senderNumber = senderJid.split(':')[0].split('@')[0];
        const sender = meta.participants.find(p => {
            const pNumber = p.id.split(':')[0].split('@')[0];
            return pNumber === senderNumber;
        });
        return sender?.admin === 'admin' || sender?.admin === 'superadmin';
    } catch (err) {
        console.error('❌ isSenderAdmin error:', err.message);
        return false;
    }
}

function getMentionedJid(msg) {
    return msg.message?.extendedTextMessage?.contextInfo?.participant ||
        msg.message?.contextInfo?.participant ||
        null;
}

function getBody(msg) {
    return msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption || '';
}

// ── Welcome & Goodbye ──────────────────────────────────────────────────────

// In your group.js - update the function to match official structure
export async function handleGroupParticipantsUpdate(sock, update) {
    const { id, participants, action } = update;

    if (action === 'add' && WELCOME) {
        for (const participant of participants) {
            const number = participant.split('@')[0].split(':')[0];
            const text = WELCOME_MESSAGE.replace('{name}', `@${number}`);
            try {
                await sock.sendMessage(id, { text, mentions: [participant] });
            } catch (err) {
                console.error('❌ Welcome error:', err.message);
            }
        }
    }

    if ((action === 'remove' || action === 'leave') && GOODBYE) {
        for (const participant of participants) {
            const number = participant.split('@')[0].split(':')[0];
            const text = GOODBYE_MESSAGE.replace('{name}', `@${number}`);
            try {
                await sock.sendMessage(id, { text, mentions: [participant] });
            } catch (err) {
                console.error('❌ Goodbye error:', err.message);
            }
        }
    }
}
// ── Anti Delete ────────────────────────────────────────────────────────────

export async function handleAntiDelete(sock, msg) {
    if (!ANTI_DELETE) return;
    if (!msg.message?.protocolMessage) return;
    if (msg.message.protocolMessage.type !== 0) return;

    const deletedKey = msg.message.protocolMessage.key;

    const cache = readCache();
    const cached = cache[deletedKey.id];
    if (!cached) return;

    const senderName = cached.senderName || 'Unknown';

    try {
        await sock.sendMessage(cached.sender, {
            text: `You deleted "${cached.body}" I saw it 👀`
        });
    } catch (err) {
        console.error('❌ Anti-delete notify error:', err.message);
    }

    delete cache[deletedKey.id];
    writeCache(cache);
}
// ── Anti Link ─────────────────────────────────────────────────────────────

export async function handleAntiLink(sock, msg) {
    if (!ANTI_LINK) return false;

    const from = msg.key.remoteJid;
    if (!from.endsWith('@g.us')) return false;

    const body = getBody(msg);
    const links = body.match(/(?:https?:\/\/|www\.)[^\s]+|chat\.whatsapp\.com\/[^\s]+/gi);
    if (!links) return false;

    const sender = msg.key.participant;
    const senderNumber = sender?.split(':')[0].split('@')[0];

    if (msg.key.fromMe || senderNumber === OWNER_NUMBER) return false;

    const senderIsAdmin = await isSenderAdmin(sock, from, sender);
    if (senderIsAdmin) return false;

    const botIsAdmin = await isBotAdmin(sock, from);
    if (!botIsAdmin) return false;

    try {
        await sock.sendMessage(from, { delete: msg.key });
    } catch (err) {
        console.error('❌ AntiLink delete failed:', err.message);
    }

    try {
        await sock.sendMessage(from, {
            text: `404 Page Not Found! Are you happy now? 😂`
        }, { quoted: msg });
    } catch (err) {
        console.error('❌ AntiLink reply failed:', err.message);
    }

    return true;
}

export function registerAntiDelete(sock) {
    if (!ANTI_DELETE) return;

    sock.ev.on('messages.delete', async (item) => {
        const ownerJid = `${OWNER_NUMBER}@s.whatsapp.net`;
        const keys = item.keys || [];

    
        console.log('🗑️ messages.delete fired:', JSON.stringify(item));
    

        for (const key of keys) {
            if (key.fromMe) continue;

            const cache = readCache();
            const cached = cache[key.id];
            if (!cached) continue;

            const senderNumber = cached.sender?.split('@')[0].split(':')[0];

            try {
                await sock.sendMessage(ownerJid, {
                    text: `🕵️ @${senderNumber} deleted "${cached.body}" I saw it 👀`
                });
            } catch (err) {
                console.error('❌ Anti-delete notify error:', err.message);
            }

            delete cache[key.id];
            writeCache(cache);
        }
    });
}
// ── Mute enforcement ───────────────────────────────────────────────────────

export async function enforceMute(sock, msg) {
    const from = msg.key.remoteJid;
    if (!from.endsWith('@g.us')) return;
    if (msg.key.fromMe) return;

    const sender = msg.key.participant;
    if (!sender) return;

    const botIsAdmin = await isBotAdmin(sock, from);

    if (muteAll.get(from)) {
        if (botIsAdmin) {
            try {
                await sock.sendMessage(from, { delete: msg.key });
            } catch (err) {
                console.error('❌ MuteAll delete failed:', err.message);
            }
        }
        return;
    }

    if (mutedUsers.has(from) && mutedUsers.get(from).has(sender)) {
        if (botIsAdmin) {
            try {
                await sock.sendMessage(from, { delete: msg.key });
            } catch (err) {
                console.error('❌ Mute delete failed:', err.message);
            }
        }
    }
}

// ── Group Commands ─────────────────────────────────────────────────────────

export async function handleGroupCommand(sock, msg, command, args) {
    const from = msg.key.remoteJid;
    if (!from.endsWith('@g.us')) return false;

    const groupCmds = ['stalkall', 'stalk', 'kick', 'mute', 'unmute', 'muteall', 'unmuteall'];
    if (!groupCmds.includes(command)) return false;

    const sender = msg.key.participant;
    const senderNumber = sender?.split(':')[0].split('@')[0];
    const isOwner = msg.key.fromMe || senderNumber === OWNER_NUMBER;

    if (!isOwner) {
        try {
            await sock.sendMessage(sender, {
                text: `it's open source dude, CHECK IT OUT ON GITHUB:\n\n https://github.com/engineermarcus/lexluthor`
            });
        } catch (_) {}
        return true;
    }

    const botIsAdmin = await isBotAdmin(sock, from);
    const mentioned = getMentionedJid(msg);

    switch (command) {

        case 'stalkall': {
            try {
                const meta = await sock.groupMetadata(from);
                const botLid = sock.authState.creds.me?.lid?.split(':')[0].split('@')[0];
                const botPhone = sock.user.id.split(':')[0].split('@')[0];
                const members = meta.participants.filter(p => {
                    const pNumber = p.id.split(':')[0].split('@')[0];
                    return pNumber !== botLid && pNumber !== botPhone;
                });
                for (const member of members) {
                    try {
                        await sock.sendMessage(member.id, { text: STALK_MESSAGE });
                        await new Promise(r => setTimeout(r, 5000));
                    } catch (_) {}
                }
            } catch (err) {
                console.error('❌ stalkall error:', err.message);
            }
            break;
        }

        case 'stalk': {
            if (!mentioned) break;
            try {
                await sock.sendMessage(mentioned, { text: STALK_MESSAGE });
            } catch (err) {
                console.error('❌ stalk error:', err.message);
            }
            break;
        }

        case 'kick': {
            if (!mentioned) break;
            if (botIsAdmin) {
                try {
                    await sock.groupParticipantsUpdate(from, [mentioned], 'remove');
                } catch (err) {
                    console.error('❌ kick error:', err.message);
                }
            } else {
                try {
                    await sock.sendMessage(mentioned, { text: `You just lucky to be alive 😂` });
                } catch (err) {
                    console.error('❌ kick DM error:', err.message);
                }
            }
            break;
        }

        case 'mute': {
            if (!mentioned) break;
            if (!mutedUsers.has(from)) mutedUsers.set(from, new Set());
            mutedUsers.get(from).add(mentioned);
            if (!botIsAdmin) {
                try {
                    await sock.sendMessage(from, {
                        text: `You deserve to keep your mouth shut 🤐`,
                        mentions: [mentioned]
                    });
                } catch (_) {}
            }
            break;
        }

        case 'unmute': {
            if (!mentioned) break;
            if (mutedUsers.has(from)) {
                mutedUsers.get(from).delete(mentioned);
            }
            break;
        }

        case 'muteall': {
            muteAll.set(from, true);
            if (!botIsAdmin) {
                try {
                    await sock.sendMessage(from, {
                        text: `🔇 Not admin — can only delete my own messages`
                    });
                } catch (_) {}
            }
            break;
        }

        case 'unmuteall': {
            muteAll.set(from, false);
            mutedUsers.delete(from);
            break;
        }

        default:
            return false;
    }

    return true;
}