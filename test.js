import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

chromium.use(StealthPlugin());

function parseCookies(cookieFile) {
    const cookies = [];
    const lines = fs.readFileSync(cookieFile, 'utf-8').split('\n');
    
    for (const line of lines) {
        if (line.startsWith('#') || !line.trim()) continue;
        
        const parts = line.split('\t');
        if (parts.length < 7) continue;
        
        cookies.push({
            name: parts[5],
            value: parts[6],
            domain: parts[0],
            path: parts[2],
            expires: parts[4] === '0' ? -1 : parseInt(parts[4]),
            httpOnly: parts[1] === 'TRUE',
            secure: parts[3] === 'TRUE',
            sameSite: 'Lax'
        });
    }
    
    return cookies;
}

async function testInstagramScrape(username) {
    console.log(`🔍 Testing scrape for: ${username}`);
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox']
    });
    
    const context = await browser.newContext();
    
    const cookies = parseCookies('./instagram_cookies.txt');
    await context.addCookies(cookies);
    
    const page = await context.newPage();
    
    // Set required headers for Instagram API
    await page.setExtraHTTPHeaders({
        'x-ig-app-id': '936619743392459', // Instagram web app ID (constant)
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    });
    
    try {
        // Use Instagram's hidden API endpoint
        const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
        
        const response = await page.goto(apiUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
        
        const jsonData = await response.json();
        
        if (jsonData && jsonData.data && jsonData.data.user) {
            const user = jsonData.data.user;
            
            console.log('\n✅ Profile found:');
            console.log('Username:', user.username);
            console.log('Full name:', user.full_name);
            console.log('Biography:', user.biography);
            console.log('Followers:', user.edge_followed_by?.count);
            console.log('Following:', user.edge_follow?.count);
            console.log('Posts:', user.edge_owner_to_timeline_media?.count);
            console.log('Is private:', user.is_private);
            console.log('Is verified:', user.is_verified);
            console.log('Profile pic:', user.profile_pic_url_hd);
            
            // Full data
            console.log('\n📦 Full JSON:');
            console.log(JSON.stringify(user, null, 2));
        } else {
            console.log('❌ No user data in response');
            console.log('Response:', JSON.stringify(jsonData, null, 2));
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
}

testInstagramScrape('neiman_me');