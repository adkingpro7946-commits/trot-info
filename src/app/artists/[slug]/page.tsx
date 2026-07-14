import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { SampleBadge } from '@/components/badges';
import { Avatar } from '@/components/Avatar';
import { EventCard, ArticleCard } from '@/components/cards';
import { SourceList } from '@/components/SourceList';
import { artistProfileLd } from '@/lib/structured-data';
import { parseSocialLinks } from '@/lib/json';
import { formatDate } from '@/lib/format';

export const revalidate = 600;

async function getArtist(slug: string) {
  return prisma.artist.findFirst({
    where: { slug, status: 'published' },
    include: {
      awards: { orderBy: { year: 'desc' } },
      timeline: { orderBy: { date: 'desc' } },
      music: { where: { status: 'published' }, orderBy: { releaseDate: 'desc' } },
      events: { where: { status: 'published' }, orderBy: { startDateTime: 'asc' }, include: { artists: { select: { stageName: true } } } },
      programs: { where: { status: 'published' } },
      articles: { where: { status: 'published' }, orderBy: { publishedAt: 'desc' }, take: 5 },
      sources: true,
    },
  });
}

export async function generateStaticParams() {
  try {
    const artists = await prisma.artist.findMany({ where: { status: 'published' }, select: { slug: true } });
    return artists.map((a) => ({ slug: a.slug }));
  } catch {
    return []; // 빌드 시 DB 미접속이어도 통과 (런타임 ISR 렌더)
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) return { title: '가수를 찾을 수 없음' };
  return buildMetadata({
    title: `${artist.stageName} 프로필 · 대표곡·방송·공연 일정 정리`,
    description: artist.profileSummary.slice(0, 150),
    path: `/artists/${artist.slug}`,
    type: 'profile',
  });
}

// 값이 있을 때만 표시하는 정보행 (확인 안 된 값은 숨김, §4)
function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex gap-3 py-1.5">
      <dt className="w-24 shrink-0 text-sm text-slate-500">{label}</dt>
      <dd className="text-sm text-ink-800">{value}</dd>
    </div>
  );
}

