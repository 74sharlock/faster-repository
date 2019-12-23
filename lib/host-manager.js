const { readFileSync } = require('fs');
const { platform, EOL } = require('os');
const sudo = require('sudo-prompt');

const isWin = platform() === 'win32';
const hostsPath = isWin
  ? 'C:/Windows/System32/drivers/etc/hosts'
  : '/etc/hosts';

const _getStrArr = () =>
  readFileSync(hostsPath, 'utf8')
    .split(EOL)
    .filter(item => item.trim() !== '');

class HostManager {
  constructor() {
    this.strArr = _getStrArr();
    Object.defineProperty(this, 'hostList', {
      get() {
        return this.strArr
          .filter(str => /^\d|#\d|::/.test(str))
          .map(str => {
            let arr = str.trim().split(/\s+/);
            let address = arr[1];
            let disabled = /^#/.test(arr[0]);
            let ip = disabled ? arr[0].replace('#', '') : arr[0];
            return { ip, address, disabled };
          });
      }
    });
  }

  writeHostFile() {
    let command;
    if (isWin) {
      let string = this.strArr
        .join(' && echo ')
        .trim()
        .replace(/([\(\)])/g, '^$1');
      command = `(echo ${string}) > ${hostsPath}`;
    } else {
      let string = this.strArr.join(EOL).trim();
      command = `echo '${string}' > ${hostsPath}`;
    }
    return new Promise(resolve => {
      sudo.exec(`${command}`, { name: 'FasterRepo' }, function(
        error,
        stdout,
        stderr
      ) {
        if (error) throw error;
        return resolve({ code: 200, message: 'ok' });
      });
    });
  }

  addHost(ip, address) {
    this.removeHost(ip, address);
    this.strArr.push(`${ip} ${address}`);
    return this;
  }

  removeHost(ip, address) {
    let index = this.strArr.findIndex(str => {
      let ipReg = new RegExp(`^#?${ip}`);
      let addressReg = new RegExp(`${address}`);
      return ipReg.test(str) && addressReg.test(str);
    });
    if (index > -1) {
      this.strArr.splice(index, 1);
    }
    return this;
  }

  enableHost(ip, address) {
    let host = this.hostList.find(
      item => item.ip === ip && item.address === address
    );
    if (host) {
      if (host.disabled) {
        this.strArr = this.strArr.map(str => {
          let ipReg = new RegExp(`^#${ip}`);
          let addressReg = new RegExp(`${address}`);
          if (ipReg.test(str) && addressReg.test(str)) {
            return str.replace('#', '');
          } else {
            return str;
          }
        });
      } else {
        console.log(`${ip}:${address} is enabled already!`);
      }
    } else {
      this.addHost(ip, address);
    }
    return this;
  }

  disableHost(ip, address) {
    let host = this.hostList.find(
      item => item.ip === ip && item.address === address
    );
    if (host) {
      if (!host.disabled) {
        this.strArr = this.strArr.map(str => {
          let ipReg = new RegExp(`^${ip}`);
          let addressReg = new RegExp(`${address}`);
          if (ipReg.test(str) && addressReg.test(str)) {
            return '#' + str;
          } else {
            return str;
          }
        });
      } else {
        console.log(`${ip}:${address} is disabled already!`);
      }
    } else {
      console.log(`can not find ${ip}:${address}!`);
    }
    return this;
  }
}

module.exports = HostManager;
