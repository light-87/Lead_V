# Local Business Outreach Tool - Implementation Plan

## Project Overview
A single-page web application for finding local businesses, capturing screenshots, and generating personalized outreach emails using AI. Built to deploy TODAY on Vercel.

---

## Technology Stack (Based on Your Choices)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: JavaScript (no TypeScript)
- **Styling**: shadcn/ui + Tailwind CSS
- **UI Components**: Anthropic Claude-inspired design system
- **State Management**: React hooks + Context API
- **Architecture**: Single-page with tabs (Search, Results, Settings, History)

### Backend/APIs
- **Business Search**: Perplexity Sonar API ✓ (API key ready)
- **Email Generation**: Perplexity Sonar API ✓ (same API)
- **Screenshots**: Screenshot Machine API ✓ (key: 7d1d96)
- **Data Storage**: Vercel Blob Storage
- **Authentication**: Simple password protection ("wecandothis")

### Deployment
- **Platform**: Vercel
- **Domain**: Vercel subdomain
- **No rate limiting** (as requested)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              Single Page App (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Search  │  │ Results  │  │ Settings │  │ History  │   │
│  │   Tab    │  │   Tab    │  │   Tab    │  │   Tab    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│       ↓              ↓              ↓              ↓         │
│  [Search Box]  [Business Cards] [Edit Prompts] [Saved Data] │
│  [City Input]  [Email Preview]  [API Keys]   [Export CSV]   │
│  [20-50 Count] [Batch Actions]  [Password]   [A/B Testing]  │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                       │
│  /api/search  │  /api/generate-email  │  /api/save-data     │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│              External Services                                │
│  Perplexity Sonar API  │  Screenshot Machine  │  Vercel Blob │
└──────────────────────────────────────────────────────────────┘
```

---

## TODAY'S TIMELINE (6-8 hours total)

### Hour 1-2: Project Setup & Foundation
### Hour 3-4: Core Features (Search + Screenshots)
### Hour 5-6: Email Generation & UI Polish
### Hour 7: Testing & Deployment to Vercel
### Hour 8: Final tweaks & going live

---

## Phase 1: Project Setup (1-2 hours)

### Step 1.1: Initialize Next.js Project
```bash
npx create-next-app@latest business-outreach-tool
# Options:
# - TypeScript: NO (JavaScript)
# - ESLint: Yes
# - Tailwind CSS: Yes
# - src/ directory: No (keep it simple)
# - App Router: Yes
# - Import alias: @/*
```

### Step 1.2: Install Core Dependencies
```bash
cd business-outreach-tool

# UI Components (shadcn/ui)
npx shadcn-ui@latest init
# Choose: New York style, Zinc color, CSS variables: yes

# Install shadcn components we'll need
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add card
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dialog

# Additional packages
npm install axios
npm install date-fns
npm install react-hot-toast
npm install lucide-react
npm install @vercel/blob
```

### Step 1.3: Project Structure (Simplified for Speed)
```
business-outreach-tool/
├── app/
│   ├── layout.js            # Root layout with Anthropic styling
│   ├── page.js              # Main single-page app
│   ├── globals.css
│   ├── api/
│   │   ├── auth/route.js              # Simple password check
│   │   ├── search/route.js            # Perplexity business search
│   │   ├── generate-email/route.js    # Perplexity email gen
│   │   └── data/route.js              # Vercel Blob save/retrieve
│   └── components/
│       ├── ui/              # shadcn components
│       ├── SearchTab.js
│       ├── ResultsTab.js
│       ├── SettingsTab.js
│       ├── HistoryTab.js
│       ├── BusinessCard.js
│       ├── EmailPreview.js
│       └── PasswordGate.js
├── lib/
│   ├── api.js               # All API calls
│   ├── utils.js             # Utility functions
│   └── prompts.js           # Editable prompts storage
├── .env.local
└── package.json
```

---

## Phase 2: Core API Routes & Logic (2-3 hours)

### Step 2.1: Environment Variables Setup

Create `.env.local`:
```bash
PERPLEXITY_API_KEY=your_key_here
SCREENSHOT_API_KEY=7d1d96
APP_PASSWORD=wecandothis
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Step 2.2: Editable Prompts Configuration

```javascript
// lib/prompts.js
export const DEFAULT_PROMPTS = {
  businessSearch: `Find {count} small LOCAL shops and small LOCAL hotels in {city}, UK. Focus ONLY on independent, locally-owned businesses - NO chains, NO franchises, NO big brands.

CRITICAL: For each business, you MUST search online to find their ACTUAL, WORKING website URL. Do not guess domain extensions.

Return ONLY a valid JSON object (no markdown, no extra text) with this structure:
{
  "businesses": [
    {
      "business_type": "shop" or "hotel",
      "name": "Business Name",
      "address": "Full street address, postcode, UK",
      "phone": "+44XXXXXXXXXX",
      "website": "https://www.example.com",
      "email": "contact@example.com",
      "description": "Brief 1-line description"
    }
  ]
}

WEBSITE URL REQUIREMENTS:
1. SEARCH for each business online to find their real website
2. VERIFY the domain extension (.com, .co.uk, .org, etc.) - don't assume
3. Check if they have 'www' in their URL or not
4. If you cannot find a working website after searching, use the business name to search '[business name] official website'
5. Only return URLs that you have confirmed exist through your search

OTHER REQUIREMENTS:
1. Return ONLY the JSON object - no markdown blocks, no extra text
2. MUST be small, independent, LOCAL businesses only
3. NO chains (no Premier Inn, Travelodge, Costa, Starbucks, etc.)
4. ALL websites MUST start with https:// or http://
5. Every business MUST have an email (search thoroughly)
6. Phone numbers MUST include +44 country code
7. Fill ALL fields - no null or empty values
8. Return EXACTLY {count} businesses total`,

  emailGeneration: `You are an expert web design, SEO, and digital marketing consultant analyzing a local business website.

Business Details:
- Business Name: {name}
- Type: {business_type}
- Location: {address}
- Website: {website}
- Phone: {phone}
- Email: {email}
- Description: {description}

Website Screenshot: {screenshot_url}

Your Task:
Analyze this website screenshot and create a HIGHLY PERSONALIZED outreach email that demonstrates deep research. The email should feel like you spent 30+ minutes studying their website, not using a template.

What to Include:

1. OPENING (1-2 sentences):
   - Reference something SPECIFIC you see on their website (their tagline, a product, their color scheme, a photo, their menu)
   - Mention their location/neighborhood naturally
   - Make it feel like a genuine discovery

2. SPECIFIC WEBSITE ISSUES (Pick 3-4 most visible):
   - Homepage design problems (cluttered layout, poor hero section, unclear value proposition)
   - Navigation/UX issues (hard to find contact info, no clear CTAs, confusing menu)
   - Mobile responsiveness problems (if visible in screenshot)
   - Missing trust elements (no reviews, testimonials, or credentials visible)
   - Outdated design elements (old fonts, dated images, 2010s style)
   - SEO red flags (slow loading indicators, missing key information)
   - Missing conversion elements (no booking button, unclear next steps)

3. LOCAL SEO & COMPETITION ANGLE:
   - Mention how local customers search for {business_type}s in {address}
   - Reference that competitors in their area have better online presence
   - Explain how improving their site will help them appear in "near me" searches

4. BUSINESS IMPACT (For each issue, explain):
   - "This means potential customers are leaving your site within seconds"
   - "You're losing bookings/sales to competitors with better websites"
   - "Local customers searching on mobile can't easily contact you"

5. URGENCY (Pick one angle):
   - Seasonal opportunity (holiday season, summer bookings, etc.)
   - Local competition is getting ahead
   - Google's recent algorithm changes favor modern, fast websites
   - Mobile-first indexing means their mobile site matters more than ever

6. SOFT CALL-TO-ACTION:
   - Offer a free, no-obligation website audit report
   - Or a quick 15-minute consultation call
   - Make it feel helpful, not salesy

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no extra text) with this exact structure:

