// test4.js - Extract data from contacts/prefill endpoint
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

async function extractDataFromContactsPrefill(phoneNumber) {
    console.log(`🔍 Extracting data from contacts/prefill for: ${phoneNumber}\n`);
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox']
    });
    
    const context = await browser.newContext();
    const cookies = parseCookies('./instagram_cookies.txt');
    await context.addCookies(cookies);
    
    const page = await context.newPage();
    
    await page.setExtraHTTPHeaders({
        'x-ig-app-id': '936619743392459',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    try {
        await page.goto(`https://www.instagram.com/contacts/prefill/?phone=${phoneNumber}`, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        
        await page.waitForTimeout(2000);
        
        // Extract any JSON data embedded in the page
        const data = await page.evaluate(() => {
            // Look for JSON in script tags
            const scripts = document.querySelectorAll('script');
            const jsonData = [];
            
            for (const script of scripts) {
                const text = script.textContent;
                
                // Look for user data patterns
                if (text && (text.includes('user') || text.includes('phone') || text.includes('username'))) {
                    // Try to find JSON objects
                    const matches = text.match(/\{[^{}]*"[^"]*"[^{}]*:[^{}]*\}/g);
                    if (matches) {
                        for (const match of matches) {
                            try {
                                const parsed = JSON.parse(match);
                                if (parsed.username || parsed.full_name || parsed.pk) {
                                    jsonData.push(parsed);
                                }
                            } catch {}
                        }
                    }
                }
            }
            
            return {
                title: document.title,
                jsonData: jsonData,
                pageText: document.body.innerText.substring(0, 500)
            };
        });
        
        console.log('📄 Page title:', data.title);
        console.log('\n📝 Page text sample:');
        console.log(data.pageText);
        
        if (data.jsonData.length > 0) {
            console.log('\n✅ Found user data:');
            console.log(JSON.stringify(data.jsonData, null, 2));
        } else {
            console.log('\n❌ No structured user data found in page');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
}

const phoneNumber = process.argv[2] || '254725693306';
extractDataFromContactsPrefill(phoneNumber);