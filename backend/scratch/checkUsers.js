import dns from 'dns';
import 'dotenv/config';

dns.setServers(['8.8.8.8', '8.8.4.4']);
const orig = dns.lookup;
dns.lookup = (h, o, cb) => {
  if (typeof o === 'function') { cb = o; o = {}; }
  if (h.includes('mongodb.net')) {
    dns.resolve4(h, (e, a) => {
      if (e || !a?.length) return orig(h, o, cb);
      o.all ? cb(null, [{ address: a[0], family: 4 }]) : cb(null, a[0], 4);
    });
  } else { orig(h, o, cb); }
};

import mongoose from 'mongoose';

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const users = await User.find().select('-password');
  console.log('ALL USERS:', JSON.stringify(users, null, 2));
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
