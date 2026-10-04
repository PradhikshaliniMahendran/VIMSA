import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import 'dotenv/config';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';

let isConnected = false;
const startDb = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

export default async (req, res) => {
  await startDb();
  return app(req, res);
};
