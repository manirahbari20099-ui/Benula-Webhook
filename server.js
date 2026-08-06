const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================================
//  📂 تنظیمات Volume
// ============================================
const DATA_FILE = path.join('/app/data', 'referrals.json');

// تابع خواندن اطلاعات از فایل
function loadReferrals() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
  return {};
}

// تابع ذخیره اطلاعات در فایل
function saveReferrals(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('💾 Data saved to Volume');
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

// ============================================
//  📦 بارگذاری اطلاعات از Volume
// ============================================
let referrals = loadReferrals();
console.log(`📊 Loaded ${Object.keys(referrals).length} referral codes`);

// ============================================
//  📝 ثبت‌نام مستقیم
// ============================================
app.post('/api/register', (req, res) => {
  const { userId, refCode, timestamp } = req.body;
  
  console.log(`📝 Registration: ${userId} | Referred by: ${refCode}`);
  
  if (userId) {
    if (!referrals[refCode]) {
      referrals[refCode] = [];
    }
    
    if (!referrals[refCode].includes(userId)) {
      referrals[refCode].push(userId);
      saveReferrals(referrals); // 💾 ذخیره خودکار روی Volume
      console.log(`✅ New user: ${userId} | Referred by: ${refCode}`);
    }
  }
  
  res.json({ success: true });
});

// ============================================
//  📊 API
// ============================================
app.get('/api/referrals/:refCode', (req, res) => {
  const refCode = req.params.refCode;
  const data = referrals[refCode] || [];
  
  res.json({
    success: true,
    refCode: refCode,
    count: data.length,
    referrals: data
  });
});

app.get('/api/stats', (req, res) => {
  let total = 0;
  for (const key in referrals) {
    total += referrals[key].length;
  }
  
  res.json({
    success: true,
    totalRegistrations: total,
    totalReferrers: Object.keys(referrals).length,
    lastUpdate: new Date().toISOString()
  });
});

app.get('/api/all-users', (req, res) => {
  const allUsers = [];
  for (const refCode in referrals) {
    referrals[refCode].forEach(userId => {
      allUsers.push({ userId, refCode });
    });
  }
  
  res.json({
    success: true,
    total: allUsers.length,
    users: allUsers,
    referrals: referrals
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Benula Webhook',
    version: '1.0.0'
  });
});

// ============================================
//  🚀 راه‌اندازی
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
  console.log(`📂 Data file: ${DATA_FILE}`);
});
