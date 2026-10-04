import dns from 'dns';
import 'dotenv/config';

// Force DNS resolution using Google Public DNS resolvers to bypass local network DNS failures
dns.setServers(['8.8.8.8', '8.8.4.4']);

const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  // Intercept MongoDB Atlas connection hostname resolution calls
  if (hostname.includes('mongodb.net')) {
    dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        // Fallback to native DNS resolver in case resolve4 fails
        originalLookup(hostname, options, callback);
      } else {
        const address = addresses[0];
        const family = 4;
        
        // Wrap in array format if options.all flag is requested by the driver
        if (options.all) {
          callback(null, [{ address, family }]);
        } else {
          callback(null, address, family);
        }
      }
    });
  } else {
    // Forward standard requests (localhost, etc.) to native lookup
    originalLookup(hostname, options, callback);
  }
};
import app from './app.js';
import connectDB from './config/db.js';

const initialPort = parseInt(process.env.PORT || '5005', 10);

const startServerOnPort = async (portToTry) => {
  await connectDB();
  const server = app.listen(portToTry, () => {
    console.log(`🚀 VIMSA Backend running on http://localhost:${portToTry}`);
    console.log(`📡 API Base: http://localhost:${portToTry}/api/v1`);
    console.log(`🏥 Health: http://localhost:${portToTry}/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${portToTry} in use. Retrying on port ${portToTry + 1}...`);
      startServerOnPort(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServerOnPort(initialPort);
