const puppeteer = require('puppeteer');


async function getFirstGoogleResult(searchQuery) {
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Navigate to Google
        await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });

        // Handle cookie consent
        try {
            await page.waitForSelector('#L2AGLb', { timeout: 2000 });
            await page.click('#L2AGLb');
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        } catch(err) {
            // Cookie consent not found, continue
            console.log('Cookie consent not found:', err);
        }

        // Type search query
        await page.type('textarea[name="q"]', searchQuery);
        await page.keyboard.press('Enter');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Extract first result URL
        const firstResult = await page.$('div.g a');
        const url = await page.evaluate(el => el.href, firstResult);
        console.log('First Google result:', url);
        return url;
    } catch (error) {
        console.error('Scraping failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}
    

module.exports = { getFirstGoogleResult };
