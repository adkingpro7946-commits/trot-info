import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SampleBadge } from '@/components/badges';
import { parseArray } from '@/lib/json';
import { formatDate } from '@/lib/format';

export const revalidate = 600;

async function get(slug: string) {
  return prisma.artist.findFirst({
    where: { slug, status: 'published' },
    include: { music: { where: { status: 'published' }, orderBy: { releaseDate: 'desc' } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await get(slug);
  if (!a) return { title: '가수를 찾을 수 없음' };
  return buildMetadata({
    title: `${a.stageName} 음반·디스코그래피 정리`,
    description: `${a.stageName}의 발매 음반과 대표곡을 정리했습니다.`,
    path: `/artists/${a.slug}/discography`,
  });
}

export default async function DiscographyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await get(slug);
  if (!a) notFound();
  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '가수', path: '/artists' }, { name: a.stageName, path: `/artists/${a.slug}` }, { name: '음반', path: `/artists/${a.slug}/discography` }]} />
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink-900">{a.stageName} 음반 {a.isSample && <SampleBadge />}</h1>
      {a.music.length ? (
        <ul className="mt-6 space-y-3">
          {a.music.map((m) => {
            const tracks = parseArray(m.trackList);
            return (
              <li key={m.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/music/${m.slug}`} className="font-semibold text-ink-900 hover:text-brand-600">{m.title}</Link>
                  {m.releaseDate && <span className="text-xs text-slate-500">{formatDate(m.releaseDate)}</span>}
                </div>
                {tracks.length > 0 && <p className="mt-1 text-sm text-ink-700">수록곡: {tracks.join(', ')}</p>}
              </li>
            );
          })}
        </ul>
      ) : <p className="mt-6 text-sm text-slate-500">등록된 음반이 없습니다.</p>}
    </div>
  );
}
