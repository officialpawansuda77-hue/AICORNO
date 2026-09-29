import { BlogPost } from '@/types';

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'anatomy-of-a-viral-veo-3-video-prompt',
    title: 'The Anatomy of a Viral Veo 3 Video Prompt: Camera Pacing, Lighting & Direction',
    excerpt: 'How Hollywood-style camera language, FPV drone speeds, and physical light specifications transform generic AI video into award-winning commercials.',
    content: `## The Secret to High-End AI Video Generation

Most creators generate mediocre AI video because they describe *what* they want to see, rather than *how the camera observes it*. In 2026, models like Google Veo 3, Kling 1.5, and OpenAI Sora simulate physics engines rather than static pixels. To unlock photorealistic commercial fidelity, you must direct the AI like a director of photography.

### 1. Camera Movement Dictates Temporal Flow
Instead of writing "a luxury sports car driving fast", specify the camera rig:

\`\`\`text
FPV racing drone diving from 300 feet, matching vehicle velocity at 85mph, 
skimming 6 inches above asphalt, transitioning to smooth 35mm anamorphic side-tracking shot.
\`\`\`

When you give the model speed vectors and physical spatial constraints, it maintains optical consistency and eliminates distortion artifacts.

### 2. Physical Lighting Over Generic Adjectives
Words like "beautiful", "epic", or "cinematic" provide zero mathematical guidance. Instead, specify the Kelvin temperature and light fixtures:

- **Golden hour 2800K**: Warm specular rim light with long raking shadows.
- **Moody Noir 5600K**: Harsh single key source with high-contrast chiaroscuro falloff.
- **Commercial Studio**: Dual strip softboxes with diffused floor bounce.

### 3. Directing the Cut
Keep single prompt duration between 5 to 10 seconds. AI video models maintain peak structural coherence when focused on a single dynamic camera transition rather than sprawling narrative plots.`,
    category: 'AI Video',
    author: {
      name: 'Julian Vance',
      role: 'Head of Visual Engineering',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
    },
    date: 'March 18, 2026',
    read_time: '6 min read',
    cover_image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop'
  },
  {
    slug: 'keep-your-creations-free-of-ai-slop',
    title: 'Keep Your Creations Free of AI Slop: Why Visual Taste is the New Moat',
    excerpt: 'The internet is flooded with generic purple neon dashboards and hallucinatory hands. Here is how curated prompt architecture elevates professional creators.',
    content: `## Beyond the Template Trap

In late 2024, the web reached peak "AI slop" — homogenous, overly saturated imagery with plastic skin textures, hyperactive camera pans, and purple-magenta gradient cards.

At AICORN, we set out with a radical premise: **Taste is the ultimate moat.**

### What Constitutes "AI Slop"?
1. **Unchecked Color Saturation**: Defaulting to neon greens and electric purples without tonal restraint.
2. **Missing Real-World Imperfections**: Real photography has dust motes, micro-scratches on glass, and organic textile grain.
3. **Lazy Adjective Stacking**: The famous "photorealistic, 8k, octane render, trending on artstation" crutch that actually confuses modern reasoning models.

### The AICORN Standard
Every prompt and skill in our catalog is hand-vetted through three editorial criteria:
- **Reproducibility**: Does it generate consistent results across seed variations?
- **Commercial Utility**: Can an agency or studio immediately deploy this in client campaigns?
- **Visual Poise**: Does it respect typography, negative space, and natural optics?`,
    category: 'Editorial',
    author: {
      name: 'Elena Rostova',
      role: 'Creative Director',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
    },
    date: 'March 12, 2026',
    read_time: '5 min read',
    cover_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop'
  },
  {
    slug: 'agent-skills-vs-prompts-explained',
    title: 'Prompts vs. Agent Skills: Understanding the 2026 Autonomous Paradigm',
    excerpt: 'Why static text prompts are giving way to executable instruction packs that orchestrate multi-step code, research, and design pipelines.',
    content: `## The Evolution from Prompts to Skills

For the last three years, generative AI revolved around the prompt box. You typed a sentence; you received an image or text.

In 2026, with the arrival of tools like Claude Code, Cursor Composer, and Antigravity, the unit of creation has fundamentally changed: **welcome to Agent Skills.**

### What is an Agent Skill?
An Agent Skill is not a one-sentence instruction. It is an executable package containing:
- **System Constraints**: Rules of engagement (e.g. "Never introduce unvetted dependencies").
- **Multi-Step Workflows**: Phased execution logic (Isolate -> Test -> Patch -> Verify).
- **Tool Orchestration**: Instructions on when to browse the web, execute terminal scripts, or generate assets.
- **Verification Rubrics**: Self-evaluating criteria that verify whether the output actually works.

By packaging these into reusable \`SKILL.md\` definitions, creators can equip their AI agents with deep specialist capabilities in seconds.`,
    category: 'Agent Skills',
    author: {
      name: 'Kenji Sato',
      role: 'AI Systems Architect',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop'
    },
    date: 'March 08, 2026',
    read_time: '7 min read',
    cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop'
  },
  {
    slug: 'flux-pro-vs-midjourney-v6-breakdown',
    title: 'Flux.1 Pro vs. Midjourney v6.1: Detailed Commercial Prompt Shootout',
    excerpt: 'We tested 50 identical prompts across typography, anatomy, macro textures, and luxury automotive. Here are the definitive strengths of each model.',
    content: `## The Great Image Model Shootout

Choosing between Black Forest Labs' Flux.1 Pro and Midjourney v6.1 is no longer a matter of quality; it's a matter of creative intent.

### Where Flux.1 Pro Dominates
- **Typography & Signs**: Flux effortlessly renders sharp, legible, misspelled-free typography on billboards, shirts, and packaging.
- **Anatomy & Hands**: Flawless fingernails, knuckles, and accurate limb perspective without deformities.
- **Prompt Adherence**: High fidelity to spatial modifiers (e.g., "sitting on the left side of the third table").

### Where Midjourney v6.1 Shines
- **Editorial Lighting & Fashion**: Cinematic mood, film grain, and photographic nuance that feels instinctively like an analog Leica or Hasselblad.
- **Stylized Illustration**: Anime, 3D clay characters, and oil paintings have a warmth that requires zero complex parameter tuning.`,
    category: 'Prompt Engineering',
    author: {
      name: 'Maya Harris',
      role: 'Staff Prompt Engineer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop'
    },
    date: 'March 01, 2026',
    read_time: '8 min read',
    cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'
  }
];
