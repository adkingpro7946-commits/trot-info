import Link from 'next/link';
import { SampleBadge, EventStatusBadge } from './badges';
import { ARTICLE_TYPE_LABEL } from '@/lib/enums';
import { regionLabel } from '@/lib/enums';
import { formatDate, formatDateTime } from '@/lib/format';

export function ArtistCard({
  artist,
}: {
  artist: { slug: string; stageName: string; profileSummary: string; agency?: string | null; isSample: boolean };
}) {
  return (
    <Link
      href={`/artists/${artist.slug}`}
      className="block rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:shadow-sm"
    >
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-ink-900">{artist.stageName}</h3>
        {artist.isSample && <SampleBadge />}
      </div>
      {artist.agency && <p className="mt-0.5 text-xs text-slate-500">{artist.agency}</p>}
      <p className="mt-2 line-clamp-2 text-sm text-ink-700">{artist.profileSummary}</p>
    </Link>
  );
}

export function ArticleCard({
  article,
}: {
  article: {
    slug: string; title: string; description: string; type: string;
    publishedAt?: Date | string | null; isSample: boolean;
  };
}) {
  return (
    <article className="rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:shadow-sm">
      <div className="mb-1 flex items-center gap-2 text-xs text-brand-600">
        <span className="font-semibold">{ARTICLE_TYPE_LABEL[article.type] ?? article.type}</span>
        {article.isSample && <SampleBadge />}
      </div>
      <h3 className="font-bold text-ink-900">
        <Link href={`/news/${article.slug}`} className="hover:text-brand-600">
          {article.title}
        </Link>
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-ink-700">{article.description}</p>
      {article.publishedAt && (
        <p className="mt-2 text-xs text-slate-500">{formatDate(article.publishedAt)}</p>
      )}
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
  return (
    <article className="rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <EventStatusBadge status={event.eventStatus} />
        {event.isSample && <SampleBadge />}
      </div>
      <h3 className="font-bold text-ink-900">
        <Link href={`/events/${event.slug}`} className="hover:text-brand-600">
          {event.eventName}
        </Link>
      </h3>
      <dl className="mt-2 space-y-0.5 text-sm text-ink-700">
        <div className="flex gap-2"><dt className="text-slate-500">일시</dt><dd>{formatDateTime(event.startDateTime)}</dd></div>
        {event.venue && <div className="flex gap-2"><dt className="text-slate-500">장소</dt><dd>{event.venue}{event.region ? ` · ${regionLabel(event.region)}` : ''}</dd></div>}
        {event.artists && event.artists.length > 0 && (
          <div className="flex gap-2"><dt className="text-slate-500">출연</dt><dd>{event.artists.map((a) => a.stageName).join(', ')}</dd></div>
        )}
      </dl>
    </article>
  );
}
