import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma, safe } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EventCard } from '@/components/cards';
import { Avatar } from '@/components/Avatar';

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: '트로트 방송·프로그램 — 오디션·음악방송 출연 정리',
  description: '미스터트롯·미스트롯·불타는 트롯맨·현역가왕 등 주요 트로트 방송 프로그램과 출연 가수, 공개방송 일정을 정리했습니다.',
  path: '/broadcasts',
});

export default async function BroadcastsPage() {
  const now = new Date();
  const [recordings, programs] = await Promise.all([
    safe(prisma.event.findMany({
      where: { status: 'published', eventType: 'broadcast_recording', startDateTime: { gte: now } },
      include: { artists: { select: { stageName: true } } },
      orderBy: { startDateTime: 'asc' },
    }), []),
    safe(prisma.program.findMany({
      where: { status: 'published' },
      orderBy: { name: 'asc' },
      include: { artists: { where: { status: 'published' }, select: { slug: true, stageName: true } } },
    }), []),
  ]);

  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '방송 일정', path: '/broadcasts' }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">트로트 방송·프로그램</h1>
      <p className="mt-2 max-w-content text-sm text-ink-700">
        트로트 열풍을 이끈 오디션 경연부터 음악방송까지, 주요 트로트 방송 프로그램과 출연 가수를 정리했습니다.
        프로그램별 우승자와 배출 스타는{' '}
        <Link href="/news/trot-audition-programs" className="font-medium text-brand-600 hover:underline">트로트 오디션 프로그램 총정리</Link>
        에서 한눈에 볼 수 있습니다.
      </p>

      {/* 프로그램 카드 (핵심 콘텐츠) */}
      <h2 className="mt-8 text-lg font-bold text-ink-900">주요 프로그램</h2>
      {programs.length ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {programs.map((p) => (
            <article key={p.id} className="rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-bold text-ink-900">
                  <Link href={`/programs/${p.slug}`} className="hover:text-brand-600">{p.name}</Link>
                </h3>
                {p.broadcaster && <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{p.broadcaster}</span>}
              </div>
              {p.description && <p className="mt-2 line-clamp-2 text-sm text-ink-700">{p.description}</p>}
              {p.artists.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                  {p.artists.slice(0, 6).map((a) => (
                    <Link key={a.slug} href={`/artists/${a.slug}`} className="flex items-center gap-1.5 text-sm text-ink-700 hover:text-brand-600">
                      <Avatar name={a.stageName} size="sm" />
                      {a.stageName}
                    </Link>
                  ))}
                  {p.artists.length > 6 && <span className="text-xs text-slate-400">+{p.artists.length - 6}</span>}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : <p className="mt-3 text-sm text-slate-500">등록된 프로그램이 없습니다.</p>}

      {/* 공개방송·녹화 일정 */}
      <h2 className="mt-10 text-lg font-bold text-ink-900">공개방송·녹화 일정</h2>
      {recordings.length ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">{recordings.map((e) => <EventCard key={e.id} event={e} />)}</div>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          현재 공식 확인된 공개방송 일정이 없습니다. 방송 편성은 자주 바뀌므로 각 방송사 편성표에서 최종 확인하세요.
        </p>
      )}

      <p className="mt-8 text-xs text-slate-400">
        방송 편성·출연 정보는 변경될 수 있습니다. 정확한 방송 시간과 다시보기는 각 방송사 공식 편성표를 확인하세요.
      </p>
    </div>
  );
}
