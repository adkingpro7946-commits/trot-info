import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { SampleBadge, EventStatusBadge } from '@/components/badges';
import { Avatar } from '@/components/Avatar';
import { SourceList } from '@/components/SourceList';
import { eventLd } from '@/lib/structured-data';
import { regionLabel } from '@/lib/enums';
import { formatDate, formatDateTime } from '@/lib/format';

export const revalidate = 300;

async function getEvent(slug: string) {
  return prisma.event.findFirst({
    where: { slug, status: 'published' },
    include: { artists: true, sources: true },
  });
}

export async function generateStaticParams() {
  try {
    const evs = await prisma.event.findMany({ where: { status: 'published' }, select: { slug: true } });
    return evs.map((e) => ({ slug: e.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEvent(slug);
  if (!e) return { title: '공연을 찾을 수 없음' };
  return buildMetadata({
    title: `${e.eventName} 날짜·장소·예매 정보`,
    description: `${e.eventName} — ${formatDate(e.startDateTime)}${e.venue ? ` · ${e.venue}` : ''}. 공식 출처 기반 안내. 일정은 변경될 수 있습니다.`,
    path: `/events/${e.slug}`,
  });
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 border-b border-slate-100 py-2">
      <dt className="w-24 shrink-0 text-sm text-slate-500">{label}</dt>
      <dd className="text-sm text-ink-800">{value}</dd>
    </div>
  );
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getEvent(slug);
  if (!e) notFound();

  const alert =
    e.eventStatus === 'cancelled' ? { text: '이 공연은 취소되었습니다.', cls: 'bg-red-50 text-red-700' } :
    e.eventStatus === 'postponed' ? { text: '이 공연은 연기되었습니다. 변경 일정을 공식 출처에서 확인하세요.', cls: 'bg-orange-50 text-orange-700' } :
    null;

  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '공연 일정', path: '/events' }, { name: e.eventName, path: `/events/${e.slug}` }]} />
      <JsonLd
        data={eventLd({
          slug: e.slug, eventName: e.eventName, startDateTime: e.startDateTime, endDateTime: e.endDateTime,
          venue: e.venue, address: e.address, eventStatus: e.eventStatus, ticketUrl: e.ticketUrl,
          performers: e.artists.map((a) => a.stageName),
        })}
      />

      {/* 취소/연기 상단 안내 (§5) */}
      {alert && <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-semibold ${alert.cls}`}>{alert.text}</div>}

      {/* 무대 배너 (얼굴 사진 아님 — 저작권 안전) */}
      <div className="relative mb-4 overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/stage-banner.svg" alt="공연 무대 이미지" width={1200} height={360} className="h-40 w-full object-cover sm:h-52" />
        <span className="absolute left-3 top-3 flex items-center gap-2">
          <EventStatusBadge status={e.eventStatus} />
          {e.isSample && <SampleBadge />}
        </span>
        {e.artists.length > 0 && (
          <span className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="flex -space-x-2">
              {e.artists.map((a) => <Avatar key={a.id} name={a.stageName} size="md" ring />)}
            </span>
            <span className="rounded-full bg-black/40 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
              {e.artists.map((a) => a.stageName).join(', ')}
            </span>
          </span>
        )}
      </div>
      <h1 className="text-2xl font-extrabold text-ink-900">{e.eventName}</h1>

      <dl className="mt-5">
        <InfoRow label="일시" value={formatDateTime(e.startDateTime) + (e.endDateTime ? ` ~ ${formatDateTime(e.endDateTime)}` : '')} />
        <InfoRow label="장소" value={e.venue} />
        <InfoRow label="주소" value={e.address} />
        <InfoRow label="지역" value={e.region ? regionLabel(e.region) : null} />
        <InfoRow
          label="출연"
          value={e.artists.length ? (
            <span className="flex flex-wrap gap-2">
              {e.artists.map((a) => <Link key={a.id} href={`/artists/${a.slug}`} className="text-brand-600 underline">{a.stageName}</Link>)}
            </span>
          ) : null}
        />
        <InfoRow label="주최" value={e.organizer} />
        <InfoRow label="예매처" value={e.ticketVendor} />
        <InfoRow label="예매 시작" value={e.ticketOpenDate ? formatDateTime(e.ticketOpenDate) : null} />
        <InfoRow label="가격" value={e.priceInformation} />
        <InfoRow label="관람 연령" value={e.ageRestriction} />
        <InfoRow label="교통" value={e.transportInfo} />
      </dl>

      {/* 예매 링크 — 직접 판매 아님을 명시 (§5) */}
      {e.ticketUrl && e.eventStatus !== 'cancelled' && (
        <div className="mt-5">
          <a href={e.ticketUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            공식 예매처로 이동
          </a>
          <p className="mt-2 text-xs text-slate-500">
            본 사이트는 티켓을 직접 판매하지 않습니다. 가격·잔여 좌석은 예매처의 실시간 정보와 다를 수 있습니다.
          </p>
        </div>
      )}

      {/* 출처 + 확인일 */}
      <section className="mt-8 border-t border-slate-200 pt-6">
        <h2 className="text-lg font-bold text-ink-900">공식 출처</h2>
        <div className="mt-2"><SourceList sources={e.sources} /></div>
        {e.sourceCheckedAt && <p className="mt-2 text-xs text-slate-500">마지막 확인일: {formatDate(e.sourceCheckedAt)}. 일정은 변경될 수 있습니다.</p>}
      </section>

      <section className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-ink-700">
        정보가 바뀌었나요?{' '}
        <Link href={`/corrections?url=/events/${e.slug}`} className="font-semibold text-brand-600 hover:underline">정정 요청</Link>
      </section>
    </div>
  );
}
