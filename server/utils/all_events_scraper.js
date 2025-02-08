const axios = require("axios");
const cheerio = require("cheerio");
const { convert } = require('html-to-text');

// Target URL
const baseURL = "https://currentaffairs.adda247.com/national-current-affairs/";

// Headers to simulate a real browser request
const headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

async function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}

// Function to scrape the main page for URLs & Dates
async function scrapeMainPage() {
    try {
        // Fetch the main page HTML
        const { data } = await axios.get(baseURL, { headers });
        const $ = cheerio.load(data);

        // Find the latest posts section
        const startUL = $("ul.lcp_catlist.latest_post.cat_list");
        const articles = [];

        // Extract links & dates
        startUL.find("li").each((index, element) => {
            const dateText = $(element).find("div.desc p").text().trim() || "Unknown Date";
            const articleURL = $(element).find("a").attr("href") || "No URL Found";

            articles.push({ date: dateText, url: articleURL });
        });

        console.log("\nExtracted Articles:");
        articles.forEach((article, index) => {
            console.log(`${index + 1}. Date: ${article.date}, URL: ${article.url}`);
        });

        console.log(`\nTotal Articles Found: ${articles.length}\n`);

        return articles;
    } catch (error) {
        console.error("Error fetching the main page:", error.message);
        return [];
    }
}

// Function to scrape each article for its content
async function scrapeArticleContent(url, index) {
    try {
        // Fetch the article HTML
        const { data } = await axios.get(url, { headers });
        const $ = cheerio.load(data);

        console.log(`\nScraping Article ${index + 1}: ${url}`);

        // Find the main content
        const contentDiv = $("div.col-md-8");

        if (contentDiv.length === 0) {
            console.log("Content not found!\n");
            return;
        }

        // Remove unwanted elements
        contentDiv.find("div.entry-meta, div.site-featured-image").remove();

        // Extract and clean content
        let contentHTML = contentDiv.html();

        // Remove everything after <footer class="entry-footer">
        const cutoffIndex = contentHTML.indexOf('<footer class="entry-footer">');
        if (cutoffIndex !== -1) {
            contentHTML = contentHTML.substring(0, cutoffIndex);
        }

        // Convert HTML to text
        const options = {
            wordwrap: 130,
            // ...
        };

        const contentText = convert(contentHTML, options);
        console.log("Converted Content:", contentText);
        console.log("-".repeat(100));

        return contentText;

    } catch (error) {
        console.error(`Error fetching article ${index + 1}:`, error.message);
    }
}

// Main function to run the scraper
(async function main() {
    const articles = await scrapeMainPage();

    for (let i = 0; i < articles.length; i++) {
        await scrapeArticleContent(articles[i].url, i);
    }
})();
