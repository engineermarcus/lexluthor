// test3.js - Intercept real Instagram GraphQL queries
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

async function captureGraphQLQueries() {
    console.log(`🔍 Capturing live Instagram GraphQL queries...\n`);
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox']
    });
    
    const context = await browser.newContext();
    const cookies = parseCookies('./instagram_cookies.txt');
    await context.addCookies(cookies);
    
    const page = await context.newPage();
    
    const graphqlCalls = [];
    
    // Intercept all network requests
    page.on('request', async (request) => {
        const url = request.url();
        
        if (url.includes('/graphql/query') || url.includes('/api/graphql')) {
            const postData = request.postData();
            const headers = request.headers();
            
            graphqlCalls.push({
                url: url,
                method: request.method(),
                headers: headers,
                postData: postData,
                queryParams: new URL(url).searchParams.toString()
            });
        }
    });
    
    try {
        console.log('📡 Loading Instagram and browsing to capture queries...\n');
        
        // Visit home
        await page.goto('https://www.instagram.com/', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
        
        await page.waitForTimeout(3000);
        
        // Visit a profile
        await page.goto('https://www.instagram.com/instagram/', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
        
        await page.waitForTimeout(3000);
        
        // Click around to trigger more queries
        try {
            await page.click('a[href*="/explore/"]').catch(() => {});
            await page.waitForTimeout(2000);
        } catch {}
        
        console.log(`✅ Captured ${graphqlCalls.length} GraphQL calls:\n`);
        
        for (const call of graphqlCalls) {
            console.log('─────────────────────────');
            console.log('URL:', call.url);
            console.log('Method:', call.method);
            if (call.queryParams) console.log('Params:', call.queryParams);
            if (call.postData) console.log('Body:', call.postData.substring(0, 200));
            console.log('─────────────────────────\n');
        }
        
        // Save to file
        fs.writeFileSync('./graphql_calls.json', JSON.stringify(graphqlCalls, null, 2));
        console.log('💾 Saved to graphql_calls.json');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
}

captureGraphQLQueries();