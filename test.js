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

export async function testInstagramScrape(username) {
    console.log(`🔍 Testing scrape for: ${username}`);
    
    const browser = await chromium.launch({ 
        headless: true,
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext();
    
    const cookies = parseCookies('./instagram_cookies.txt');
    await context.addCookies(cookies);
    
    const page = await context.newPage();
    
    await page.setExtraHTTPHeaders({
        'x-ig-app-id': '936619743392459',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    });
    
    try {
        const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
        
        const response = await page.goto(apiUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
        
        const jsonData = await response.json();
        
        if (jsonData?.data?.user) {
            return { success: true, user: jsonData.data.user };
        }

        return { success: false, error: 'No user data in response' };
        
    } catch (error) {
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
}

// Only runs when called directly: node test.js
if (process.argv[1].endsWith('test.js')) {
    testInstagramScrape('drake').then(result => {
        if (result.success) console.log(JSON.stringify(result.user, null, 2));
        else console.error('❌', result.error);
    });
}