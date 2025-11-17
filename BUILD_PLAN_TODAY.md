# Build Plan - TODAY (One Day Build)

## 🎯 Goal
Launch a working local business outreach tool on Vercel by end of day.

## ✅ Confirmed Tech Stack
- **Frontend**: Next.js 14 + shadcn/ui + Tailwind (JavaScript)
- **APIs**: Perplexity Sonar (search + emails), Screenshot Machine
- **Storage**: Vercel Blob
- **Auth**: Simple password ("wecandothis")
- **Deploy**: Vercel subdomain

---

## 🚀 BUILD STEPS (Start Now!)

### ⏱️ STEP 1: Initialize Project (30 mins)

```bash
# 1. Create Next.js app
npx create-next-app@latest business-outreach
# Choose: JavaScript, Tailwind, App Router, No src/, ESLint yes

cd business-outreach

# 2. Install shadcn/ui
npx shadcn-ui@latest init
# Choose: New York, Zinc, CSS variables

# 3. Add shadcn components
npx shadcn-ui@latest add button input textarea tabs card toast dialog select

# 4. Install other dependencies
npm install axios react-hot-toast lucide-react @vercel/blob date-fns

# 5. Create .env.local
echo "PERPLEXITY_API_KEY=your_key" > .env.local
echo "SCREENSHOT_API_KEY=7d1d96" >> .env.local
echo "APP_PASSWORD=wecandothis" >> .env.local
echo "BLOB_READ_WRITE_TOKEN=get_from_vercel" >> .env.local
```

---

### ⏱️ STEP 2: Setup Tailwind Config (10 mins)

```javascript
// tailwind.config.js - Add Anthropic colors
module.exports = {
  theme: {
    extend: {
      colors: {
        claude: {
          cream: '#F5F2ED',
          orange: '#D97757',
          'orange-dark': '#C66646',
          black: '#1F1F1F',
          gray: '#666',
          border: '#E5E1D8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['ui-serif', 'Georgia'],
      },
    },
  },
};
```

```css
/* app/globals.css - Add fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-claude-cream text-claude-black;
  }
  h1, h2, h3 {
    @apply font-serif;
  }
}
```

---

### ⏱️ STEP 3: Create Prompts Config (15 mins)

```javascript
// lib/prompts.js
export const DEFAULT_PROMPTS = {
  businessSearch: `Find {count} small LOCAL shops and small LOCAL hotels in {city}, UK. Focus ONLY on independent, locally-owned businesses - NO chains, NO franchises, NO big brands.

CRITICAL: For each business, you MUST search online to find their ACTUAL, WORKING website URL.

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "businesses": [
    {
      "business_type": "shop" or "hotel",
      "name": "Business Name",
      "address": "Full address with postcode, UK",
      "phone": "+44XXXXXXXXXX",
      "website": "https://www.example.com",
      "email": "contact@example.com",
      "description": "Brief 1-line description"
    }
  ]
}

REQUIREMENTS:
- Return ONLY the JSON object
- ALL websites MUST start with https:// or http://
- Phone numbers MUST include +44 country code
- Return EXACTLY {count} businesses total
- NO chains or franchises`,

  emailGeneration: `You are an expert web design consultant analyzing a local business website.

Business: {name}
Type: {business_type}
Location: {address}
Website: {website}
Screenshot: {screenshot_url}

Create a HIGHLY PERSONALIZED outreach email:

1. OPENING: Reference something SPECIFIC from their website
2. ISSUES: Identify 3-4 visible website problems
3. LOCAL SEO: Explain how improvements help them rank in local searches
4. BUSINESS IMPACT: Show how issues lose them customers
5. URGENCY: Add a timely reason to act now
6. SOFT CTA: Offer free audit or 15-min call

Return ONLY valid JSON:
{
  "email_body": "3-4 paragraphs, ultra-specific, 200-250 words",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Personalized subject with their name"
}

Be ULTRA-SPECIFIC. Sound human, not AI. Return ONLY JSON.`
};

export function fillPrompt(template, vars) {
  let result = template;
  Object.entries(vars).forEach(([key, val]) => {
    result = result.replaceAll(`{${key}}`, val);
  });
  return result;
}
```

---

### ⏱️ STEP 4: Create API Routes (45 mins)

