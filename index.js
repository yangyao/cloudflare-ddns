(async () => {
  const request = require('request-promise');
  const sleep = require('sleep-promise');
  const util = require('util');
  const exec = util.promisify(require('child_process').exec);
  const dotenv = require('dotenv');
  dotenv.config();

  const endpoint = 'https://api.cloudflare.com/client/v4';

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
          detail: { attemptTimes: i + 1, err_message: err.message },
        });
        await sleep(duration);
      }
    }
    throw new Error('attemptTimes must be greater than 0');
  };

  const notify = async (scKey, title, description) => {
    const desp = description.replace(/[\n\r]/g, '\n\n');
    const params = {
      method: 'post',
      url: `https://sc.ftqq.com/${scKey}.send`,
      body: `text=${title}&desp=${desp}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    await request(params);
  };

  const getDNS = async (credentails) => {
    const params = {
      method: 'GET',
      url: `${endpoint}/zones/${credentails.zoneId}/dns_records`,
      json: true,
      headers: {
        'X-Auth-Email': credentails.authEmail,
        'X-Auth-Key': credentails.authKey,
      },
    };
    const response = await request(params);
    for (const item of response.result) {
      if (item.type === credentails.type && credentails.domain === item.name) return item;
    }
    return null;
  };

  const createDNS = async (credentails, ip) => {
    const params = {
      url: `${endpoint}/zones/${credentails.zoneId}/dns_records`,
      method: 'POST',
      json: true,
      headers: {
        'X-Auth-Email': credentails.authEmail,
        'X-Auth-Key': credentails.authKey,
      },
      body: {
        type: credentails.type,
        name: credentails.domain,
        content: ip,
        ttl: 120,
        proxied: false,
      },
    };
    const response = await request(params);
    return response.result;
  };

  const updateDNS = async (credentails, id, ip) => {
    const params = {
      url: `${endpoint}/zones/${credentails.zoneId}/dns_records/${id}`,
      method: 'PATCH',
      json: true,
      headers: {
        'X-Auth-Email': credentails.authEmail,
        'X-Auth-Key': credentails.authKey,
      },
      body: {
        type: credentails.type,
        name: credentails.domain,
        content: ip,
        ttl: 120,
        proxied: false,
      },
    };
    await request(params);
  };

  const fire = async () => {
    const credentails = {
      zoneId: process.env.ZONE_ID,
      scKey: process.env.SCKEY,
      authEmail: process.env.AUTH_EMAIL,
      authKey: process.env.AUTH_KEY,
      domain: process.env.DOMAIN,
      type: process.env.DOMAIN_TYPE || 'AAAA',
    };
    try {
      const command = process.env.COMMAND || "ip -6 addr | grep -v fe80 | grep 'scope global dynamic mngtmpaddr noprefixroute' | awk '{print $2}'";
      const { stdout, stderr } = await exec(command);
      if (stderr) throw new Error(`${stderr}`);
      if (!stdout) throw new Error('ip address is empty, may need to update your command.');
      const ip = stdout.replace('/64', '').trim();
      console.log(`successful get local ip address : ${ip}`);
      let record = await getDNS(credentails);
      if (!record) {
        console.log('failed to get DNS record, will create a new one');
        record = await createDNS(credentails, ip);
        console.log(`successful create a new DNS record : ${record.id}`);
      }
      if (record.content === ip) {
        console.log('ip not change, will not update DNS record.');
        return;
      }
      await updateDNS(credentails, record.id, ip);
      console.log('successful update DNS record.');
      await notify(credentails.scKey, 'DNS_UPDATE_SUCCESS', ip);
    } catch (e) {
      console.log('failed to update DNS record.');
      await notify(credentails.scKey, 'DNS_UPDATE_FAILED', e.message || 'unkonw error.');
    }
  };

  await retry(3, 3000, fire, []);
})();
