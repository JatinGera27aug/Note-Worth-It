const axios = require("axios");
const cheerio = require("cheerio");
const { convert } = require('html-to-text');

// Simulate a browser request to avoid bot detection
const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
};

// Target URL
// const url = "https://currentaffairs.adda247.com/2025/02/";   -- monthly wale kuch jo aate 10 wo done,,, ise daily basis pr update
//  cronjob lgakar bas aaj ki date se 1 din pehle wali likh kar done
// https://currentaffairs.adda247.com/latest-posts/    -- like saare hi hain, par pagination lgegi so selenium shyd use krni pde

// https://currentaffairs.adda247.com/national-current-affairs/ -- ye sirf national wale, jo krna chaiye mujhe retrieve, pagination hai but shyad na lgani pde

async function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
}

// Function to scrape article links
const getArticleLinks = async (url) => {
    try {
        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);

        // Find all <p> tags with class 'link-more'
        const articleLinks = [];
        $("p.link-more a").each((_, element) => {
            const link = $(element).attr("href");
            if (link) {
                articleLinks.push(link);
            }
        });

        return articleLinks;
    } catch (error) {
        console.error("Error fetching main page:", error.message);
        return [];
    }
};

// Function to scrape individual article content
const getArticleContent = async (articleUrl) => {
    try {
        const response = await axios.get(articleUrl, { headers });
        const $ = cheerio.load(response.data);

        const contentDiv = $("div.col-md-8");
        if (contentDiv.length === 0) {
            console.log("Content not found for:", articleUrl);
            return null;
        }

        // Remove unwanted divs
        contentDiv.find("div.entry-meta, div.site-featured-image, header.entry-header").remove();

        // Extract and clean content
        let contentHtml = contentDiv.html();
        const cutoffIndex = contentHtml.indexOf('<footer class="entry-footer">');
        if (cutoffIndex !== -1) {
            contentHtml = contentHtml.substring(0, cutoffIndex);
        }

        // console.log("Scraped Content:", contentHtml);
        console.log("-".repeat(100));

        // Convert HTML to text
        const options = {
            wordwrap: 130,
            // ...
          };

        const contentText = convert(contentHtml, options);
        console.log("Converted Content:", contentText);
        console.log("-".repeat(100));

        return contentText;
    } catch (error) {
        console.error(`Error fetching content for ${articleUrl}:`, error.message);
        return null;
    }
};

// Main function to scrape all articles
const scrapeArticles = async (url) => {
    const articleLinks = await getArticleLinks(url);
    if (articleLinks.length === 0) return { message: "No articles found." };

    const articles = [];

    for (let i = 0; i < Math.min(8, articleLinks.length); i++) {
        const articleTitle = await titleCase(articleLinks[i].slice(35, -1));
        const content = await getArticleContent(articleLinks[i]);

        if (content) {
            articles.push({
                title: articleTitle,
                url: articleLinks[i],
                content
            });
        }
    }

    return articles;
};


// Run the scraper
// scrapeArticles();

module.exports = { scrapeArticles };