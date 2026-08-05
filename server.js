const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const referrals = {};

app.post('/webhook', (req, res) => {
  res.status(200).send('OK');
  
  setImmediate(() => {
    try {
      const update = req.body;
      console.log('📩 Webhook received:', new Date().toISOString());
      
      if (update.message?.text?.includes('New Benula registration!')) {
        const text = update.message.text;
        const userIdMatch = text.match(/🆔 User ID: (\w+)/);
        const refMatch = text.match(/🔗 Referral Code: (\w+)/);
        
        if (userIdMatch && refMatch) {
          const newUserId = userIdMatch[1];
          const refCode = refMatch[1];
          
          if (!referrals[refCode]) referrals[refCode] = [];
          referrals[refCode].push(newUserId);
          
          console.log(`✅ New user: ${newUserId} | Referred by: ${refCode}`);
        }
      }
    } catch (error) {
      console.error('❌ Webhook error:', error);
    }
  });
});

app.get('/api/referrals/:refCode', (req, res) => {
  const refCode = req.params.refCode;
  const data = referrals[refCode] || [];
  res.json({ success: true, refCode, count: data.length, referrals: data });
});

app.get('/api/stats', (req, res) => {
  let total = 0;
  for (const key in referrals) total += referrals[key].length;
  res.json({ success: true, totalRegistrations: total, totalReferrers: Object.keys(referrals).length });
});

app.get('/', (req, res) => {
  res.json({ status: 'online', service: 'Benula Webhook', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
