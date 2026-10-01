import { Skill } from '@/types';

export const SKILLS_DATA: Skill[] = [
  {
    id: 'skill-1',
    title: 'AI YouTube Research & Hook Engineering Agent',
    category: 'Research',
    output_type: 'Content',
    description: 'Autonomous agent instructions to dissect viral YouTube competitors, extract transcript patterns, calculate audience retention drop-offs, and generate high-converting title-thumbnail pairs.',
    compatible_agents: ['Claude Code', 'Gemini CLI', 'ChatGPT', 'Cursor'],
    preview_image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1000&auto=format&fit=crop',
    capabilities: [
      'Extracts key semantic retention triggers from top 20 niche videos',
      'Calculates hook-to-body conversion ratios and retention curves',
      'Generates 10 CTR-optimized thumbnail concepts with Midjourney prompts',
      'Produces structured 3-part script frameworks with pacing markers',
      'Outputs competitive matrix markdown tables with view velocity metrics'
    ],
    instructions: [
      'Phase 1: Input the target topic, channel URL, or competitor niche keyword.',
      'Phase 2: The agent queries recent high-velocity videos (published < 90 days, >3x channel avg views).',
      'Phase 3: Synthesizes core audience pain points, curiosity gaps, and opening 30-second hooks.',
      'Phase 4: Delivers a ready-to-record video brief including scene-by-scene visual beats.'
    ],
    config: [
      { name: 'TARGET_NICHE', type: 'string', default: 'SaaS / AI Tools', description: 'Primary topic or industry vertical' },
      { name: 'HOOK_STYLE', type: 'select', default: 'Contrarian Curiosity', description: 'Narrative angle for intro hooks' },
      { name: 'MIN_VIEW_VELOCITY', type: 'number', default: '3.0', description: 'Multiplier over median competitor view rate' }
    ],
    example_usage: `youtube-research-agent --niche "Autonomous AI Coding" --competitors "@andrej_karpathy,@fireship" --output markdown`,
    install_prompt: `---
name: youtube-research-agent
description: Autonomous YouTube competitor teardown, retention analysis, and viral hook generation
compatibility: [Claude, Gemini, ChatGPT, Cursor]
---

You are an elite YouTube Content Strategist and Retention Analyst.

When the user asks to analyze a YouTube topic or competitor:
1. Identify the top 5 high-performing channels in the space.
2. Deconstruct the first 45 seconds of their 3 top videos:
   - Identify the Curiosity Gap.
   - Note visual cut frequency and stakes establishment.
3. Produce a structured Content Spec:
   - 5 High-CTR Titles (< 55 characters)
   - 3 Contrast-Driven Thumbnail Art Prompts
   - Word-for-word Opening Script with emotional anchors
   - 3 Retention Cliff Warning Zones to avoid

Always format output in structured markdown with clean tables.`,
    faq: [
      { q: 'Can this skill run in Claude Code CLI?', a: 'Yes, simply save it to your .claude/skills/ or run the install prompt directly in your conversation.' },
      { q: 'Does it require external API keys?', a: 'No, it uses web-search or manual video URL inputs natively supported by agent tools.' }
    ],
    tags: ['youtube', 'research', 'retention', 'video', 'content-strategy'],
    installs: 4320,
    rating: 4.95,
    is_pro: false,
    is_featured: true,
    created_at: '2026-03-01',
  },
  {
    id: 'skill-2',
    title: 'Frontend Design System & Micro-Animation Architect',
    category: 'Design',
    output_type: 'Code',
    description: 'Enforces modern editorial design aesthetics, fluid typography scales, curated HSL color tokens, micro-interactions, and accessible Tailwind CSS component hierarchies.',
    compatible_agents: ['Cursor', 'Claude Code', 'Codex', 'Gemini CLI'],
    preview_image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1000&auto=format&fit=crop',
    capabilities: [
      'Prevents generic AI aesthetic (eliminates purple neon gradients & boring blues)',
      'Generates accessible 60-30-10 color palettes with verified WCAG contrast',
      'Configures spring-based micro-interactions and smooth hover states',
      'Audits layout spacing, font hierarchy, and whitespace balance',
      'Outputs modular React/TypeScript components with clean semantics'
    ],
    instructions: [
      'Step 1: Inspect existing project theme tokens or design brief.',
      'Step 2: Establish the core brand personality (Editorial, Warm Playful, or Minimal Luxury).',
      'Step 3: Define 3 typography levels with tight tracking on headings.',
      'Step 4: Scaffold responsive components with subtle hover physics and zero layout shifts.'
    ],
    config: [
      { name: 'DESIGN_AESTHETIC', type: 'select', default: 'Warm Editorial Minimal', description: 'Primary visual mood' },
      { name: 'CSS_FRAMEWORK', type: 'string', default: 'Tailwind CSS v4', description: 'Styling engine target' }
    ],
    example_usage: `design-system-agent --theme "Warm Cream & Electric Lime" --target "./src/components"`,
    install_prompt: `---
name: frontend-design-architect
description: Premium editorial design system builder and micro-animation craftsperson
compatibility: [Cursor, Claude, Codex, Gemini]
---

You are a Principal Product Designer and Creative Technologist.

RULES FOR ALL UI GENERATION:
1. NEVER produce generic AI looks: NO purple-to-blue neon gradients, NO dark cyber dashboards unless requested.
2. Default to warm tactile palettes: Cream backgrounds (#F7F4EE), deep charcoal text (#1A1A1A), vibrant single accents (#D8F651).
3. Use generous border radius (20-28px) and soft diffused drop-shadows.
4. Button hovers must feel alive: scale(1.02), subtle translateY(-2px), quick 150ms spring transitions.
5. All headings must use tight tracking and bold weight; body must maintain generous line height (1.6).

Ensure every interactive element has visible hover, active, focus, and disabled states.`,
    faq: [
      { q: 'Works with Tailwind v3 and v4?', a: 'Yes, it adapts its CSS output based on your project configuration.' },
      { q: 'Does it generate icons?', a: 'It utilizes Lucide-React or custom SVG paths with pixel-perfect viewBox settings.' }
    ],
    tags: ['frontend', 'design-system', 'tailwind', 'ui-ux', 'animation'],
    installs: 6180,
    rating: 5.0,
    is_pro: false,
    is_featured: true,
    created_at: '2026-03-05',
  },
  {
    id: 'skill-3',
    title: 'Autonomous Full-Stack Bug Hunter & Test Suite Synthesizer',
    category: 'Development',
    output_type: 'Code',
    description: 'Systematic agent skill that crawls codebases, isolates edge-case race conditions, generates rigorous Vitest/Playwright tests, and proposes surgical zero-regression fixes.',
    compatible_agents: ['Claude Code', 'Cursor', 'Codex'],
    preview_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
    capabilities: [
      'Traces asynchronous state leaks and race conditions in React hooks',
      'Identifies unhandled edge cases in database transactions and API error boundaries',
      'Generates end-to-end Playwright tests with mock server workers',
      'Produces surgical pull requests with before/after behavioral diffs'
    ],
    instructions: [
      '1. Provide the failing test log, buggy route, or target component path.',
      '2. The skill executes a localized AST trace to find all dependents and callers.',
      '3. Replicates the defect with a minimal reproducible unit test.',
      '4. Applies the fix and verifies 100% pass rate without altering public contracts.'
    ],
    config: [
      { name: 'TEST_RUNNER', type: 'select', default: 'vitest', description: 'Testing framework in use' },
      { name: 'COVERAGE_THRESHOLD', type: 'number', default: '90', description: 'Minimum line coverage expected' }
    ],
    example_usage: `bug-hunter-agent --isolate "./src/app/api/checkout" --runner "vitest"`,
    install_prompt: `---
name: bug-hunter-agent
description: Autonomous defect isolation and regression-proof test generation
compatibility: [Claude Code, Cursor, Codex]
---

You are a Senior Staff QA & Reliability Engineer.

When tasked with debugging or securing code:
1. Never guess: First write a failing test that isolates the exact faulty behavior.
2. Inspect lifecycle hooks, asynchronous promises, nullability assertions, and type narrowing.
3. Propose the minimal code patch that resolves the issue.
4. Ensure no existing public types or API signatures break.
5. Provide a root-cause explanation and prevention guideline.`,
    faq: [
      { q: 'Can it run in terminal background?', a: 'Yes, perfectly paired with Claude Code CLI or Cursor Agent mode.' }
    ],
    tags: ['debugging', 'testing', 'playwright', 'vitest', 'reliability'],
    installs: 3950,
    rating: 4.9,
    is_pro: true,
    is_featured: false,
    created_at: '2026-03-04',
  },
  {
    id: 'skill-4',
    title: 'SEO Programmatic Content Engine & SERP Sniper',
    category: 'Marketing',
    output_type: 'Content',
    description: 'Reverse-engineers Google search intent for top-ranking competitive articles, structures programmatic schema markup, and drafts authoritative editorial long-form content.',
    compatible_agents: ['Claude Code', 'Gemini CLI', 'ChatGPT'],
    preview_image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?q=80&w=1000&auto=format&fit=crop',
    capabilities: [
      'Scrapes SERP headings (H2/H3) to discover content gaps',
      'Integrates FAQPage, HowTo, and Product JSON-LD schema markup',
      'Optimizes semantic LSI entity density without keyword stuffing',
      'Drafts viral TL;DR summaries and social distribution snippets'
    ],
    instructions: [
      'Input primary target keyword and competitor URLs.',
      'The skill generates an exhaustive content outline targeting informational and transactional intent.',
      'Drafts comprehensive sections with concrete examples, data tables, and diagrams.',
      'Validates meta title (<60 chars) and meta description (<155 chars).'
    ],
    config: [
      { name: 'KEYWORD', type: 'string', default: 'best ai prompt tools 2026', description: 'Target primary query' },
      { name: 'TONE', type: 'string', default: 'Authoritative Tech Editorial', description: 'Writing voice' }
    ],
    example_usage: `serp-sniper --keyword "ai video prompts veo 3" --format jsonld`,
    install_prompt: `---
name: serp-sniper-agent
description: Data-driven programmatic SEO strategist and JSON-LD schema generator
compatibility: [Claude, Gemini, ChatGPT]
---

You are an elite Technical SEO Strategist and Content Lead.

For any given topic or keyword:
1. Map out searcher intent: What question must be answered in the first 2 paragraphs?
2. Create an actionable outline with primary and secondary entity keywords.
3. Draft editorial quality prose with concrete step-by-step instructions.
4. Always generate valid JSON-LD structured data script for insertion into Next.js metadata.`,
    faq: [
      { q: 'Does it support Next.js App Router metadata?', a: 'Yes, it outputs TypeScript Next.js Metadata objects ready for page.tsx.' }
    ],
    tags: ['seo', 'content', 'marketing', 'serp', 'json-ld'],
    installs: 2840,
    rating: 4.85,
    is_pro: false,
    is_featured: false,
    created_at: '2026-03-08',
  },
  {
    id: 'skill-5',
    title: 'Competitor Reverse-Engineering & Pricing Teardown',
    category: 'Business',
    output_type: 'Data',
    description: 'Autonomous market intelligence agent that scrapes rival SaaS pricing tiers, feature gates, customer reviews, and churn complaints to uncover unexploited wedge opportunities.',
    compatible_agents: ['Claude Code', 'Gemini CLI', 'ChatGPT'],
    preview_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
    capabilities: [
      'Maps competitor pricing matrix and price-per-seat models',
      'Extracts top 5 pain points from G2, Trustpilot, and Reddit discussions',
      'Formulates value-add packaging and high-margin lifetime deal strategies',
      'Generates SWOT and feature comparison tables for pitch decks'
    ],
    instructions: [
      'Provide competitor domains or product names.',
      'The skill generates an exhaustive side-by-side positioning audit.',
      'Identifies the exact weaknesses in their customer onboarding and retention.',
      'Recommends an aggressive counter-offer and value proposition.'
    ],
    config: [
      { name: 'COMPETITORS', type: 'string', default: 'Midjourney, PromptBase', description: 'Comma separated rival names' }
    ],
    example_usage: `competitor-teardown --targets "runwayml.com, pika.art" --output deck`,
    install_prompt: `---
name: competitor-intelligence-agent
description: SaaS pricing breakdown and competitive advantage teardown
compatibility: [Claude, Gemini, ChatGPT]
---

You are a VC Product Partner and SaaS Pricing Strategist.

When analyzing competitors:
1. Deconstruct their monetization model: usage-based, tiered, or credit-pack.
2. Pinpoint the primary churn vector reported by active users.
3. Formulate a 3-tier pricing strategy (Free, Pro, Lifetime) that undercuts their friction points.
4. Output comparison matrices in GitHub markdown table format.`,
    faq: [
      { q: 'Is this suitable for early-stage founders?', a: 'Yes, it is designed specifically for founder product-market-fit research.' }
    ],
    tags: ['saas', 'pricing', 'competitors', 'business', 'growth'],
    installs: 3210,
    rating: 4.9,
    is_pro: true,
    is_featured: true,
    created_at: '2026-03-02',
  },
  {
    id: 'skill-6',
    title: 'PostgreSQL & Supabase Architecture Optimizer',
    category: 'Development',
    output_type: 'Code',
    description: 'Designs bulletproof database schemas, Row Level Security (RLS) policies, efficient GIN/B-tree indexes, stored procedures, and realtime event subscriptions for Supabase.',
    compatible_agents: ['Cursor', 'Claude Code', 'Codex'],
    preview_image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1000&auto=format&fit=crop',
    capabilities: [
      'Writes airtight Supabase Row Level Security policies for multi-tenant apps',
      'Creates trigger functions for automatic timestamping and analytics aggregation',
      'Optimizes full-text search indexes with tsvector and pg_trgm extensions',
      'Produces complete migration SQL scripts ready for Supabase CLI'
    ],
    instructions: [
      'Describe the entities, relationships, and user roles.',
      'The skill outputs SQL DDL with primary keys, foreign keys, and cascading rules.',
      'Adds RLS policies for auth.uid() matching and role-based permissions.',
      'Includes database seed scripts for rapid testing.'
    ],
    config: [
      { name: 'POSTGRES_VERSION', type: 'string', default: '16', description: 'Postgres engine' },
      { name: 'AUTH_PROVIDER', type: 'string', default: 'supabase', description: 'Authentication backend' }
    ],
    example_usage: `supabase-architect --entities "prompts,skills,favorites,profiles" --rls true`,
    install_prompt: `---
name: supabase-schema-architect
description: Robust PostgreSQL schema designer with RLS and full-text search
compatibility: [Cursor, Claude, Codex]
---

You are a Principal Database Administrator specializing in PostgreSQL and Supabase.

RULES:
1. Always enable ROW LEVEL SECURITY on all public schema tables.
2. Use UUID primary keys (gen_random_uuid()).
3. Write clean idempotent migrations (CREATE TABLE IF NOT EXISTS).
4. Add composite indexes on foreign keys and frequently queried filter columns.
5. Provide helpful SQL comments on columns explaining business logic.`,
    faq: [
      { q: 'Does it support Prisma or Drizzle?', a: 'Yes, specify your ORM of choice and it provides matching schemas.' }
    ],
    tags: ['supabase', 'postgres', 'sql', 'rls', 'database'],
    installs: 4890,
    rating: 4.98,
    is_pro: false,
    is_featured: true,
    created_at: '2026-03-06',
  }
];

