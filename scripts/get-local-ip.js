const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

const ip = getLocalIP();
console.log('\n🍺 The Squad App\n');
console.log('Local:   http://localhost:3000');
console.log(`Mobile:  http://${ip}:3000`);
console.log('\nTo test on mobile, make sure your phone is on the same WiFi network!\n');

