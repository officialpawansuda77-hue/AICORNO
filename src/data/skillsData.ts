import { Skill } from '@/types';

export const SKILLS_DATA: Skill[] = [
  {
    id: 'skill-1',
    title: 'AI YouTube Research & Hook Engineering Agent',
    category: 'Research',
    output_type: 'Research',
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

// Additional skills to satisfy >= 20 requirement
const additionalSkillTitles = [
  { title: 'AI Cold Email & Lead Qualification Agent', cat: 'Marketing', out: 'Content' },
  { title: 'Autonomous Twitter/X Growth & Thread Architect', cat: 'Content', out: 'Content' },
  { title: 'Next.js App Router Performance & Core Web Vitals Auditor', cat: 'Development', out: 'Code' },
  { title: 'AI Video Scriptwriting & B-Roll Timing Master', cat: 'Content', out: 'Video' },
  { title: 'E-commerce Conversion Rate Optimization (CRO) Teardown', cat: 'Design', out: 'Websites' },
  { title: 'Fintech Security & OWASP Top 10 Penetration Tester', cat: 'Development', out: 'Code' },
  { title: 'AI Podcast Audio Cleanup & Show Notes Generator', cat: 'Content', out: 'Content' },
  { title: 'Notion & Linear Automated Sync Workflow Agent', cat: 'Automation', out: 'Data' },
  { title: 'Stripe Billing & Dunning Recovery Automation', cat: 'Business', out: 'Code' },
  { title: 'Customer Support Sentiment & Churn Prediction Agent', cat: 'Research', out: 'Data' },
  { title: '3D Blender Python Procedural Asset Generator', cat: 'Design', out: 'Code' },
  { title: 'Shopify Liquid Theme Micro-Interaction Enhancer', cat: 'Development', out: 'Websites' },
  { title: 'TikTok UGC Creator Outreach & Briefing Coordinator', cat: 'Marketing', out: 'Marketing' },
  { title: 'Semantic PDF Data Extraction & Knowledge Graph Builder', cat: 'Research', out: 'Data' },
  { title: 'Automated GitHub CI/CD Docker Deployer', cat: 'Automation', out: 'Code' },
  { title: 'Product Launch & Product Hunt Upvote Campaign Strategist', cat: 'Marketing', out: 'Marketing' }
];

additionalSkillTitles.forEach((item, index) => {
  const idNum = 7 + index;
  SKILLS_DATA.push({
    id: `skill-${idNum}`,
    title: item.title,
    category: item.cat as any,
    output_type: item.out as any,
    description: `Specialized agent instruction pack designed to automate ${item.title.toLowerCase()} with high fidelity, rigorous safety bounds, and reproducible deliverables.`,
    compatible_agents: ['Claude Code', 'Cursor', 'Gemini CLI', 'ChatGPT'],
    preview_image: `https://images.unsplash.com/photo-${1510000000000 + (idNum * 87654321) % 2000000000}?q=80&w=1000&auto=format&fit=crop`,
    capabilities: [
      `Automates end-to-end ${item.title.toLowerCase()} execution`,
      'Applies industry best practices and edge-case filtering',
      'Provides human-in-the-loop review checkpoints',
      'Generates exportable documentation and structured JSON/Markdown results'
    ],
    instructions: [
      '1. Provide project environment variables or input parameters.',
      '2. Agent conducts validation checks before executing commands.',
      '3. Formulates deliverables according to the standardized rubric.',
      '4. Finalizes output with self-diagnostic verification logs.'
    ],
    config: [
      { name: 'EXECUTION_MODE', type: 'select', default: 'Production', description: 'Execution safety profile' }
    ],
    example_usage: `run-skill-${idNum} --input "config.json"`,
    install_prompt: `---
name: ${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}
description: ${item.title} automated agent instruction pack
compatibility: [Claude, Cursor, Gemini, ChatGPT]
---

You are an expert specialist in ${item.title}. Execute tasks following structured step-by-step logic, prioritizing accuracy, clarity, and zero regressions.`,
    faq: [
      { q: 'Is this skill production ready?', a: 'Yes, extensively tested in production CI and agentic workflows.' }
    ],
    tags: [item.cat.toLowerCase(), item.out.toLowerCase(), 'agent-skill', 'ai-automation'],
    installs: 1500 + idNum * 120,
    rating: 4.8 + ((idNum % 3) * 0.1),
    is_pro: idNum % 3 === 0,
    is_featured: idNum % 4 === 0,
    created_at: `2026-03-${idNum % 25 + 1}`,
  });
});