{
  "email_body": "Your complete email text here (3-4 paragraphs, specific observations, natural tone)",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "subject_line": "Personalized subject line mentioning their business name"
}

CRITICAL RULES:
1. Be ULTRA-SPECIFIC - reference actual visible elements from their website
2. Use their business name, type, and location naturally throughout
3. Sound like you manually researched their site, not using AI
4. Professional but warm and friendly tone (like a local consultant)
5. NO generic templates - every sentence should be unique to this business
6. Make them feel like you genuinely want to help, not just sell
7. Keep email body to 200-250 words maximum
8. Return ONLY the JSON object, nothing else`
};

// Helper to replace placeholders
export function fillPrompt(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  return result;
}
```

### Step 2.3: API Route - Business Search

```javascript
// app/api/search/route.js
import { NextResponse } from 'next/server';
import { DEFAULT_PROMPTS, fillPrompt } from '@/lib/prompts';

export async function POST(request) {
  try {
    const { city, count, customPrompt } = await request.json();

    // Use custom prompt if provided, otherwise use default
    const promptTemplate = customPrompt || DEFAULT_PROMPTS.businessSearch;
    const prompt = fillPrompt(promptTemplate, { city, count });

    // Call Perplexity Sonar API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    const data = await response.json();
    let businesses = [];

    try {
      // Parse JSON from Perplexity response
      const content = data.choices[0].message.content;
      businesses = JSON.parse(content).businesses;

      // Add screenshots to each business
      businesses = businesses.map(business => ({
        ...business,
        id: crypto.randomUUID(),
        screenshot_url: `https://api.screenshotmachine.com/?key=${process.env.SCREENSHOT_API_KEY}&url=${encodeURIComponent(business.website)}&dimension=1024x768`,
        timestamp: new Date().toISOString()
      }));

    } catch (parseError) {
      console.error('Failed to parse Perplexity response:', parseError);
      return NextResponse.json({ error: 'Failed to parse business data' }, { status: 500 });
    }

    return NextResponse.json({ businesses });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Step 2.4: API Route - Email Generation