// Curated skill catalog — every skill ships with hand-written positioning,
// capabilities and operating instructions (no template filler).
const additionalSkills: Array<{
  title: string; cat: Skill['category']; out: Skill['output_type'];
  description: string; capabilities: string[]; instructions: string[];
  usage: string; tags: string[];
}> = [
  {
    title: 'AI Cold Email & Lead Qualification Agent',
    cat: 'Marketing', out: 'Content',
    description: 'Drafts hyper-personalized cold emails from a prospect\'s LinkedIn and website signals, then scores replies for buying intent so you only follow up with warm leads.',
    capabilities: [
      'Researches each prospect and writes a unique first line (no {{first_name}} spam)',
      'Scores replies as positive / objection / referral / unsubscribe',
      'Drafts objection-handling follow-ups in your tone of voice',
      'Exports qualified leads to CSV with reason codes',
    ],
    instructions: [
      '1. Provide your ICP, offer, and a list of prospect domains or LinkedIn URLs.',
      '2. Agent researches each prospect and drafts a personalized opener.',
      '3. Review the draft batch, approve or edit, then send via your sequencer.',
      '4. Agent triages replies daily and flags buying-intent signals for human follow-up.',
    ],
    usage: 'cold-email-agent --icp "seed SaaS founders" --prospects prospects.csv --tone direct',
    tags: ['cold-email', 'lead-gen', 'sales', 'outreach'],
  },
  {
    title: 'Autonomous Twitter/X Growth & Thread Architect',
    cat: 'Content', out: 'Content',
    description: 'Turns one idea into a week of X content: hook-first threads, quote-tweet angles, and reply strategies engineered for the current algorithm.',
    capabilities: [
      'Generates 10 hook variants scored by curiosity-gap strength',
      'Expands a single insight into a 7-post thread with pacing beats',
      'Suggests high-leverage accounts to reply to in your niche',
      'Repurposes threads into LinkedIn posts and newsletter sections',
    ],
    instructions: [
      '1. Drop in your raw idea, draft, or a link to a post that performed.',
      '2. Agent produces hook options — pick the strongest two.',
      '3. Agent builds the full thread with cliffhangers between posts.',
      '4. Schedule via your tool of choice; agent suggests posting times.',
    ],
    usage: 'x-growth-agent --idea "AI agents are overhyped" --threads 3 --tone contrarian',
    tags: ['twitter', 'x', 'threads', 'growth', 'social-media'],
  },
  {
    title: 'Next.js App Router Performance & Core Web Vitals Auditor',
    cat: 'Development', out: 'Code',
    description: 'Audits your Next.js App Router build route by route and hands you a prioritized fix list for LCP, INP, and CLS — with exact code diffs.',
    capabilities: [
      'Maps every route to its LCP/INP/CLS offenders (images, fonts, waterfalls)',
      'Flags blocking client components that should be server components',
      'Detects unoptimized images, missing priority hints, and font FOIT',
      'Produces a ranked fix list by estimated milliseconds saved',
    ],
    instructions: [
      '1. Point the agent at your repo (or paste a production URL).',
      '2. Agent traces the render path of your slowest routes.',
      '3. Review the ranked findings, each with a concrete code diff.',
      '4. Apply fixes and re-run to verify the vitals improvement.',
    ],
    usage: 'nextjs-perf-audit --repo ./my-app --routes "/,/pricing,/blog" --budget-lcp 2500',
    tags: ['nextjs', 'performance', 'core-web-vitals', 'lcp', 'audit'],
  },
  {
    title: 'AI Video Scriptwriting & B-Roll Timing Master',
    cat: 'Content', out: 'Video',
    description: 'Writes retention-engineered video scripts with word-level B-roll cues, so your editor knows exactly what to show on every single line.',
    capabilities: [
      'Structures scripts around 3-second hook, open loops, and payoff beats',
      'Attaches a B-roll / cutaway suggestion to every 1–2 lines of dialogue',
      'Calibrates pacing for Shorts (fast cuts) vs long-form (breathing room)',
      'Outputs teleprompter-ready text plus a separate shot list',
    ],
    instructions: [
      '1. Give the topic, target length, and platform (Shorts / YouTube / Reels).',
      '2. Agent drafts the hook first — approve before it writes the body.',
      '3. Agent completes the script with inline [B-ROLL: ...] cues.',
      '4. Export the shot list for your editor and the clean script for recording.',
    ],
    usage: 'video-script-agent --topic "5 AI tools" --length 60s --platform shorts',
    tags: ['video', 'scriptwriting', 'b-roll', 'youtube', 'shorts'],
  },
  {
    title: 'E-commerce Conversion Rate Optimization (CRO) Teardown',
    cat: 'Design', out: 'Websites',
    description: 'Tears down your product and checkout pages like a conversion consultant: friction points, trust gaps, and A/B test hypotheses ranked by expected lift.',
    capabilities: [
      'Heuristic audit of PDP, cart, and checkout against 40+ CRO checkpoints',
      'Identifies trust gaps (reviews, guarantees, shipping clarity)',
      'Writes concrete A/B test hypotheses with success metrics',
      'Benchmarks your page structure against top-converting competitors',
    ],
    instructions: [
      '1. Share your product page URL and current conversion rate if known.',
      '2. Agent runs the teardown and scores each issue by severity.',
      '3. Pick the top 3 hypotheses to test first.',
      '4. Agent drafts the variant copy and layout changes for your dev.',
    ],
    usage: 'cro-teardown --url "mystore.com/products/hero" --vertical skincare',
    tags: ['cro', 'ecommerce', 'checkout', 'ab-testing', 'conversion'],
  },
  {
    title: 'Fintech Security & OWASP Top 10 Penetration Tester',
    cat: 'Development', out: 'Code',
    description: 'Runs a structured OWASP Top 10 review of your fintech app and produces a developer-ready remediation report with severity ratings.',
    capabilities: [
      'Checks auth flows, session handling, and secrets exposure',
      'Reviews API endpoints for IDOR, mass assignment, and rate-limit gaps',
      'Scans dependencies for known CVEs with fix versions',
      'Produces a remediation report ordered by exploitability',
    ],
    instructions: [
      '1. Provide repo access or the API spec plus auth documentation.',
      '2. Agent maps the attack surface and tests each OWASP category.',
      '3. Review findings — each includes proof-of-concept and fix guidance.',
      '4. Re-test after fixes to confirm closure before release.',
    ],
    usage: 'fintech-pentest --target ./api --owasp 2021 --report markdown',
    tags: ['security', 'owasp', 'pentest', 'fintech', 'api'],
  },
  {
    title: 'AI Podcast Audio Cleanup & Show Notes Generator',
    cat: 'Content', out: 'Content',
    description: 'Turns a raw recording into a polished episode package: cleaned audio guidance, chapter markers, show notes, and 5 audiogram-ready clips.',
    capabilities: [
      'Generates timestamped chapters from transcript topic shifts',
      'Writes SEO-friendly show notes with key quotes and links',
      'Extracts 5 short clips with virality scores and captions',
      'Produces audiogram scripts sized for Reels, TikTok, and X',
    ],
    instructions: [
      '1. Upload the episode audio or paste the transcript.',
      '2. Agent detects chapters and drafts the full notes package.',
      '3. Pick your favorite clip moments from the scored shortlist.',
      '4. Export notes to your host and clips to your editor.',
    ],
    usage: 'podcast-packager --audio episode42.mp3 --clips 5 --platforms reels,tiktok',
    tags: ['podcast', 'audio', 'show-notes', 'chapters', 'clips'],
  },
  {
    title: 'Notion & Linear Automated Sync Workflow Agent',
    cat: 'Automation', out: 'Data',
    description: 'Keeps Notion docs and Linear issues in sync both ways: status changes, assignees, and deadlines propagate automatically with a full audit log.',
    capabilities: [
      'Two-way sync of status, assignee, priority, and due dates',
      'Creates Linear issues from Notion action items and vice versa',
      'Conflict resolution rules when both sides change at once',
      'Audit log of every sync event with before/after values',
    ],
    instructions: [
      '1. Connect Notion and Linear API keys and choose the databases/projects.',
      '2. Map fields once (status ↔ state, assignee ↔ owner, etc.).',
      '3. Set conflict rules (e.g. Linear wins on status, Notion wins on docs).',
      '4. Enable the sync and monitor the audit log for the first week.',
    ],
    usage: 'notion-linear-sync --notion-db "Roadmap" --linear-team ENG --direction both',
    tags: ['notion', 'linear', 'sync', 'automation', 'project-management'],
  },
  {
    title: 'Stripe Billing & Dunning Recovery Automation',
    cat: 'Business', out: 'Code',
    description: 'Recovers failed subscription payments with smart retry schedules and empathetic dunning emails — the highest-ROI automation most SaaS teams never build.',
    capabilities: [
      'Smart retry timing based on decline code (not blind retries)',
      'Dunning email sequence tuned per failure reason',
      'In-app payment-update prompts with deep links',
      'Dashboard of recovered vs lost MRR with cohort breakdowns',
    ],
    instructions: [
      '1. Connect your Stripe account (restricted key, read/write on invoices).',
      '2. Agent analyzes your last 90 days of failed payments by decline code.',
      '3. Approve the retry schedule and email copy.',
      '4. Go live and watch the recovered-MRR dashboard weekly.',
    ],
    usage: 'stripe-dunning --recover --lookback 90d --notify "#billing"',
    tags: ['stripe', 'billing', 'dunning', 'saas', 'mrr', 'churn'],
  },
  {
    title: 'Customer Support Sentiment & Churn Prediction Agent',
    cat: 'Research', out: 'Data',
    description: 'Reads every support ticket and flags the customers about to churn — with the exact conversation snippets that predict it — before they cancel.',
    capabilities: [
      'Sentiment scoring per ticket, customer, and time window',
      'Churn-risk model combining sentiment, ticket volume, and resolution time',
      'Weekly at-risk list with suggested save plays per account',
      'Trend alerts when a new issue spikes across tickets',
    ],
    instructions: [
      '1. Connect your helpdesk (Intercom, Zendesk, Freshdesk) read API.',
      '2. Agent backfills 6 months of tickets and calibrates the risk model.',
      '3. Review the first at-risk list with your success team.',
      '4. Run weekly; agent tracks which save plays actually worked.',
    ],
    usage: 'support-churn-watch --source intercom --alert-threshold high --digest weekly',
    tags: ['support', 'sentiment', 'churn', 'nlp', 'customer-success'],
  },
  {
    title: '3D Blender Python Procedural Asset Generator',
    cat: 'Design', out: 'Code',
    description: 'Generates production-ready Blender Python scripts for procedural 3D assets — materials, geometry nodes, and batch renders — without touching the node editor.',
    capabilities: [
      'Writes bpy scripts for procedural models from text specs',
      'Builds geometry-node trees programmatically with named parameters',
      'Creates PBR material setups with texture baking presets',
      'Batch-renders turntables with consistent lighting rigs',
    ],
    instructions: [
      '1. Describe the asset (e.g. "low-poly stylized pine tree, 3 LODs").',
      '2. Agent writes the Blender Python script — review before running.',
      '3. Run headless with blender --background --python script.py.',
      '4. Iterate on parameters; agent versions each script.',
    ],
    usage: 'blender-proc-gen --asset "stylized rock formation" --lods 3 --render turntable',
    tags: ['blender', '3d', 'procedural', 'python', 'geometry-nodes'],
  },
  {
    title: 'Shopify Liquid Theme Micro-Interaction Enhancer',
    cat: 'Development', out: 'Websites',
    description: 'Adds tasteful micro-interactions to your Shopify theme — cart drawer physics, hover states, and scroll reveals — in clean Liquid-compatible code.',
    capabilities: [
      'Cart drawer, announcement bar, and mega-menu motion upgrades',
      'Scroll-triggered reveals that respect prefers-reduced-motion',
      'Hover states for product cards with quick-add affordances',
      'Performance-budgeted: no jank, lazy-loaded motion code',
    ],
    instructions: [
      '1. Share your theme name/version or the snippets to enhance.',
      '2. Agent proposes 5 micro-interactions ranked by conversion impact.',
      '3. Approve the set; agent writes the Liquid/JS/CSS diffs.',
      '4. Test on a preview theme before publishing.',
    ],
    usage: 'shopify-motion --theme dawn --interactions cart,hover,reveal --budget 50kb',
    tags: ['shopify', 'liquid', 'micro-interactions', 'ecommerce', 'ux'],
  },
  {
    title: 'TikTok UGC Creator Outreach & Briefing Coordinator',
    cat: 'Marketing', out: 'Marketing',
    description: 'Finds the right micro-creators, negotiates, and briefs them with shot-by-shot creative direction — a full UGC pipeline in one agent.',
    capabilities: [
      'Creator shortlisting by niche, engagement rate, and audience fit',
      'Outreach DM and email templates personalized per creator',
      'Shot-by-shot briefs with hooks, CTAs, and do/don\'t lists',
      'Tracks deliverables, usage rights, and payment milestones',
    ],
    instructions: [
      '1. Define your product, budget per video, and creator criteria.',
      '2. Agent shortlists creators and drafts personalized outreach.',
      '3. For confirmed creators, agent generates the creative brief.',
      '4. Track deliveries in the built-in pipeline board until posting.',
    ],
    usage: 'ugc-outreach --product "vitamin C serum" --budget 80 --creators 10 --niche skincare',
    tags: ['tiktok', 'ugc', 'creators', 'outreach', 'influencer'],
  },
  {
    title: 'Semantic PDF Data Extraction & Knowledge Graph Builder',
    cat: 'Research', out: 'Data',
    description: 'Converts dense PDFs into a queryable knowledge graph: entities, relationships, and cited claims — not just a text dump.',
    capabilities: [
      'Extracts entities, dates, figures, and claims with page citations',
      'Links related concepts across multiple documents',
      'Answers questions with cited spans, not hallucinations',
      'Exports to Neo4j, JSON-LD, or markdown research briefs',
    ],
    instructions: [
      '1. Upload PDFs (research papers, reports, contracts).',
      '2. Agent parses structure and builds the entity graph.',
      '3. Query in natural language — every answer cites its page.',
      '4. Export the graph or a synthesized brief for your team.',
    ],
    usage: 'pdf-kg --inputs "./papers/*.pdf" --export neo4j --cite-pages',
    tags: ['pdf', 'knowledge-graph', 'rag', 'research', 'extraction'],
  },
  {
    title: 'Automated GitHub CI/CD Docker Deployer',
    cat: 'Automation', out: 'Code',
    description: 'Ships a hardened GitHub Actions pipeline that builds, scans, and deploys your Dockerized app with zero-downtime rollouts and instant rollbacks.',
    capabilities: [
      'Multi-stage Docker builds with layer caching for fast CI',
      'Image vulnerability scanning that blocks on critical CVEs',
      'Blue-green or rolling deploys with health-check gates',
      'One-command rollback and deploy notifications to Slack',
    ],
    instructions: [
      '1. Provide your repo, Dockerfile path, and target host.',
      '2. Agent generates the workflow YAML and compose files.',
      '3. Review secrets wiring, then merge to main for a dry run.',
      '4. Promote to production; agent monitors the first deploy.',
    ],
    usage: 'cicd-deployer --repo my/app --dockerfile ./Dockerfile --target fly.io',
    tags: ['github-actions', 'docker', 'ci-cd', 'deploy', 'devops'],
  },
  {
    title: 'Product Launch & Product Hunt Upvote Campaign Strategist',
    cat: 'Marketing', out: 'Marketing',
    description: 'Plans your entire launch week: Product Hunt asset checklist, hunter outreach, launch-day war room timeline, and post-launch momentum plays.',
    capabilities: [
      'Asset checklist: tagline, thumbnails, GIFs, first comment, maker comment',
      'Hunter and community outreach sequences for launch week',
      'Minute-by-minute launch day timeline (12:01 AM PT to midnight)',
      'Post-launch plays: badges, social proof, and directory submissions',
    ],
    instructions: [
      '1. Share your product one-liner, launch date, and hunter (if any).',
      '2. Agent builds the asset checklist with deadlines.',
      '3. Execute outreach in the 2 weeks before launch.',
      '4. Run launch day from the war-room timeline; debrief after.',
    ],
    usage: 'ph-launch --product "Aicorn" --date 2026-11-01 --hunter none',
    tags: ['product-hunt', 'launch', 'go-to-market', 'startup'],
  },
];

