# Tooling Website - Planning Questions

Before we start building, I need to understand your requirements and preferences. Please answer the questions below.

---

## 1. Technology Stack

**Q: What frontend framework do you prefer?**
- **Suggestion A**: Next.js 14+ (App Router) - Best for Vercel deployment, SEO-friendly, server actions
- **Suggestion B**: Next.js with Pages Router - More traditional, well-documented
- **Suggestion C**: React + Vite - Lighter, faster builds
- **Your choice**: A

**Q: What styling approach do you prefer?**
- **Suggestion A**: Tailwind CSS - Matches Anthropic's clean, minimal style
- **Suggestion B**: shadcn/ui + Tailwind - Pre-built components with Anthropic-like aesthetics
- **Suggestion C**: CSS Modules
- **Your choice**: B

**Q: TypeScript or JavaScript?**
- **Suggestion**: TypeScript (better for maintainability and catching errors)
- **Your choice**: JavaScript

---

## 2. Business Search & Data Collection

**Q: Which API should we use for finding local businesses?**
- **Suggestion A**: Perplexity Sonar API (like your n8n prompts) - Good for AI-powered search
- **Suggestion B**: Google Places API - Reliable, extensive data, requires API key
- **Suggestion C**: Yelp Fusion API - Good for local businesses
- **Suggestion D**: Combination approach?
- **Your choice**: We can try combination, I have API for Perplexiity ready, Lets start with that and then we can try things. Can you also add the ability to edit the prompt in the site itself so that it is easy to edit, 
- **API Key status**: Do you have API keys ready?

**Q: For website screenshots, which service?**
- **Suggestion A**: Screenshotone API - Reliable, good quality. yes for that we can use something like this f"https://api.screenshotmachine.com/?key=7d1d96&url={website}&dimension=1024x768"
- **Suggestion B**: URLbox - Feature-rich
- **Suggestion C**: Puppeteer (self-hosted) - Free but slower
- **Your choice**: A for now
- **API Key status**:f"https://api.screenshotmachine.com/?key=7d1d96&url={website}&dimension=1024x768"

**Q: How many businesses should users be able to search at once?**
- **Suggestion**: 10-20 businesses (to keep API costs manageable)
- **Your preference**: 20 to 50, have an option for this

---

## 3. Data Storage & Persistence

**Q: Where should we store the collected business data?**
- **Suggestion A**: Browser localStorage (simple, free, but limited to 5-10MB)
- **Suggestion B**: Vercel PostgreSQL (neon.tech) - Persistent, searchable, export capabilities
- **Suggestion C**: Vercel KV (Redis) - Fast, good for caching
- **Suggestion D**: Supabase - Free tier, PostgreSQL + auth + storage
- **Your choice**: Vercel blob storage should be fine, later we are going to add the ablity to direclty send mail as well

**Q: Should users need to create accounts?**
- **Suggestion A**: No authentication (simpler, faster to build)
- **Suggestion B**: Simple email authentication (Supabase Auth or NextAuth.js)
- **Your preference**: This is going to be jues used by me and my co-worker so no email direct 1 single hardcoded password like "wecandothis" should be okay

**Q: Data export formats needed?**
- CSV
- JSON
- Excel
- **Your choice**: CSV, but we need to shore the result and email and everything this are the later feature we will work on 

---

## 4. Email Generation

**Q: Which AI model for generating personalized emails?**
- **Suggestion A**: Anthropic Claude (Claude 3.5 Sonnet) - Best for nuanced, personalized content
- **Suggestion B**: OpenAI GPT-4 - Good alternative
- **Suggestion C**: Perplexity (continue using Sonar)
- **Your choice**: C
- **API Key status**: ready 

**Q: Should users be able to edit the AI-generated emails before saving?**
- **Suggestion**: Yes (always give users control)
- **Your preference**: Yes

**Q: Should the website actually send emails, or just generate them?**
- **Suggestion A**: Just generate (safer, simpler)
- **Suggestion B**: Integrate with email service (Resend, SendGrid)
- **Your preference**: B  this we will do later when our generation part works perfeclty

---

## 5. Features & Functionality

**Q: Which features are MUST-HAVE for v1?**
Please rank these features (1 = must have, 2 = nice to have, 3 = future):
- [ 1] City input & business search
- [ 3] Filter by business type (shops, hotels, restaurants, etc.)
- [1 ] Website screenshot capture
- [ 1] Email generation
- [ 1] Save/export business data
- [ 2] Edit generated emails
- [ 1] Batch operations (process multiple businesses at once)
- [ 1] Search history
- [ 3] Template management (save custom email templates)
- [ 1] A/B testing different email approaches

**Q: Should there be usage limits?**
- **Suggestion**: Yes, to control API costs (e.g., 20 searches per day without auth, unlimited with account)
- **Your preference**: No

---

## 6. Design & User Experience

**Q: Reference for "Claude AI Anthropic style"?**
- Clean, minimal interface like claude.ai
- Warm color palette (oranges, creams, blacks)
- Serif headings, sans-serif body
- Ample whitespace
- **Any specific elements you want to emphasize?**: You got this 

**Q: Should it be a single-page app or multi-page?**
- **Suggestion A**: Single page with tabs/steps (cleaner, simpler navigation)
- **Suggestion B**: Multi-page (e.g., /search, /results, /emails)
- **Your preference**: single-page but have like a setting part with things to edit prompt and view history, view data things like that 

---

## 7. Deployment & Environment

**Q: Environment variables needed?**
Based on your choices above, we'll need API keys for:
- [yes ] Perplexity Sonar API
- [not using ] Claude API (or other LLM)
- [yes ] Screenshot API
- [ Vercel blob storage where we will also deploy our site] Database connection
- **Confirm you'll provide these**:

**Q: Custom domain or Vercel subdomain?**
- **Suggestion**: Start with Vercel subdomain (e.g., business-tools.vercel.app)
- **Your preference**:Vercel subdomain

---

## 8. Budget & Rate Limiting

**Q: What's your estimated monthly budget for API calls?**
- **Context**:
  - Perplexity Sonar: ~$0.001-0.005 per request
  - Claude API: ~$0.003 per 1K tokens (input), $0.015 per 1K tokens (output)
  - Screenshot APIs: ~$0.001-0.01 per screenshot
- **Your budget**: Does not matter now 

**Q: Should we implement rate limiting?**
- **Suggestion**: Yes (protect against abuse and control costs)
- **Your preference**: NO

---

## 9. Additional Features

**Q: Anything else you want to include?**
- Analytics dashboard?
- Success tracking (email open rates if sending)?
- Competitor analysis features?
- **Your ideas**: Future

---

## 10. Timeline

**Q: What's your target timeline?**
- **Suggestion**:
  - Phase 1 (MVP): 3-5 days (basic search, screenshot, email gen)
  - Phase 2 (Polish): 2-3 days (styling, UX improvements)
  - Phase 3 (Deploy): 1 day (Vercel setup, env vars)
- **Your timeline**: 1 day we are going to make all of it today 

---

## Next Steps

Once you answer these questions:
1. I'll create a detailed implementation plan
2. We'll set up the project structure
3. Step-by-step implementation with your involvement
4. Deploy to Vercel

Please answer these questions and push the changes, then let me know when you're ready for the plan!
