const ipDetect = require('./ip-detector');
const HostManager = require('./host-manager');

const targetCdn = `assets-cdn.github.com`;

module.exports = async (domain = targetCdn) => {
  let { ip } = await ipDetect(domain);
  await new HostManager()
    .removeHost(ip, domain)
    .addHost(ip, domain)
    .writeHostFile();
  return Promise.resolve({ ip, domain });
};
