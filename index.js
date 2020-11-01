const { post } = require('request-promise');

(async ()=> {

    const request = require('request-promise');
    const sleep = require('sleep-promise');
    const dotenv = require('dotenv');
    dotenv.config()

    const endpoint = 'https://api.cloudflare.com/client/v4';
    // PATCH zones/:zone_identifier/dns_records/:identifier

    const zoneId = process.env.ZONE_ID;
    const id = process.env.DNS_RECORD_ID;
    const scKey = process.env.SCKEY;
    const authEmail =  process.env.AUTH_EMAIL;
    const authKey = process.env.AUTH_KEY;
    const domain = process.env.DOMAIN;

    const shell = async (cmd) => {
        const exec = require('child_process').exec;
        return new Promise((resolve, reject) => {
         exec(cmd, (error, stdout, stderr) => {
          if (error) {
           reject(error ? stderr : stdout);
          }
          resolve(stdout? stdout : stderr);
         });
        });
    }

    const retry = async (attemptTimes, duration, fn, args) => {
        for (let i = 0; i < attemptTimes; i += 1) {
            try {
                const result = await fn(...args);
                return result;
            } catch (err) {
                if (i >= attemptTimes - 1) {
                    throw err;
                }
                console.warn({
                    message: 'attempt unseccessfully',
                    detail: {attemptTimes: i + 1, err_message: err.message},
                });
                await sleep(duration);
            }
        }
        throw new Error('attemptTimes must be greater than 0');
    }


    const notify = async (title, description) => {
       const desp = description.replace(/[\n\r]/g, '\n\n');
        const params = {
          method: 'post',
          url: `https://sc.ftqq.com/${scKey}.send`,
          body: `text=${title}&desp=${desp}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
        await request(params);
    }

    const updateDNS = async(ip) => {
        const params = {
            url : `${endpoint}/zones/${zoneId}/dns_records/${id}`,
            method: 'PATCH',
            json: true,
            headers: {
                'X-Auth-Email' : authEmail,
                'X-Auth-Key': authKey,
            },
            body : {
                "type":"AAAA",
                "name":domain,
                "content": ip,
                "ttl":120,
                "proxied":false
            }
        }
        await request(params);
    }

    try {
        const command = "ip -6 addr | grep -v fe80 | grep 'scope global dynamic mngtmpaddr noprefixroute' | awk '{print $2}'";
        const ip = await shell(command);
        await retry(3, 3000, updateDNS, [ip.replace('/64', '')]);
        await notify('DNS_UPDATE_SUCCESS', ip);
    }catch (e) {
        await notify('DNS_UPDATE_FAILED', e.message);
    }
})()
