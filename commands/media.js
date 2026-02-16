// commands/media.js
import yts from 'yt-search';
import { downloadYouTube } from '../youtube/download.js';
//import { OWNER_NUMBER } from '../settings.js';

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
        text: '🎵 Searching...' 
    });
    
    try {
        // Search
        const { videos } = await yts(query);
        const video = videos[0];
        
        if (!video) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ No results found' 
            });
            return;
        }
        
        // Download audio
        const result = await downloadYouTube(video.url, 'mp3');
        
        if (!result.success) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `❌ Download failed: ${result.error}` 
            });
            return;
        }
        
        // Send audio with thumbnail
        // In playCommand:
await sock.sendMessage(msg.key.remoteJid, {
    audio: { url: result.file },
    mimetype: 'audio/mpeg',
    ptt: false,
    contextInfo: {
        externalAdReply: {
            title: video.title,
            body: `${video.author.name} • ${video.timestamp}`,
            thumbnailUrl: video.thumbnail,  // Just use the URL directly
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
        });
    }
}

// .audio - Plain audio without thumbnail
export async function audioCommand(sock, msg, args) {
    const query = args.join(' ');
    
    if (!query) {
        await sock.sendMessage(msg.key.remoteJid, { 
            text: 'Usage: .audio <query>' 
        });
        return;
    }
    
    await sock.sendMessage(msg.key.remoteJid, { 
        text: '🎵 Downloading audio...' 
    });
    
    try {
        // Search
        const { videos } = await yts(query);
        const url = videos[0]?.url;
        
        if (!url) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ No results found' 
            });
            return;
        }
        
        // Download audio
        const result = await downloadYouTube(url, 'mp3');
        
        if (!result.success) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `❌ Download failed: ${result.error}` 
            });
            return;
        }
        
        // Send plain audio
        await sock.sendMessage(msg.key.remoteJid, {
            audio: { url: result.file },
            mimetype: 'audio/mpeg'
        });
        
    } catch (error) {
        console.error('Audio command error:', error);
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `❌ Error: ${error.message}` 
        });
    }
}

// .video or .mp4 - Video download
export async function videoCommand(sock, msg, args) {
    const query = args.join(' ');
    
    if (!query) {
        await sock.sendMessage(msg.key.remoteJid, { 
            text: 'Usage: .video <query> or .mp4 <query>' 
        });
        return;
    }
    
    await sock.sendMessage(msg.key.remoteJid, { 
        text: '🎬 Downloading video...' 
    });
    
    try {
        // Search
        const { videos } = await yts(query);
        const video = videos[0];
        
        if (!video) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ No results found' 
            });
            return;
        }
        
        // Download video
        const result = await downloadYouTube(video.url, 'mp4');
        
        if (!result.success) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `❌ Download failed: ${result.error}` 
            });
            return;
        }
        
        // Send video with caption
        await sock.sendMessage(msg.key.remoteJid, {
            video: { url: result.file },
            caption: `🎬 *${video.title}*\n\n👤 ${video.author.name}\n⏱️ ${video.timestamp}`,
            mimetype: 'video/mp4'
        });
        
    } catch (error) {
        console.error('Video command error:', error);
        await sock.sendMessage(msg.key.remoteJid, { 
            text: `❌ Error: ${error.message}` 
        });
    }
}