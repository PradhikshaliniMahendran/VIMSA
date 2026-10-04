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

// Login and get token, then call stats
const API = 'http://localhost:5000/api/v1';

const login = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@vimsa.com', password: 'Password123!' })
});
const loginData = await login.json();
if (!loginData.success) {
  console.log('Login failed:', loginData.message);
  process.exit(1);
}

const token = loginData.data.accessToken;
console.log('Login OK. Token:', token?.slice(0,30) + '...');

const stats = await fetch(`${API}/admin/stats`, {
  headers: { Authorization: `Bearer ${token}` }
});
const statsData = await stats.json();
console.log('\n=== ADMIN STATS ===');
console.log(JSON.stringify(statsData, null, 2));
process.exit(0);