```javascript
// app/api/search/route.js
import { NextResponse } from 'next/server';
import { DEFAULT_PROMPTS, fillPrompt } from '@/lib/prompts';

export async function POST(req) {
  const { city, count } = await req.json();

  const prompt = fillPrompt(DEFAULT_PROMPTS.businessSearch, { city, count });

  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await res.json();
  const content = data.choices[0].message.content;
  const { businesses } = JSON.parse(content);

  // Add screenshots
  const withScreenshots = businesses.map(b => ({
    ...b,
    id: crypto.randomUUID(),
    screenshot_url: `https://api.screenshotmachine.com/?key=${process.env.SCREENSHOT_API_KEY}&url=${encodeURIComponent(b.website)}&dimension=1024x768`,
    timestamp: new Date().toISOString()
  }));

  return NextResponse.json({ businesses: withScreenshots });
}
```

```javascript
// app/api/generate-email/route.js
import { NextResponse } from 'next/server';
import { DEFAULT_PROMPTS, fillPrompt } from '@/lib/prompts';

export async function POST(req) {
  const { business } = await req.json();

  const prompt = fillPrompt(DEFAULT_PROMPTS.emailGeneration, business);

  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await res.json();
  const content = data.choices[0].message.content;
  const email = JSON.parse(content);

  return NextResponse.json({ email });
}
```

```javascript
// app/api/data/route.js
import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

export async function POST(req) {
  const { businesses, searchId } = await req.json();
  const blob = await put(`searches/${searchId}.json`, JSON.stringify(businesses), { access: 'public' });
  return NextResponse.json({ url: blob.url });
}

