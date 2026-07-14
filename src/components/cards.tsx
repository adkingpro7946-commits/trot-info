import Link from 'next/link';
import { SampleBadge, EventStatusBadge } from './badges';
import { Avatar, AvatarStack } from './Avatar';
import { ARTICLE_TYPE_LABEL, regionLabel } from '@/lib/enums';
import { defaultHeroFor } from '@/lib/seo';
import { formatDate, formatDateTime } from '@/lib/format';

export function ArtistCard({
  artist,
}: {
  artist: { slug: string; stageName: string; profileSummary: string; agency?: string | null; isSample: boolean };
}) {
  return (
    <Link
      href={`/artists/${artist.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:shadow-sm"
    >
      <Avatar name={artist.stageName} size="lg" className="!h-16 !w-16 text-2xl" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-bold text-ink-900 group-hover:text-brand-600">{artist.stageName}</h3>
          {artist.isSample && <SampleBadge />}
        </div>
        {artist.agency && <p className="mt-0.5 text-xs text-slate-500">{artist.agency}</p>}
        <p className="mt-1 line-clamp-2 text-sm text-ink-700">{artist.profileSummary}</p>
      </div>
    </Link>
  );
}

export function ArticleCard({
  article,
}: {
  article: {
    slug: string; title: string; description: string; type: string;
    heroImage?: string | null; heroImageAlt?: string | null;
    publishedAt?: Date | string | null; isSample: boolean;
  };
}) {
  const img = article.heroImage || defaultHeroFor(article.type);
  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 transition hover:border-brand-300 hover:shadow-sm">
      <Link href={`/news/${article.slug}`} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={article.heroImageAlt ?? ''} width={1200} height={630} className="h-32 w-full object-cover" />
      </Link>
      <div className="p-4">
        <div className="mb-1 flex items-center gap-2 text-xs text-brand-600">
          <span className="font-semibold">{ARTICLE_TYPE_LABEL[article.type] ?? article.type}</span>
          {article.isSample && <SampleBadge />}
        </div>
        <h3 className="font-bold text-ink-900">
          <Link href={`/news/${article.slug}`} className="group-hover:text-brand-600">{article.title}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-700">{article.description}</p>
        {article.publishedAt && <p className="mt-2 text-xs text-slate-500">{formatDate(article.publishedAt)}</p>}
      </div>
    </article>
  );
}

export function EventCard({
  event,
}: {
  event: {
    slug: string; eventName: string; startDateTime: Date | string;
    venue?: string | null; region?: string | null; eventStatus: string; isSample: boolean;
    artists?: { stageName: string }[];
  };
}) {
  const performers = event.artists?.map((a) => a.stageName) ?? [];
  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 transition hover:border-brand-300 hover:shadow-sm">
      <Link href={`/events/${event.slug}`} className="relative block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/stage-banner.svg" alt="" width={1200} height={360} className="h-24 w-full object-cover" />
        <span className="absolute left-2 top-2"><EventStatusBadge status={event.eventStatus} /></span>
        {event.isSample && <span className="absolute right-2 top-2"><SampleBadge /></span>}
        {performers.length > 0 && (
          <span className="absolute -bottom-4 left-4">
            <span className="flex -space-x-2">
              {performers.slice(0, 4).map((n, i) => <Avatar key={i} name={n} size="sm" ring />)}
            </span>
          </span>
        )}
      </Link>
      <div className={`p-4 ${performers.length > 0 ? 'pt-6' : ''}`}>
        <h3 className="font-bold text-ink-900">
          <Link href={`/events/${event.slug}`} className="group-hover:text-brand-600">{event.eventName}</Link>
        </h3>
        <dl className="mt-2 space-y-0.5 text-sm text-ink-700">
          <div className="flex gap-2"><dt className="text-slate-500">일시</dt><dd>{formatDateTime(event.startDateTime)}</dd></div>
          {event.venue && <div className="flex gap-2"><dt className="text-slate-500">장소</dt><dd>{event.venue}{event.region ? ` · ${regionLabel(event.region)}` : ''}</dd></div>}
          {performers.length > 0 && <div className="flex gap-2"><dt className="text-slate-500">출연</dt><dd>{performers.join(', ')}</dd></div>}
        </dl>
      </div>
    </article>
  );
}

// 홈 등에서 쓰는 작은 가수 원형 링크 (얼굴 대신 아바타)
export function ArtistAvatarLink({ artist }: { artist: { slug: string; stageName: string } }) {
  return (
    <Link href={`/artists/${artist.slug}`} className="flex w-16 flex-col items-center gap-1 text-center">
      <Avatar name={artist.stageName} size="lg" className="!h-14 !w-14 text-xl transition hover:scale-105" />
      <span className="w-full truncate text-xs text-ink-700">{artist.stageName}</span>
    </Link>
  );
}

export { AvatarStack };