export default async function ArtistProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) notFound();

  const social = parseSocialLinks(artist.officialSocialLinks);
  const now = new Date();
  const nextEvent = artist.events.find((e) => e.startDateTime >= now && !['cancelled', 'completed'].includes(e.eventStatus));
  const latestMusic = artist.music[0];
  const latestArticle = artist.articles[0];

  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '가수', path: '/artists' }, { name: artist.stageName, path: `/artists/${artist.slug}` }]} />
      <JsonLd
        data={artistProfileLd({
          slug: artist.slug,
          stageName: artist.stageName,
          realName: artist.realName,
          profileSummary: artist.profileSummary,
          birthDate: artist.birthDate,
          birthPlace: artist.birthPlace,
          officialWebsite: artist.officialWebsite,
          socialUrls: social.map((s) => s.url),
        })}
      />

      <header className="flex items-center gap-4">
        <Avatar name={artist.stageName} size="xl" className="!h-20 !w-20 text-3xl sm:!h-24 sm:!w-24" ring />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold text-ink-900">{artist.stageName}</h1>
            {artist.isSample && <SampleBadge />}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {[artist.agency, artist.debutDate ? `${formatDate(artist.debutDate)} 데뷔` : null].filter(Boolean).join(' · ')}
          </p>
        </div>
      </header>

      {/* 첫 화면: 3문장 핵심 소개 + 최근/다음 요약 (§4) */}
      <p className="mt-3 max-w-content leading-7 text-ink-800">{artist.profileSummary}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">다음 공연</p>
          {nextEvent ? (
            <Link href={`/events/${nextEvent.slug}`} className="mt-1 block text-sm font-semibold text-brand-700 hover:underline">
              {formatDate(nextEvent.startDateTime)} · {nextEvent.eventName}
            </Link>
          ) : <p className="mt-1 text-sm text-slate-400">예정된 공개 일정 없음</p>}
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">최근 발매</p>
          {latestMusic ? (
            <Link href={`/music/${latestMusic.slug}`} className="mt-1 block text-sm font-semibold text-brand-700 hover:underline">
              {latestMusic.title}
            </Link>
          ) : <p className="mt-1 text-sm text-slate-400">등록된 음반 없음</p>}
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">최근 소식</p>
          {latestArticle ? (
            <Link href={`/news/${latestArticle.slug}`} className="mt-1 block text-sm font-semibold text-brand-700 hover:underline line-clamp-2">
              {latestArticle.title}
            </Link>
          ) : <p className="mt-1 text-sm text-slate-400">등록된 소식 없음</p>}
        </div>
      </div>

      {/* 기본 정보 — 확인된 항목만 (§4) */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-ink-900">기본 정보</h2>
        <dl className="mt-2 divide-y divide-slate-100">
          <Row label="활동명" value={artist.stageName} />
          <Row label="본명" value={artist.realName} />
          <Row label="출생지" value={artist.birthPlace} />
          <Row label="데뷔" value={artist.debutDate ? formatDate(artist.debutDate) : null} />
          <Row label="소속사" value={artist.agency} />
          <Row label="팬덤" value={artist.fanClubName} />
          <Row
            label="공식"
            value={
              artist.officialWebsite || social.length ? (
                <span className="flex flex-wrap gap-2">
                  {artist.officialWebsite && <a href={artist.officialWebsite} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-600 underline">공식 홈페이지</a>}
                  {social.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-600 underline">{s.label}</a>)}
                </span>
              ) : null
            }
          />
        </dl>
        <p className="mt-2 text-xs text-slate-400">
          확인되지 않은 항목(나이·가족관계 등)은 표시하지 않습니다.
          {artist.lastFactCheckedAt && ` · 마지막 확인일 ${formatDate(artist.lastFactCheckedAt)}`}
        </p>
      </section>

      {/* 공연 */}
      {artist.events.length > 0 && (
        <section className="mt-8">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-ink-900">공연 일정</h2>
            <Link href={`/artists/${artist.slug}/events`} className="text-sm text-brand-600 hover:underline">전체 보기</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {artist.events.slice(0, 4).map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {/* 음반 / 대표곡 */}
      {artist.music.length > 0 && (
        <section className="mt-8">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-ink-900">음반·대표곡</h2>
            <Link href={`/artists/${artist.slug}/discography`} className="text-sm text-brand-600 hover:underline">전체 보기</Link>
          </div>
          <ul className="space-y-2">
            {artist.music.map((m) => (
              <li key={m.id} className="rounded-lg border border-slate-200 p-3">
                <Link href={`/music/${m.slug}`} className="font-semibold text-ink-900 hover:text-brand-600">{m.title}</Link>
                {m.releaseDate && <span className="ml-2 text-xs text-slate-500">{formatDate(m.releaseDate)} 발매</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 수상 */}
      {artist.awards.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink-900">수상 내역</h2>
          <ul className="mt-2 space-y-1 text-sm text-ink-800">
            {artist.awards.map((aw) => (
              <li key={aw.id}>{aw.year ? `${aw.year} · ` : ''}{aw.title}{aw.org ? ` (${aw.org})` : ''}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 활동 연대기 (요약) */}
      {artist.timeline.length > 0 && (
        <section className="mt-8">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-ink-900">활동 연대기</h2>
            <Link href={`/artists/${artist.slug}/timeline`} className="text-sm text-brand-600 hover:underline">전체 보기</Link>
          </div>
          <ol className="relative space-y-3 border-l border-slate-200 pl-4">
            {artist.timeline.slice(0, 5).map((t) => (
              <li key={t.id}>
                <p className="text-xs text-slate-500">{formatDate(t.date)}</p>
                <p className="text-sm font-medium text-ink-900">{t.title}</p>
                {t.description && <p className="text-sm text-ink-700">{t.description}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 관련 프로그램 */}
      {artist.programs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink-900">관련 프로그램</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {artist.programs.map((p) => (
              <Link key={p.id} href={`/programs/${p.slug}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-ink-700 hover:bg-brand-50">{p.name}</Link>
            ))}
          </div>
        </section>
      )}

      {/* 최근 소식 */}
      {artist.articles.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink-900">최근 소식</h2>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {artist.articles.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>
      )}

      {/* 공식 출처 */}
      {artist.sources.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink-900">공식 출처</h2>
          <div className="mt-2"><SourceList sources={artist.sources} /></div>
        </section>
      )}
    </div>
  );
}
