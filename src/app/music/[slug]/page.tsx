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

// 같은 가수의 다른 음반 (교차링크·내용 보강)
async function otherMusicByArtists(artistIds: string[], excludeSlug: string) {
  if (!artistIds.length) return [];
  return prisma.music.findMany({
    where: { status: 'published', slug: { not: excludeSlug }, artists: { some: { id: { in: artistIds } } } },
    select: { slug: true, title: true, releaseDate: true, type: true },
    orderBy: [{ releaseDate: 'desc' }],
    take: 12,
  });
}

const TYPE_LABEL: Record<string, string> = { album: '정규앨범', mini: '미니앨범', single: '싱글' };

// 빌드 시 프리렌더하지 않고 런타임 ISR로 렌더(빌드 시 Neon 커넥션 풀 고갈 P2024 방지).
// 페이지당 추가 관련-쿼리가 있어 대량 프리렌더 시 빌드가 실패할 수 있으므로 [] 반환.
export async function generateStaticParams() {
  return [];
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
  const primaryArtist = m.artists[0] ?? null;
  const others = await otherMusicByArtists(m.artists.map((a) => a.id), slug);
  const typeLabel = TYPE_LABEL[m.type] ?? '음반';

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
          {tracks.length > 1 && (
            <p className="mt-3 text-sm text-slate-500">
              {m.artists.map((a) => a.stageName).join(', ')}의 {typeLabel} 「{m.title}」에는 총 {tracks.length}곡이 수록됐습니다.
              {m.releaseDate && ` ${formatDate(m.releaseDate)}에 발매됐습니다.`}
            </p>
          )}
        </section>
      )}

      {/* 아티스트 소개 — 곡·앨범의 맥락 보강 */}
      {primaryArtist && (
        <section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-lg font-bold text-ink-900">아티스트</h2>
          <p className="mt-1 font-semibold text-ink-900">
            <Link href={`/artists/${primaryArtist.slug}`} className="hover:text-brand-600">{primaryArtist.stageName}</Link>
          </p>
          {primaryArtist.profileSummary && <p className="mt-1 text-sm leading-6 text-ink-700">{primaryArtist.profileSummary}</p>}
          <Link href={`/artists/${primaryArtist.slug}`} className="mt-2 inline-block text-sm text-brand-600 hover:underline">{primaryArtist.stageName} 프로필·전체 음반 보기 →</Link>
        </section>
      )}

      {/* 같은 가수의 다른 음반 — 교차링크 */}
      {others.length > 0 && primaryArtist && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink-900">{primaryArtist.stageName}의 다른 음반·대표곡</h2>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {others.map((o) => (
              <li key={o.slug} className="rounded-lg border border-slate-200 p-3">
                <Link href={`/music/${o.slug}`} className="font-medium text-ink-900 hover:text-brand-600">{o.title}</Link>
                <span className="ml-2 text-xs text-slate-500">{TYPE_LABEL[o.type] ?? ''}{o.releaseDate ? ` · ${formatDate(o.releaseDate)}` : ''}</span>
              </li>
            ))}
          </ul>
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
