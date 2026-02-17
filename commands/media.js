// commands/media.js
import yts from 'yt-search';
import { downloadYouTube } from '../youtube/download.js';
import { scrapeInstagram } from '../instagram/ig.js';


export async function searchInstagram(sock, msg, args) {
    const username = args[0];
    
    if (!username) {
        await sock.sendMessage(msg.key.remoteJid, {
            text: 'Usage: .ig <username>'
        }, { quoted: msg });
        return;
    }
    
    await sock.sendMessage(msg.key.remoteJid, {
        text: `🔍 Searching @${username}...`
    }, { quoted: msg });
    
    const result = await scrapeInstagram(username);
    
    if (!result.success) {
        await sock.sendMessage(msg.key.remoteJid, {
            text: `${username} hasn't joined instagram yet`
        }, { quoted: msg });
        return;
    }
    
    const u = result.user;
    
    const text = `
📸 *Instagram Profile*

👤 *Username:* @${u.username}
📛 *Name:* ${u.full_name || 'N/A'}
📝 *Bio:* ${u.biography || 'N/A'}

👥 *Followers:* ${u.edge_followed_by?.count?.toLocaleString()}
➕ *Following:* ${u.edge_follow?.count?.toLocaleString()}
📷 *Posts:* ${u.edge_owner_to_timeline_media?.count?.toLocaleString()}

✅ *Verified:* ${u.is_verified ? 'Yes' : 'No'}
🔒 *Private:* ${u.is_private ? 'Yes' : 'No'}
💼 *Business:* ${u.is_business_account ? 'Yes' : 'No'}
📧 *Email:* ${u.business_email || 'N/A'}
📞 *Phone:* ${u.business_phone_number || 'N/A'}
🔗 *Website:* ${u.external_url || 'N/A'}
`.trim();
    
    await sock.sendMessage(msg.key.remoteJid, {
        image: { url: u.profile_pic_url_hd },
        caption: text
    }, { quoted: msg });
}

// .play - Audio with thumbnail
export async function playCommand(sock, msg, args) {
    const query = args.join(' ');
    
    if (!query) {
        await sock.sendMessage(msg.key.remoteJid, { 
            text: 'Usage: .play <query>' 
        });
        return;
    }
    
    await sock.sendMessage(msg.key.remoteJid, { 
        text: `🎵 Searching ${query}...` 
    }, { quoted: msg });
    
    try {
        const { videos } = await yts(query);
        const video = videos[0];
        
        if (!video) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ No results found' 
            }, { quoted: msg });
            return;
        }
        
        const result = await downloadYouTube(video.url, 'mp3');
        
        if (!result.success) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `❌ Download failed: ${result.error}` 
            }, { quoted: msg });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            audio: { url: result.file },
            mimetype: 'audio/mpeg',
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title: video.title,
                    body: `${video.author.name} • ${video.timestamp}`,
                    thumbnailUrl: video.thumbnail,
                    mediaType: 2,
                    mediaUrl: video.url,
                    sourceUrl: video.url
                }
            }
        });
        
    } catch (error) {
        console.error('Play command error:', error);
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `❌ Error: ${error.message}` 
        }, { quoted: msg });
    }
}

// .audio - Plain audio without thumbnail
export async function audioCommand(sock, msg, args) {
    const query = args.join(' ');
    
    if (!query) {
        await sock.sendMessage(msg.key.remoteJid, { 
            text: 'Usage: .audio <query>' 
        }, { quoted: msg });
        return;
    }
    
    await sock.sendMessage(msg.key.remoteJid, { 
        text: `🎵 Downloading audio ${query}` 
    }, { quoted: msg });
    
    try {
        const { videos } = await yts(query);
        const url = videos[0]?.url;
        
        if (!url) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ No results found' 
            }, { quoted: msg });
            return;
        }
        
        const result = await downloadYouTube(url, 'mp3');
        
        if (!result.success) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `❌ Download failed: ${result.error}` 
            }, { quoted: msg });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            audio: { url: result.file },
            mimetype: 'audio/mpeg'
        });
        
    } catch (error) {
        console.error('Audio command error:', error);
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `❌ Error: ${error.message}` 
        }, { quoted: msg });
    }
}

// .video or .mp4 - Video download
export async function videoCommand(sock, msg, args) {
    const query = args.join(' ');
    
    if (!query) {
        await sock.sendMessage(msg.key.remoteJid, { 
            text: 'Usage: .video <query> or .mp4 <query>' 
        },{ quoted: msg });
        return;
    }
    
    await sock.sendMessage(msg.key.remoteJid, { 
        text: `🎬 Downloading ${query}` 
    }, { quoted: msg });
    
    try {
        const { videos } = await yts(query);
        const video = videos[0];
        
        if (!video) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ No results found' 
            }, { quoted: msg });
            return;
        }

        // Download in WhatsApp-compatible format (no post-conversion needed)
        const result = await downloadYouTube(video.url, 'whatsapp');

        if (!result.success) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `❌ Download failed: ${result.error}` 
            }, { quoted: msg });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            video: { url: result.file },
            caption: `🎬 *${video.title}*\n\n👤 ${video.author.name}\n⏱️ ${video.timestamp}`,
            mimetype: 'video/mp4'
        });
        
    } catch (error) {
        console.error('Video command error:', error);
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `❌ Error: ${error.message}` 
        }, { quoted: msg });
    }
}