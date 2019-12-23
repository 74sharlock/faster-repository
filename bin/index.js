#!/usr/bin/env node

const fn = require('../lib');

(async () => {
  let { ip, domain } = await fn();
  console.log('done.');
  console.log(`[${ip} => ${domain}] has been added to your hosts file.`);
})();
