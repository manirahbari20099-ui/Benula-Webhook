const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// ============================================
//  📦 ذخیره‌سازی در حافظه (برای تست)
// ============================================
const referrals = {};

// ============================================
//  🤖 Webhook - تلگرام به اینجا پیام می‌فرستد
// ============================================
app.post('/webhook', (req, res) => {
  // ✅ پاسخ فوری به تلگرام
  res.status(200).send('OK');
  
  // پردازش در پس‌زمینه
  setImmediate(() => {
    try {
      const update = req.body;
      console.log('📩 Webhook received:', new Date().toISOString());
      
      // فقط پیام‌های ثبت‌نام را پردازش کن
      if (update.message?.text?.includes('New Benula registration!')) {
        const text = update.message.text;
        const userIdMatch = text.match(/🆔 User ID: (\w+)/);
        const refMatch = text.match(/🔗 Referral Code: (\w+)/);
        
        if (userIdMatch && refMatch) {
          const newUserId = userIdMatch[1];
          const refCode = refMatch[1];
          
          // ذخیره ریفرال
          if (!referrals[refCode]) {
            referrals[refCode] = [];
          }
          referrals[refCode].push(newUserId);
          
          console.log(`✅ New user: ${newUserId} | Referred by: ${refCode}`);
          console.log(`📊 Total referrals for ${refCode}: ${referrals[refCode].length}`);
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

// دریافت ریفرال‌های یک کاربر
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

// دریافت آمار کلی
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

// ============================================
//  🏠 صفحه اصلی
// ============================================
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Benula Webhook',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /webhook - Telegram webhook endpoint',
      'GET /api/referrals/:code - Get referrals by referral code',
      'GET /api/stats - Get total statistics'
    ]
  });
});

// ============================================
//  🚀 راه‌اندازی سرور
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
  console.log(`📍 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`📊 Stats API: http://localhost:${PORT}/api/stats`);
});
