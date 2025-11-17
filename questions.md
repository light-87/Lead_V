# Tooling Website - Planning Questions

Before we start building, I need to understand your requirements and preferences. Please answer the questions below.

---

## 1. Technology Stack

**Q: What frontend framework do you prefer?**
- **Suggestion A**: Next.js 14+ (App Router) - Best for Vercel deployment, SEO-friendly, server actions
- **Suggestion B**: Next.js with Pages Router - More traditional, well-documented
- **Suggestion C**: React + Vite - Lighter, faster builds
- **Your choice**:

**Q: What styling approach do you prefer?**
- **Suggestion A**: Tailwind CSS - Matches Anthropic's clean, minimal style
- **Suggestion B**: shadcn/ui + Tailwind - Pre-built components with Anthropic-like aesthetics
- **Suggestion C**: CSS Modules
- **Your choice**:

**Q: TypeScript or JavaScript?**
- **Suggestion**: TypeScript (better for maintainability and catching errors)
- **Your choice**:

---

## 2. Business Search & Data Collection

**Q: Which API should we use for finding local businesses?**
- **Suggestion A**: Perplexity Sonar API (like your n8n prompts) - Good for AI-powered search
- **Suggestion B**: Google Places API - Reliable, extensive data, requires API key
- **Suggestion C**: Yelp Fusion API - Good for local businesses
- **Suggestion D**: Combination approach?
- **Your choice**:
- **API Key status**: Do you have API keys ready?

**Q: For website screenshots, which service?**
- **Suggestion A**: Screenshotone API - Reliable, good quality
- **Suggestion B**: URLbox - Feature-rich
- **Suggestion C**: Puppeteer (self-hosted) - Free but slower
- **Your choice**:
- **API Key status**:

**Q: How many businesses should users be able to search at once?**
- **Suggestion**: 10-20 businesses (to keep API costs manageable)
- **Your preference**:

---

## 3. Data Storage & Persistence

**Q: Where should we store the collected business data?**
- **Suggestion A**: Browser localStorage (simple, free, but limited to 5-10MB)
- **Suggestion B**: Vercel PostgreSQL (neon.tech) - Persistent, searchable, export capabilities
- **Suggestion C**: Vercel KV (Redis) - Fast, good for caching
- **Suggestion D**: Supabase - Free tier, PostgreSQL + auth + storage
- **Your choice**:

**Q: Should users need to create accounts?**
- **Suggestion A**: No authentication (simpler, faster to build)
- **Suggestion B**: Simple email authentication (Supabase Auth or NextAuth.js)
- **Your preference**:

**Q: Data export formats needed?**
- CSV
- JSON
- Excel
- **Your choice**:

---

## 4. Email Generation

**Q: Which AI model for generating personalized emails?**
- **Suggestion A**: Anthropic Claude (Claude 3.5 Sonnet) - Best for nuanced, personalized content
- **Suggestion B**: OpenAI GPT-4 - Good alternative
- **Suggestion C**: Perplexity (continue using Sonar)
- **Your choice**:
- **API Key status**:

**Q: Should users be able to edit the AI-generated emails before saving?**
- **Suggestion**: Yes (always give users control)
- **Your preference**:

**Q: Should the website actually send emails, or just generate them?**
- **Suggestion A**: Just generate (safer, simpler)
- **Suggestion B**: Integrate with email service (Resend, SendGrid)
- **Your preference**:

---

## 5. Features & Functionality

**Q: Which features are MUST-HAVE for v1?**
Please rank these features (1 = must have, 2 = nice to have, 3 = future):
- [ ] City input & business search
- [ ] Filter by business type (shops, hotels, restaurants, etc.)
- [ ] Website screenshot capture
- [ ] Email generation
- [ ] Save/export business data
- [ ] Edit generated emails
- [ ] Batch operations (process multiple businesses at once)
- [ ] Search history
- [ ] Template management (save custom email templates)
- [ ] A/B testing different email approaches

**Q: Should there be usage limits?**
- **Suggestion**: Yes, to control API costs (e.g., 20 searches per day without auth, unlimited with account)
- **Your preference**:

---

## 6. Design & User Experience

**Q: Reference for "Claude AI Anthropic style"?**
- Clean, minimal interface like claude.ai
- Warm color palette (oranges, creams, blacks)
- Serif headings, sans-serif body
- Ample whitespace
- **Any specific elements you want to emphasize?**:

**Q: Should it be a single-page app or multi-page?**
- **Suggestion A**: Single page with tabs/steps (cleaner, simpler navigation)
- **Suggestion B**: Multi-page (e.g., /search, /results, /emails)
- **Your preference**:

---

## 7. Deployment & Environment

**Q: Environment variables needed?**
Based on your choices above, we'll need API keys for:
- [ ] Perplexity Sonar API
- [ ] Claude API (or other LLM)
- [ ] Screenshot API
- [ ] Database connection
- **Confirm you'll provide these**:

**Q: Custom domain or Vercel subdomain?**
- **Suggestion**: Start with Vercel subdomain (e.g., business-tools.vercel.app)
- **Your preference**:

---

## 8. Budget & Rate Limiting

**Q: What's your estimated monthly budget for API calls?**
- **Context**:
  - Perplexity Sonar: ~$0.001-0.005 per request
  - Claude API: ~$0.003 per 1K tokens (input), $0.015 per 1K tokens (output)
  - Screenshot APIs: ~$0.001-0.01 per screenshot
- **Your budget**:

**Q: Should we implement rate limiting?**
- **Suggestion**: Yes (protect against abuse and control costs)
- **Your preference**:

---

## 9. Additional Features

**Q: Anything else you want to include?**
- Analytics dashboard?
- Success tracking (email open rates if sending)?
- Competitor analysis features?
- **Your ideas**:

---

## 10. Timeline

**Q: What's your target timeline?**
- **Suggestion**:
  - Phase 1 (MVP): 3-5 days (basic search, screenshot, email gen)
  - Phase 2 (Polish): 2-3 days (styling, UX improvements)
  - Phase 3 (Deploy): 1 day (Vercel setup, env vars)
- **Your timeline**:

---

## Next Steps

Once you answer these questions:
1. I'll create a detailed implementation plan
2. We'll set up the project structure
3. Step-by-step implementation with your involvement
4. Deploy to Vercel

Please answer these questions and push the changes, then let me know when you're ready for the plan!
