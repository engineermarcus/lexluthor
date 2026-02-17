// test4.js - Use captured doc_ids to test phone lookup
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

async function testPhoneLookupEndpoints(phoneNumber) {
    console.log(`🔍 Testing phone lookup endpoints for: ${phoneNumber}\n`);
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox']
    });
    
    const context = await browser.newContext();
    const cookies = parseCookies('./instagram_cookies.txt');
    await context.addCookies(cookies);
    
    const page = await context.newPage();
    
    // Set headers
    await page.setExtraHTTPHeaders({
        'x-ig-app-id': '936619743392459',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    });
    
    try {
        // Test different potential endpoints
        const endpoints = [
            `https://www.instagram.com/api/v1/users/lookup/${phoneNumber}/`,
            `https://www.instagram.com/api/v1/users/lookup_phone/${phoneNumber}/`,
            `https://www.instagram.com/api/v1/web/friendships/lookup/${phoneNumber}/`,
            `https://www.instagram.com/api/v1/users/phone_lookup/?phone=${phoneNumber}`,
            `https://www.instagram.com/contacts/prefill/?phone=${phoneNumber}`,
        ];
        
        for (const endpoint of endpoints) {
            console.log(`📡 Testing: ${endpoint}`);
            
            try {
                const response = await page.goto(endpoint, {
                    waitUntil: 'domcontentloaded',
                    timeout: 10000
                });
                
                const status = response.status();
                console.log(`   Status: ${status}`);
                
                if (status === 200) {
                    try {
                        const json = await response.json();
                        console.log(`   ✅ SUCCESS!`);
                        console.log(JSON.stringify(json, null, 2));
                    } catch {
                        const text = await response.text();
                        console.log(`   Response:`, text.substring(0, 300));
                    }
                } else if (status === 404) {
                    console.log(`   404 Not Found`);
                } else if (status === 400) {
                    const text = await response.text();
                    console.log(`   400 Bad Request:`, text.substring(0, 200));
                }
            } catch (err) {
                console.log(`   ❌ Error: ${err.message}`);
            }
            
            console.log('');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
}

const phoneNumber = process.argv[2] || '254725693306';
testPhoneLookupEndpoints(phoneNumber);