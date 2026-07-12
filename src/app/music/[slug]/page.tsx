import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { SampleBadge } from '@/components/badges';
import { SourceList } from '@/components/SourceList';
import { musicLd } from '@/lib/structured-data';
import { parseArray } from '@/lib/json';
import { formatDate } from '@/lib/format';

export const revalidate = 600;

async function get(slug: string) {
  return prisma.music.findFirst({
    where: { slug, status: 'published' },
    include: { artists: true, sources: true },
  });
}

export async function generateStaticParams() {
  try {
    const ms = await prisma.music.findMany({ where: { status: 'published' }, select: { slug: true } });
    return ms.map((m) => ({ slug: m.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = await get(slug);
  if (!m) return { title: '음반을 찾을 수 없음' };
  return buildMetadata({
    title: `${m.title} 발매일·수록곡 정보`,
    description: m.description ?? `${m.title} 발매 정보와 수록곡 안내.`,
    path: `/music/${m.slug}`,
  });
}

export default async function MusicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = await get(slug);
  if (!m) notFound();
  const tracks = parseArray(m.trackList);

  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '신곡·앨범', path: '/music' }, { name: m.title, path: `/music/${m.slug}` }]} />
      <JsonLd data={musicLd({ slug: m.slug, title: m.title, type: m.type, releaseDate: m.releaseDate, artistNames: m.artists.map((a) => a.stageName), tracks })} />
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-extrabold text-ink-900">{m.title}</h1>
        {m.isSample && <SampleBadge />}
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {m.artists.map((a, i) => (
          <span key={a.id}>{i > 0 && ', '}<Link href={`/artists/${a.slug}`} className="text-brand-600 hover:underline">{a.stageName}</Link></span>
        ))}
        {m.releaseDate && <> · {formatDate(m.releaseDate)} 발매</>}
        {m.label && <> · {m.label}</>}
      </p>
      {m.description && <p className="mt-4 text-ink-800">{m.description}</p>}
      {tracks.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-bold text-ink-900">수록곡</h2>
          <ol className="mt-2 list-decimal pl-5 text-sm text-ink-800">{tracks.map((t, i) => <li key={i}>{t}</li>)}</ol>
        </section>
      )}
      {m.sources.length > 0 && (
        <section className="mt-8 border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-ink-900">공식 출처</h2>
          <div className="mt-2"><SourceList sources={m.sources} /></div>
        </section>
      )}
    </div>
  );
}
