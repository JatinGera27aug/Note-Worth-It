const {createClient} = require('redis');
const dotenv = require('dotenv');
dotenv.config()

const client = createClient({
    username: 'default',
    password: 'ScIVbzNtfIRmyF42iqBHonf0FOrhRy2d',
    socket: {
        host: 'redis-12228.c305.ap-south-1-1.ec2.redns.redis-cloud.com' || process.env.REDIS_HOST,
        port: 12228 || process.env.REDIS_PORT
    }
});

client.on('error', err => console.log('Redis Client Error', err));

client.connect();

module.exports = client;