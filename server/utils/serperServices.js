require('dotenv').config();

const axios = require('axios');

const serperResourceService = async (query) => {
    

let data = JSON.stringify({
  "q": `resources on the topic: ${query}`,
  "gl": "in"
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://google.serper.dev/search',
  headers: { 
    'X-API-KEY': process.env.SERPER_API_KEY, 
    'Content-Type': 'application/json'
  },
  data : data
};

async function makeRequest() {
  try {
    const response = await axios.request(config);
    
    console.log(JSON.stringify(response.data));

    // to filter response
    function extractTitlesAndLinks(data) {
      let result = [];
  
      // Extract from sitelinks array
      if (data.sitelinks && Array.isArray(data.sitelinks)) {
          data.sitelinks.forEach(link => {
              if (link.title && link.link) {
                  result.push({ title: link.title, link: link.link });
              }
          });
      }
  
      // Extract from organic object
      if (data.organic && Array.isArray(data.organic)) {
          data.organic.forEach(item => {
              if (item.title && item.link) {
                  result.push({ title: item.title, link: item.link });
              }
          });
      }
  
      // Extract from peoplealsoask array
      if (data.peoplealsoask && Array.isArray(data.peoplealsoask)) {
          data.peoplealsoask.forEach(item => {
              if (item.title && item.link) {
                  result.push({ title: item.title, link: item.link });
              }
          });
      }

      // Extract from topStories array
      if (data.topStories && Array.isArray(data.topStories)) {
        data.topStories.forEach(item => {
            if (item.title && item.link) {
                result.push({ title: item.title, link: item.link });
            }
        });
    }
  
      return result;
  }
  
  // Example usage:
  const filteredData = extractTitlesAndLinks(response.data);
  console.log(filteredData);

  return filteredData;
  
    // return JSON.stringify(response.data);
  }
  catch (error) {
    console.log(error);
  }
}

// makeRequest();
return makeRequest();
// console.log('a', a);

}

// serperResourceService('how to tie a tie');

module.exports = { serperResourceService };