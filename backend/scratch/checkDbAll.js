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
  // Connect to cluster root without specifying db to list databases
  const client = await mongoose.connect('mongodb+srv://VIMSA_db_user:VIMSA%402512@cluster0.mgpsf2t.mongodb.net/?appName=Cluster0');
  console.log('CONNECTED TO MONGO CLUSTER');
  
  const adminDb = mongoose.connection.useDb('admin');
  const dbs = await adminDb.db.admin().listDatabases();
  console.log('DATABASES LIST:');
  console.log(JSON.stringify(dbs, null, 2));

  for (const dbInfo of dbs.databases) {
    const dbName = dbInfo.name;
    if (['admin', 'local', 'config'].includes(dbName)) continue;
    
    console.log(`\n--- INSPECTING DATABASE: ${dbName} ---`);
    const db = mongoose.connection.useDb(dbName);
    const collections = await db.db.listCollections().toArray();
    
    for (const col of collections) {
      const docCount = await db.collection(col.name).countDocuments();
      console.log(`  Collection: ${col.name} | Count: ${docCount}`);
      if (col.name === 'orders' && docCount > 0) {
        const sampleOrders = await db.collection(col.name).find().limit(2).toArray();
        console.log('  Sample Orders:', JSON.stringify(sampleOrders, null, 2));
      }
    }
  }

  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
