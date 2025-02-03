require('dotenv').config();

const axios = require('axios');

const serperResourceService = async (query) => {
    

let data = JSON.stringify({
  "q": `resources on the topic: ${query}`,
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
    
    // console.log(JSON.stringify(response.data));
    return JSON.stringify(response.data);
  }
  catch (error) {
    console.log(error);
  }
}

return makeRequest();
// console.log('a', a);

}

// serperResourceService('how to tie a tie');

module.exports = { serperResourceService };