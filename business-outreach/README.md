# Local Business Outreach Tool

A Next.js application that finds local businesses in UK cities and generates personalized outreach emails using AI.

## Features

- 🔍 **Business Search**: Find 20-50 local shops and hotels in any UK city
- 📸 **Website Screenshots**: Automatically capture screenshots of business websites
- ✉️ **AI Email Generation**: Create personalized outreach emails using Perplexity AI
- 📊 **CSV Export**: Export business data for further use
- 🔐 **Password Protection**: Simple password authentication
- 🎨 **Beautiful UI**: Anthropic Claude-inspired design with shadcn/ui

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Perplexity Sonar API
- **Screenshots**: Screenshot Machine API
- **Storage**: Vercel Blob (for history)
- **Deployment**: Vercel

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the `.env.local.example` file to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then fill in your API keys:

```env
PERPLEXITY_API_KEY=your_perplexity_api_key
SCREENSHOT_API_KEY=7d1d96
APP_PASSWORD=wecandothis
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

**Getting API Keys:**

- **Perplexity API**: Sign up at [https://www.perplexity.ai/](https://www.perplexity.ai/)
- **Screenshot API**: Already provided (7d1d96)
- **Vercel Blob**: Get from Vercel dashboard after linking project

### 3. Link to Vercel (Required for Blob Storage)

```bash
vercel link
```

Follow the prompts to link your project to Vercel.

### 4. Pull Environment Variables from Vercel

```bash
vercel env pull
```

This will download your environment variables including the Blob token.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Login

Enter the password: `wecandothis` (or whatever you set in `.env.local`)

### 2. Search for Businesses

- Navigate to the **Search** tab
- Enter a UK city (e.g., London, Manchester, Birmingham)
- Choose number of businesses (20-50)
- Click **Search Businesses**

### 3. View Results

- Switch to the **Results** tab
- View business cards with screenshots
- Click **Generate Email** on any business card

### 4. Generate Email

- AI will analyze the business website
- View personalized email with subject and body
- Copy email to clipboard

### 5. Export Data

Click **Export CSV** in the Results tab to download all business data.

## Project Structure

```
business-outreach/
├── app/
│   ├── api/
│   │   ├── search/route.js          # Business search endpoint
│   │   ├── generate-email/route.js  # Email generation endpoint
│   │   └── data/route.js            # Data persistence endpoint
│   ├── layout.js                    # Root layout
│   ├── page.js                      # Main application page
│   └── globals.css                  # Global styles
├── components/
│   └── ui/                          # shadcn/ui components
├── lib/
│   ├── prompts.js                   # AI prompts configuration
│   └── utils.js                     # Utility functions
├── .env.local.example               # Environment variables template
├── components.json                  # shadcn/ui configuration
├── next.config.js                   # Next.js configuration
├── tailwind.config.js               # Tailwind configuration
└── package.json                     # Dependencies
```

## Deployment to Vercel

### 1. Install Vercel CLI (if not already installed)

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

### 4. Add Environment Variables in Vercel Dashboard

Go to your project settings and add:
- `PERPLEXITY_API_KEY`
- `SCREENSHOT_API_KEY`
- `APP_PASSWORD`
- `BLOB_READ_WRITE_TOKEN`

### 5. Deploy to Production

```bash
vercel --prod
```

## Customization

### Editing AI Prompts

Edit the prompts in `lib/prompts.js`:

- `businessSearch`: Controls how businesses are searched
- `emailGeneration`: Controls email generation style

### Changing Password

Update the `APP_PASSWORD` in `.env.local`

### Styling

- Colors are defined in `tailwind.config.js`
- Global styles in `app/globals.css`
- Anthropic Claude color scheme is used by default

## Troubleshooting

### API Errors

- Check that all environment variables are set correctly
- Verify your Perplexity API key is valid
- Check API rate limits

### Screenshot Issues

- Some websites may block screenshot services
- Fallback placeholder image will be shown

### Build Errors

- Run `npm install` to ensure all dependencies are installed
- Check Next.js version compatibility
- Clear `.next` folder and rebuild

## Creator

Vaibhav 🤗