```javascript
// app/api/generate-email/route.js
import { NextResponse } from 'next/server';
import { DEFAULT_PROMPTS, fillPrompt } from '@/lib/prompts';

export async function POST(request) {
  try {
    const { business, customPrompt } = await request.json();

    const promptTemplate = customPrompt || DEFAULT_PROMPTS.emailGeneration;
    const prompt = fillPrompt(promptTemplate, business);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const email = JSON.parse(content);

    return NextResponse.json({ email });

  } catch (error) {
    console.error('Email generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Step 2.5: API Route - Data Persistence (Vercel Blob)

```javascript
// app/api/data/route.js
import { NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';

// Save search results
export async function POST(request) {
  try {
    const { businesses, searchId } = await request.json();

    const blob = await put(`searches/${searchId}.json`, JSON.stringify(businesses), {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get search history
export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'searches/' });
    return NextResponse.json({ history: blobs });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete search
export async function DELETE(request) {
  try {
    const { url } = await request.json();
    await del(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## Phase 3: UI Components (Days 3-4)

### Step 3.1: Anthropic-Styled Layout

```typescript
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[#F5F2ED]">
        <header className="border-b border-[#E5E1D8] bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h1 className="font-serif text-2xl text-[#1F1F1F]">
              Local Business Outreach
            </h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
```

### Step 3.2: Search Panel Component

```typescript
// src/components/SearchPanel.tsx
export function SearchPanel({ onSearch }: { onSearch: (params: SearchParams) => void }) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E1D8] p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
            City
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-[#E5E1D8] rounded-lg focus:ring-2 focus:ring-[#D97757] focus:border-transparent"
            placeholder="Enter city name..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
            Business Types
          </label>
          {/* Checkboxes for shops, hotels, restaurants */}
        </div>

        <button className="w-full bg-[#D97757] hover:bg-[#C66646] text-white font-medium py-2 px-4 rounded-lg transition-colors">
          Search Businesses
        </button>
      </div>
    </div>
  );
}
```

### Step 3.3: Business Card Component

```typescript
// src/components/BusinessCard.tsx
export function BusinessCard({ business }: { business: Business }) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E1D8] overflow-hidden hover:shadow-md transition-shadow">
      {business.screenshot_url && (
        <img src={business.screenshot_url} alt={business.name} className="w-full h-48 object-cover" />
      )}

      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-[#1F1F1F] mb-2">
          {business.name}
        </h3>
        <p className="text-sm text-[#666] mb-2">{business.description}</p>

        <div className="space-y-1 text-sm text-[#666]">
          <p>📍 {business.address}</p>
          <p>📞 {business.phone}</p>
          <p>🌐 <a href={business.website} className="text-[#D97757] hover:underline" target="_blank">{business.website}</a></p>
          <p>✉️ {business.email}</p>
        </div>

        <button className="mt-4 w-full bg-[#D97757] text-white py-2 rounded-lg hover:bg-[#C66646] transition-colors">
          Generate Email
        </button>
      </div>
    </div>
  );
}
```

### Step 3.4: Email Preview Component

```typescript
// src/components/EmailPreview.tsx
export function EmailPreview({ email, business }: { email: GeneratedEmail, business: Business }) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E1D8] p-6">
      <div className="mb-4">
        <label className="text-sm font-medium text-[#666]">Subject</label>
        <input
          type="text"
          value={email.subject_line}
          className="w-full mt-1 px-4 py-2 border border-[#E5E1D8] rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-[#666]">Email Body</label>
        <textarea
          value={email.email_body}
          rows={12}
          className="w-full mt-1 px-4 py-2 border border-[#E5E1D8] rounded-lg font-mono text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-[#666]">Key Issues Identified</label>
        <ul className="mt-2 space-y-1">
          {email.key_issues.map((issue, idx) => (
            <li key={idx} className="text-sm text-[#666]">• {issue}</li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-[#D97757] text-white py-2 rounded-lg hover:bg-[#C66646]">
          Copy Email
        </button>
        <button className="flex-1 border border-[#E5E1D8] py-2 rounded-lg hover:bg-[#F5F2ED]">
          Edit Template
        </button>
      </div>
    </div>
  );
}
```

---

## Phase 4: Main Application Flow (Day 4)

### Step 4.1: Main Page with Step-by-Step Flow

```typescript
// src/app/page.tsx
'use client';

export default function Home() {
  const [step, setStep] = useState<'search' | 'results' | 'emails'>('search');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-4">
        <Step number={1} label="Search" active={step === 'search'} />
        <div className="h-px w-16 bg-[#E5E1D8]" />
        <Step number={2} label="Results" active={step === 'results'} />
        <div className="h-px w-16 bg-[#E5E1D8]" />
        <Step number={3} label="Emails" active={step === 'emails'} />
      </div>

      {/* Content */}
      {step === 'search' && <SearchPanel onSearch={handleSearch} />}
      {step === 'results' && <BusinessGrid businesses={businesses} onSelect={handleSelect} />}
      {step === 'emails' && <EmailWorkflow business={selectedBusiness} />}
    </div>
  );
}
```

---

## Phase 5: API Routes (Day 4-5)

### Step 5.1: Business Search Endpoint

```typescript
// src/app/api/search/route.ts
export async function POST(request: Request) {
  try {
    const { city, businessTypes, count } = await request.json();

    const businesses = await searchBusinesses(city, businessTypes, count);

    // Capture screenshots in parallel
    const businessesWithScreenshots = await Promise.all(
      businesses.map(async (b) => ({
        ...b,
        screenshot_url: await captureScreenshot(b.website)
      }))
    );

    return Response.json({ businesses: businessesWithScreenshots });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Step 5.2: Email Generation Endpoint

```typescript
// src/app/api/generate-email/route.ts
export async function POST(request: Request) {
  try {
    const { business } = await request.json();

    const email = await generateEmail(business, business.screenshot_url);

    return Response.json({ email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

---

## Phase 6: Styling - Anthropic Design System (Day 5)

### Step 6.1: Tailwind Configuration

```javascript
// tailwind.config.js
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
        serif: ['Tiempos Text', 'Georgia', 'serif'],
      },
    },
  },
};
```

### Step 6.2: Global Styles

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-claude-cream text-claude-black;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-claude-orange hover:bg-claude-orange-dark text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }

  .card {
    @apply bg-white rounded-lg border border-claude-border shadow-sm;
  }
}
```

---

## Phase 7: Deployment (Day 6)

### Step 7.1: Environment Variables Setup

```bash
# .env.local (local development)
PERPLEXITY_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
SCREENSHOT_API_KEY=your_key_here
```

### Step 7.2: Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
```

### Step 7.3: Production Checklist

- [ ] All environment variables configured in Vercel
- [ ] API rate limiting implemented
- [ ] Error boundaries added
- [ ] Loading states for all async operations
- [ ] Mobile responsive design tested
- [ ] CORS configured properly
- [ ] API keys secured (never exposed to client)
- [ ] Analytics setup (optional)

---

## Phase 8: Testing & Optimization (Day 6-7)

### Step 8.1: Manual Testing
- [ ] Search for businesses in different cities
- [ ] Verify screenshot capture works
- [ ] Test email generation with different businesses
- [ ] Export to CSV and JSON
- [ ] Test on mobile devices
- [ ] Test error scenarios

### Step 8.2: Performance Optimization
- [ ] Implement loading skeletons
- [ ] Add request caching
- [ ] Optimize images
- [ ] Lazy load components
- [ ] Add retry logic for failed API calls

---

## MVP Features Checklist

### Core Features (Must Have)
- [x] City input & business search
- [x] Filter by business type (shops, hotels)
- [x] Website screenshot capture
- [x] AI-powered email generation
- [x] Save/export business data (JSON, CSV)
- [x] Edit generated emails
- [x] Anthropic-inspired design

### Nice to Have (v2)
- [ ] Search history
- [ ] Batch operations
- [ ] Template management
- [ ] User authentication
- [ ] Database persistence
- [ ] Email sending integration
- [ ] Analytics dashboard

---

## Development Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| 1. Setup | 0.5 day | Project init, dependencies, structure |
| 2. Core Logic | 1.5 days | API integrations, types, utilities |
| 3. UI Components | 1 day | SearchPanel, BusinessCard, EmailPreview |
| 4. Application Flow | 0.5 day | Main page, state management |
| 5. API Routes | 0.5 day | Endpoints for search, screenshot, email |
| 6. Styling | 0.5 day | Anthropic design system |
| 7. Deployment | 0.5 day | Vercel setup, env vars |
| 8. Testing | 0.5 day | Manual testing, bug fixes |
| **Total** | **5-6 days** | |

---

## API Cost Estimates

Assuming 100 searches per day:

| Service | Usage | Cost per Search | Monthly Cost |
|---------|-------|-----------------|--------------|
| Perplexity Sonar | 1 request | $0.005 | $15 |
| Claude 3.5 Sonnet | 20 businesses × 1K tokens | $0.30 | $900 |
| Screenshots | 20 screenshots | $0.10 | $300 |
| **Total** | | | **~$1,215/mo** |

**Cost Optimization:**
- Implement caching for repeated searches
- Add rate limiting (10 searches/day free tier)
- User authentication for paid tiers
- Cache screenshots for 7 days

---

## Next Steps

1. **Review this plan** and confirm tech stack choices
2. **Provide API keys** for:
   - Perplexity Sonar
   - Anthropic Claude
   - Screenshot service (or we'll use Puppeteer)
3. **Start Phase 1**: Initialize project
4. **Daily check-ins**: Review progress and adjust as needed

Ready to start building? Let me know if you want to adjust anything in this plan!
