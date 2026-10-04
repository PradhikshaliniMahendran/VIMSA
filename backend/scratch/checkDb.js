import dns from 'dns';
import 'dotenv/config';

dns.setServers(['8.8.8.8', '8.8.4.4']);
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (hostname.includes('mongodb.net')) {
    dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        originalLookup(hostname, options, callback);
      } else {
        const address = addresses[0];
        const family = 4;
        if (options.all) {
          callback(null, [{ address, family }]);
        } else {
          callback(null, address, family);
        }
      }
    });
  } else {
    originalLookup(hostname, options, callback);
  }
};

import mongoose from 'mongoose';

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('CONNECTED TO MONGO');
  const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
  const count = await Order.countDocuments();
  console.log('ORDER COUNT:', count);
  const orders = await Order.find().limit(5);
  console.log('ORDERS:', JSON.stringify(orders, null, 2));
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
