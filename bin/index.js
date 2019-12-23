#!/usr/bin/env node

const fn = require('../lib');

(async () => {
  await fn();
  console.log('done');
})();
