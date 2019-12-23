const ipDetect = require('./ip-detector');
const HostManager = require('./host-manager');

const targetCdn = `assets-cdn.github.com`;

module.exports = async (domain = targetCdn) => {
  let { ip } = await ipDetect(domain);
  return new HostManager().addHost(ip, domain).writeHostFile();
};
