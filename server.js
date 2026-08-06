const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================================
//  📦 ذخیره‌سازی ریفرال‌ها
// ============================================
const referrals = {};

// ============================================
//  📝 ثبت‌نام مستقیم از سایت
// ============================================
app.post('/api/register', (req, res) => {
  const { userId, refCode, timestamp } = req.body;
  
  console.log(`📝 Direct registration: ${userId} | Referred by: ${refCode}`);
  
  if (userId) {
    if (!referrals[refCode]) {
      referrals[refCode] = [];
    }
    
    if (!referrals[refCode].includes(userId)) {
      referrals[refCode].push(userId);
      console.log(`✅ New user: ${userId} | Referred by: ${refCode}`);
    } else {
      console.log(`⚠️ Duplicate: ${userId}`);
    }
  }
  
  res.json({ success: true, message: 'Registration saved' });
});

// ============================================
//  📊 API برای سایت
// ============================================
app.get('/api/referrals/:refCode', (req, res) => {
  const refCode = req.params.refCode;
  const data = referrals[refCode] || [];
  res.json({ success: true, count: data.length, referrals: data });
});

app.get('/api/stats', (req, res) => {
  let total = 0;
  for (const key in referrals) {
    total += referrals[key].length;
  }
  res.json({ success: true, totalRegistrations: total, totalReferrers: Object.keys(referrals).length });
});

app.get('/', (req, res) => {
  res.json({ status: 'online', service: 'Benula Webhook', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
