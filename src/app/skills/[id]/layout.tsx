import type { Metadata } from 'next';
import { SKILLS_DATA } from '@/data/skillsData';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const skill = SKILLS_DATA.find((item) => item.id === id);
  return {
    title: skill?.title || 'AI Agent Skill',
    description: skill?.description || 'Production-tested AI agent skill from AICORN.',
    alternates: { canonical: `/skills/${id}` },
    openGraph: skill ? { images: [{ url: skill.preview_image, alt: skill.title }] } : undefined,
  };
}

export default function SkillIdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
