const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================================
//  📦 ذخیره‌سازی ریفرال‌ها در حافظه
// ============================================
const referrals = {};

// ============================================
//  🤖 Webhook - پردازش همه پیام‌های گروه
// ============================================
app.post('/webhook', (req, res) => {
  // ✅ پاسخ فوری به تلگرام
  res.status(200).send('OK');
  
  // پردازش در پس‌زمینه
  setImmediate(() => {
    try {
      const update = req.body;
      console.log('📩 Webhook received:', new Date().toISOString());
      
      // بررسی وجود پیام
      if (update.message && update.message.text) {
        const text = update.message.text;
        
        // ============================================
        //  🎯 پردازش هر پیامی که شامل کلمه کلیدی باشه
        // ============================================
        if (text.includes('New Benula registration!')) {
          console.log('🎯 Registration message detected!');
          
          // استخراج اطلاعات
          const userIdMatch = text.match(/🆔 User ID: (\w+)/);
          const refMatch = text.match(/🔗 Referral Code: (\w+)/);
          
          if (userIdMatch && refMatch) {
            const newUserId = userIdMatch[1];
            const refCode = refMatch[1];
            
            // ذخیره ریفرال
            if (!referrals[refCode]) {
              referrals[refCode] = [];
            }
            
            // جلوگیری از ثبت تکراری
            if (!referrals[refCode].includes(newUserId)) {
              referrals[refCode].push(newUserId);
              console.log(`✅ New user: ${newUserId} | Referred by: ${refCode}`);
              console.log(`📊 Total: ${referrals[refCode].length} referrals for ${refCode}`);
            } else {
              console.log(`⚠️ Duplicate registration: ${newUserId}`);
            }
          } else {
            console.log('⚠️ Could not extract userId or refCode from message');
          }
        } else {
          console.log('⏩ Ignoring non-registration message');
        }
      }
    } catch (error) {
      console.error('❌ Webhook error:', error);
    }
  });
});

// ============================================
//  📊 API برای سایت اصلی
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

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Benula Webhook',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ============================================
//  🚀 راه‌اندازی سرور
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
  console.log(`📊 Stats: https://benula-webhook-production.up.railway.app/api/stats`);
});
