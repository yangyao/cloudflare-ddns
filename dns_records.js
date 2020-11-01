(async ()=> {
    const request = require('request-promise');
    const dotenv = require('dotenv');
    dotenv.config()

    const endpoint = 'https://api.cloudflare.com/client/v4';

    const zoneId = process.env.ZONE_ID;
    const authEmail =  process.env.AUTH_EMAIL;
    const authKey = process.env.AUTH_KEY;

    const params = {
        method: 'GET',
        url: `${endpoint}/zones/${zoneId}/dns_records`,
        json: true,
        headers: {
            'X-Auth-Email' : authEmail,
            'X-Auth-Key': authKey,
        }
    }
    const response = await request(params);
    console.log( response);

})()