const dns = require('dns');

module.exports = function(domain) {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, function(err, ip, family) {
      if (err) {
        return reject(err);
      } else {
        return resolve({ ip, family });
      }
    });
  });
};