export async function GET() {
  const { blobs } = await list({ prefix: 'searches/' });
  return NextResponse.json({ history: blobs });
}
```

---

### ⏱️ STEP 5: Create Main Page (90 mins)

```javascript
// app/page.js
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search, Mail, Settings, History } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [count, setCount] = useState(20);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [email, setEmail] = useState(null);

  // Auth check
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 w-96">
          <h2 className="text-2xl font-serif mb-4">Enter Password</h2>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && password === 'wecandothis') {
                setAuthenticated(true);
                toast.success('Welcome!');
              }
            }}
            placeholder="Password"
            className="mb-4"
          />
          <Button
            onClick={() => {
              if (password === 'wecandothis') {
                setAuthenticated(true);
                toast.success('Welcome!');
              } else {
                toast.error('Wrong password');
              }
            }}
            className="w-full bg-claude-orange hover:bg-claude-orange-dark"
          >
            Login
          </Button>
        </Card>
      </div>
    );
  }

  // Search businesses
  const searchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, count })
      });
      const data = await res.json();
      setBusinesses(data.businesses);
      toast.success(`Found ${data.businesses.length} businesses!`);
    } catch (error) {
      toast.error('Search failed');
    }
    setLoading(false);
  };

  // Generate email
  const generateEmail = async (business) => {
    setSelectedBusiness(business);
    toast.loading('Generating email...');
    try {
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business })
      });
      const data = await res.json();
      setEmail(data.email);
      toast.dismiss();
      toast.success('Email generated!');
    } catch (error) {
      toast.dismiss();
      toast.error('Generation failed');
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const csv = [
      ['Name', 'Type', 'Address', 'Phone', 'Website', 'Email', 'Description'].join(','),
      ...businesses.map(b =>
        [b.name, b.business_type, b.address, b.phone, b.website, b.email, b.description].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `businesses_${city}_${Date.now()}.csv`;
    a.click();
    toast.success('CSV exported!');
  };

  return (
    <div className="min-h-screen p-6">
      <Toaster />

      <header className="mb-8">
        <h1 className="text-4xl font-serif text-claude-black">Local Business Outreach</h1>
        <p className="text-claude-gray mt-2">Find local businesses & generate personalized emails</p>
      </header>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="search"><Search className="w-4 h-4 mr-2" />Search</TabsTrigger>
          <TabsTrigger value="results"><Mail className="w-4 h-4 mr-2" />Results ({businesses.length})</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Settings</TabsTrigger>
          <TabsTrigger value="history"><History className="w-4 h-4 mr-2" />History</TabsTrigger>
        </TabsList>

        {/* SEARCH TAB */}
        <TabsContent value="search">
          <Card className="p-6 max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">City (UK)</label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., London, Manchester, Birmingham"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Businesses (20-50)</label>
                <Input
                  type="number"
                  min="20"
                  max="50"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                />
              </div>

              <Button
                onClick={searchBusinesses}
                disabled={loading || !city}
                className="w-full bg-claude-orange hover:bg-claude-orange-dark"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Searching...</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" />Search Businesses</>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* RESULTS TAB */}
        <TabsContent value="results">
          {businesses.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-claude-gray">No results yet. Start a search!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif">Found {businesses.length} businesses</h2>
                <Button onClick={exportCSV} variant="outline">Export CSV</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map((business) => (
                  <Card key={business.id} className="overflow-hidden hover:shadow-lg transition">
                    <img
                      src={business.screenshot_url}
                      alt={business.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=No+Screenshot'}
                    />
                    <div className="p-4">
                      <h3 className="font-serif text-lg font-semibold mb-2">{business.name}</h3>
                      <p className="text-sm text-claude-gray mb-3">{business.description}</p>
                      <div className="text-xs space-y-1 text-claude-gray mb-4">
                        <p>📍 {business.address}</p>
                        <p>📞 {business.phone}</p>
                        <p>
                          🌐{' '}
                          <a href={business.website} target="_blank" className="text-claude-orange hover:underline">
                            {business.website}
                          </a>
                        </p>
                        <p>✉️ {business.email}</p>
                      </div>
                      <Button
                        onClick={() => generateEmail(business)}
                        className="w-full bg-claude-orange hover:bg-claude-orange-dark"
                        size="sm"
                      >
                        <Mail className="w-3 h-3 mr-2" />Generate Email
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Email Preview */}
              {email && selectedBusiness && (
                <Card className="p-6 mt-6">
                  <h3 className="text-xl font-serif mb-4">Generated Email for {selectedBusiness.name}</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <Input value={email.subject_line} readOnly />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email Body</label>
                      <Textarea
                        value={email.email_body}
                        rows={12}
                        className="font-mono text-sm"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Key Issues Identified</label>
                      <ul className="list-disc list-inside space-y-1">
                        {email.key_issues.map((issue, i) => (
                          <li key={i} className="text-sm text-claude-gray">{issue}</li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(`Subject: ${email.subject_line}\n\n${email.email_body}`);
                        toast.success('Email copied to clipboard!');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Copy Email to Clipboard
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings">
          <Card className="p-6">
            <h2 className="text-2xl font-serif mb-4">Settings</h2>
            <p className="text-claude-gray">Prompt editing and API configuration coming soon...</p>
          </Card>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history">
          <Card className="p-6">
            <h2 className="text-2xl font-serif mb-4">Search History</h2>
            <p className="text-claude-gray">History feature coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

### ⏱️ STEP 6: Update Layout (10 mins)

```javascript
// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Local Business Outreach Tool',
  description: 'Find local businesses and generate personalized outreach emails',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

---

### ⏱️ STEP 7: Test Locally (30 mins)

```bash
# Run development server
npm run dev

# Open http://localhost:3000
# Test:
# 1. Login with "wecandothis"
# 2. Search for businesses in a UK city
# 3. Generate email for a business
# 4. Export CSV
# 5. Check all tabs work
```

---

### ⏱️ STEP 8: Deploy to Vercel (20 mins)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables in Vercel Dashboard:
# PERPLEXITY_API_KEY
# SCREENSHOT_API_KEY
# APP_PASSWORD
# BLOB_READ_WRITE_TOKEN

# Deploy to production
vercel --prod
```

---

## 📋 Quick Checklist

**Phase 1: Setup (30 mins)**
- [ ] Create Next.js app
- [ ] Install shadcn/ui + components
- [ ] Install dependencies
- [ ] Setup .env.local

**Phase 2: Config (25 mins)**
- [ ] Configure Tailwind colors
- [ ] Add fonts to globals.css
- [ ] Create prompts.js

**Phase 3: API Routes (45 mins)**
- [ ] /api/search/route.js
- [ ] /api/generate-email/route.js
- [ ] /api/data/route.js

**Phase 4: UI (90 mins)**
- [ ] Main page.js with tabs
- [ ] Password gate
- [ ] Search tab
- [ ] Results tab with cards
- [ ] Email preview
- [ ] CSV export
- [ ] Settings tab placeholder
- [ ] History tab placeholder

**Phase 5: Layout (10 mins)**
- [ ] Update layout.js
- [ ] Add metadata

**Phase 6: Testing (30 mins)**
- [ ] Test login
- [ ] Test business search
- [ ] Test email generation
- [ ] Test CSV export
- [ ] Test responsive design

**Phase 7: Deploy (20 mins)**
- [ ] Deploy to Vercel
- [ ] Add environment variables
- [ ] Test production build
- [ ] Share URL!

---

## 🎉 Total Time: ~4 hours of focused work

## 🚀 Ready to start? Let's begin with STEP 1!
