# Local Business Outreach Tool - Implementation Plan

## Project Overview
A web application for finding local businesses, capturing their information, and generating personalized outreach emails using AI.

---

## Technology Stack (Recommended)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **UI Components**: Anthropic Claude-inspired design system
- **State Management**: React hooks + Context API

### Backend/APIs
- **Business Search**: Perplexity Sonar API (your existing prompts)
- **Email Generation**: Anthropic Claude API (Claude 3.5 Sonnet)
- **Screenshots**: Screenshotone API or Puppeteer (fallback)
- **Data Storage**: Browser localStorage (v1), upgrade to Postgres later

### Deployment
- **Platform**: Vercel
- **Environment**: Production + Preview environments
- **Domain**: Vercel subdomain initially

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Search   │  │  Results   │  │   Emails   │            │
│  │   Panel    │→ │   Grid     │→ │  Generator │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
│  /api/search-businesses  │  /api/screenshot  │  /api/email  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
│  Perplexity API  │  Claude API  │  Screenshot Service       │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Project Setup (Day 1)

### Step 1.1: Initialize Next.js Project
```bash
npx create-next-app@latest business-outreach-tool
# Options:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - src/ directory: Yes
# - App Router: Yes
# - Import alias: @/*
```

### Step 1.2: Install Core Dependencies
```bash
# UI Components
npx shadcn-ui@latest init

# Additional packages
npm install @anthropic-ai/sdk
npm install axios
npm install date-fns
npm install zustand # State management
npm install react-hot-toast # Notifications
npm install lucide-react # Icons
```

### Step 1.3: Project Structure
```
business-outreach-tool/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with Anthropic styling
│   │   ├── page.tsx            # Main page
│   │   ├── api/
│   │   │   ├── search/route.ts         # Business search endpoint
│   │   │   ├── screenshot/route.ts     # Screenshot capture
│   │   │   └── generate-email/route.ts # Email generation
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── SearchPanel.tsx
│   │   ├── BusinessCard.tsx
│   │   ├── EmailPreview.tsx
│   │   └── ExportButton.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── perplexity.ts
│   │   │   ├── claude.ts
│   │   │   └── screenshot.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── storage.ts
│   └── hooks/
│       ├── useBusinessSearch.ts
│       └── useEmailGeneration.ts
├── public/
├── .env.local
└── package.json
```

---

## Phase 2: Core Functionality (Days 2-4)

### Step 2.1: Type Definitions
Create comprehensive TypeScript types:

```typescript
// src/lib/types.ts
export interface Business {
  id: string;
  business_type: 'shop' | 'hotel' | 'restaurant';
  name: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  description: string;
  screenshot_url?: string;
  generated_email?: GeneratedEmail;
}

export interface GeneratedEmail {
  subject_line: string;
  email_body: string;
  key_issues: string[];
  timestamp: string;
}

export interface SearchParams {
  city: string;
  businessTypes: string[];
  count: number;
}
```

### Step 2.2: API Integration - Perplexity Search

```typescript
// src/lib/api/perplexity.ts
export async function searchBusinesses(city: string) {
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
        content: `[Your optimized prompt from n8n]`
      }]
    })
  });

  return await response.json();
}
```

### Step 2.3: API Integration - Claude Email Generation

```typescript
// src/lib/api/claude.ts
import Anthropic from '@anthropic-ai/sdk';

export async function generateEmail(business: Business, screenshotUrl: string) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `[Your email generation prompt with business details]`
    }],
  });

  return JSON.parse(message.content[0].text);
}
```

### Step 2.4: Screenshot Capture

```typescript
// src/lib/api/screenshot.ts
export async function captureScreenshot(url: string): Promise<string> {
  // Option 1: Screenshotone API
  const apiUrl = `https://api.screenshotone.com/take?access_key=${process.env.SCREENSHOT_API_KEY}&url=${encodeURIComponent(url)}&viewport_width=1920&viewport_height=1080&format=jpg`;

  return apiUrl;

  // Option 2: Self-hosted Puppeteer (add later if needed)
}
```

### Step 2.5: Local Storage Management

```typescript
// src/lib/storage.ts
const STORAGE_KEY = 'business_outreach_data';

export const storage = {
  saveBusinesses: (businesses: Business[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
  },

  loadBusinesses: (): Business[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  exportToCSV: (businesses: Business[]) => {
    // CSV generation logic
  },

  exportToJSON: (businesses: Business[]) => {
    const blob = new Blob([JSON.stringify(businesses, null, 2)], {
      type: 'application/json'
    });
    return URL.createObjectURL(blob);
  }
};
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
