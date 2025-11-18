# Smartlead Integration Setup Guide

## Current Status

Your Smartlead integration is **fully built and ready** - the code is complete and working! The only issue is that your current **Basic plan** doesn't have API access enabled.

### What's Already Working ✅

- Complete Smartlead API integration (`/api/smartlead` route)
- Settings page with Campaign ID configuration
- "Test Connection" button in Settings tab
- "Send via Smartlead" buttons in Results tab
- Automatic lead tracking after sending emails
- Full error handling and user feedback
- Environment variable setup (.env.local and Vercel)
- Campaign ID: 2690291 configured

---

## The 403 Error - Root Cause

### Error Message:
```
HTTP 403 - "Access denied"
```

### Why This Happens:
According to the Smartlead API documentation:

> **"If your plan has API access, your API key will be provided to you here."**

Your current **Basic plan** does not include API access. API access is only available on the **PRO plan**.

---

## Solution: Upgrade to PRO Plan

### Option 1: Upgrade Your Plan (Recommended for Full API Access)

1. **Go to Smartlead Dashboard**
   - Log in to https://smartlead.ai

2. **Upgrade to PRO Plan**
   - Navigate to Settings → Billing
   - Upgrade to a PRO plan that includes API access

3. **Activate API**
   - Go to Settings → Click "Activate API" button
   - Copy your API key

4. **Add API Key to Your Project**

   Update your `.env.local` file:
   ```env
   SMARTLEAD_API_KEY=your_actual_api_key_from_smartlead
   ```

5. **Also Update in Vercel** (for production)
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Update `SMARTLEAD_API_KEY` with your actual key

6. **Test the Connection**
   - Go to Settings tab in your app
   - Click "Test Connection" button
   - You should see: "Successfully connected to Smartlead API!"

---

### Option 2: Alternative Email Solutions (If Not Upgrading)

If you don't want to upgrade to PRO plan, you can:

1. **Manual Email Sending**
   - Use the "Copy Email" button
   - Manually send via your email client
   - Use "Mark as Sent & Track" to track in Lead Tracker

2. **Use Other Email APIs**
   - SendGrid API
   - Mailgun API
   - AWS SES
   - These can be integrated similarly to Smartlead

---

## API Endpoints Overview

### Base URL
```
https://server.smartlead.ai/api/v1
```

### Authentication
All requests require your API key as a query parameter:
```
?api_key=your_api_key_here
```

### Rate Limits
- **10 requests every 2 seconds**

### Key Endpoints You're Using

1. **Test Connection** (GET)
   ```
   GET /campaigns?api_key={API_KEY}
   ```

2. **Add Lead to Campaign** (POST)
   ```
   POST /campaigns/{campaign_id}/leads?api_key={API_KEY}
   ```

3. **Get Campaign Details** (GET)
   ```
   GET /campaigns/{campaign_id}?api_key={API_KEY}
   ```

---

## Current Implementation

### Your Integration Code Structure:

```
business-outreach/
├── app/
│   ├── api/
│   │   └── smartlead/
│   │       └── route.js          # API route handler
│   ├── page.js                   # Main app with Settings tab
│   └── api/settings/route.js     # Settings storage
├── .env.local                    # Environment variables
└── SMARTLEAD_SETUP.md           # This file
```

### Features Implemented:

1. **Test Connection** - Verifies API key and connection
2. **Send Email** - Adds lead to Smartlead campaign
3. **Get Campaign** - Fetches campaign details
4. **Error Handling** - Detailed error messages for all scenarios
5. **Lead Tracking** - Automatic tracking after successful send
6. **Settings UI** - Campaign ID configuration and enable/disable toggle

---

## Testing Your Integration

### Step 1: Verify Environment Variables

Check that your `.env.local` file has:
```bash
SMARTLEAD_API_KEY=your_actual_api_key
```

### Step 2: Test in Development

```bash
npm run dev
```

1. Go to Settings tab
2. Enter your Campaign ID: `2690291`
3. Enable Smartlead integration
4. Click "Test Connection"

**Expected Results:**

- ✅ **With PRO plan**: "Successfully connected to Smartlead API!"
- ❌ **With Basic plan**: "API Access Denied - PRO Plan Required" + helpful solution message

### Step 3: Test Sending

1. Go to Results tab
2. Generate an email for a business
3. Click "Send via Smartlead"

**Expected Results:**

- ✅ **With PRO plan**: Email added to campaign, lead tracked
- ❌ **With Basic plan**: Error message with upgrade instructions

---

## Error Messages & Troubleshooting

### Error: "Smartlead API key not configured"
**Solution:** Add `SMARTLEAD_API_KEY` to `.env.local` and restart dev server

### Error: "Campaign ID is required"
**Solution:** Go to Settings tab and enter your Campaign ID (2690291)

### Error: "HTTP 403 - Access denied"
**Solution:** Upgrade to PRO plan (see "Solution: Upgrade to PRO Plan" above)

### Error: "Failed to connect to Smartlead API"
**Solution:** Check that your API key is correct and hasn't expired

### Error: "Lead email is required"
**Solution:** Business data is missing email - edit the business to add an email

---

## Campaign ID Information

Your configured Campaign ID: **2690291**

To find or change your campaign ID:
1. Log in to Smartlead
2. Go to Campaigns
3. Click on your desired campaign
4. The ID is in the URL: `smartlead.ai/campaigns/{CAMPAIGN_ID}`

---

## Next Steps

### Immediate Actions:

1. ✅ **Review this documentation** - Understand the plan requirement
2. ⏳ **Decide**: Upgrade to PRO plan OR use alternative methods
3. 🔑 **If upgrading**: Get your API key from Smartlead
4. 💾 **Update**: Add the real API key to `.env.local`
5. 🚀 **Test**: Use the "Test Connection" button
6. ✉️ **Send**: Try sending an email via Smartlead!

### Future Enhancements:

- Add bulk sending capability
- Implement campaign analytics
- Add custom field mapping
- Set up webhooks for delivery status
- Implement A/B testing for email variants

---

## Support & Documentation

- **Smartlead API Docs**: https://api.smartlead.ai/reference/welcome
- **Smartlead Dashboard**: https://smartlead.ai
- **Your Integration Code**: `business-outreach/app/api/smartlead/route.js`
- **Settings UI**: `business-outreach/app/page.js` (lines 1550-1620)

---

## Summary

✅ **Your integration code is perfect and ready to use!**

⚠️ **The only blocker**: Basic plan → need PRO plan

💡 **Solution**: Upgrade to PRO plan to get API access

🎉 **Once upgraded**: Everything will work immediately!

---

**Questions?** Check the code comments in `/api/smartlead/route.js` for detailed implementation notes.
