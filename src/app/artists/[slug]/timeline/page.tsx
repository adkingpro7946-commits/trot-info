import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SampleBadge } from '@/components/badges';
import { formatDate } from '@/lib/format';

export const revalidate = 600;

async function get(slug: string) {
  return prisma.artist.findFirst({
    where: { slug, status: 'published' },
    include: { timeline: { orderBy: { date: 'desc' } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await get(slug);
  if (!a) return { title: '가수를 찾을 수 없음' };
  return buildMetadata({
    title: `${a.stageName} 데뷔부터 현재까지 주요 활동 연대기`,
    description: `${a.stageName}의 데뷔·활동·발매·공연을 시간순으로 정리한 연대기.`,
    path: `/artists/${a.slug}/timeline`,
  });
}

export default async function TimelinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await get(slug);
  if (!a) notFound();
  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '가수', path: '/artists' }, { name: a.stageName, path: `/artists/${a.slug}` }, { name: '활동 연대기', path: `/artists/${a.slug}/timeline` }]} />
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink-900">{a.stageName} 활동 연대기 {a.isSample && <SampleBadge />}</h1>
      {a.timeline.length ? (
        <ol className="mt-6 relative space-y-4 border-l border-slate-200 pl-4">
          {a.timeline.map((t) => (
            <li key={t.id}>
              <p className="text-xs text-slate-500">{formatDate(t.date)}</p>
              <p className="font-semibold text-ink-900">{t.title}</p>
              {t.description && <p className="text-sm text-ink-700">{t.description}</p>}
              {t.sourceUrl && <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-xs text-brand-600 underline">출처</a>}
            </li>
          ))}
        </ol>
      ) : <p className="mt-6 text-sm text-slate-500">등록된 연대기가 없습니다.</p>}
    </div>
  );
}