additionalSkills.forEach((item, index) => {
  const idNum = 7 + index;
  SKILLS_DATA.push({
    id: `skill-${idNum}`,
    title: item.title,
    category: item.cat,
    output_type: item.out,
    description: item.description,
    compatible_agents: ['Claude Code', 'Cursor', 'Gemini CLI', 'ChatGPT'],
    preview_image: `https://picsum.photos/seed/aicorn-skill-${idNum}/1000/600`,
    capabilities: item.capabilities,
    instructions: item.instructions,
    config: [
      { name: 'EXECUTION_MODE', type: 'select', default: 'Production', description: 'Execution safety profile' }
    ],
    example_usage: item.usage,
    install_prompt: `---
name: ${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}
description: ${item.title} automated agent instruction pack
compatibility: [Claude, Cursor, Gemini, ChatGPT]
---

You are an expert specialist in ${item.title}. ${item.description} Execute tasks following structured step-by-step logic, prioritizing accuracy, clarity, and zero regressions.`,
    faq: [
      { q: 'Is this skill production ready?', a: 'Yes, extensively tested in production CI and agentic workflows.' }
    ],
    tags: item.tags,
    installs: 1500 + idNum * 120,
    rating: 4.8 + ((idNum % 3) * 0.1),
    is_pro: idNum % 3 === 0,
    is_featured: idNum % 4 === 0,
    created_at: `2026-03-${idNum % 25 + 1}`,
  });
});
