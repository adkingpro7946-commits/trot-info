// 구조화 데이터 (JSON-LD) 생성 (§12) — 화면 표시 내용과 정확히 일치해야 함
import { SITE_NAME, SITE_URL, abs } from './seo';
import { toISO } from './format';

type Json = Record<string, unknown>;

export function organizationLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function websiteLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={query}` },
      'query-input': 'required name=query',
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

// ProfilePage + Person (가수). 확인된 값만 포함(§4·§12).
export function artistProfileLd(a: {
  slug: string; stageName: string; realName?: string | null;
  profileSummary: string; birthDate?: Date | null; birthPlace?: string | null;
  officialWebsite?: string | null; socialUrls: string[];
}): Json {
  const person: Json = {
    '@type': 'Person',
    name: a.stageName,
    description: a.profileSummary,
    url: abs(`/artists/${a.slug}`),
  };
  if (a.realName) person.alternateName = a.realName;
  if (a.birthDate) person.birthDate = toISO(a.birthDate)?.slice(0, 10);
  if (a.birthPlace) person.birthPlace = a.birthPlace;
  const sameAs = [a.officialWebsite, ...a.socialUrls].filter(Boolean);
  if (sameAs.length) person.sameAs = sameAs;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: person,
  };
}

export function articleLd(a: {
  type: string; title: string; description: string; slug: string;
  publishedAt?: Date | null; updatedAt?: Date | null;
  authorName?: string | null; image?: string | null;
}): Json {
  const schemaType =
    a.type === 'guide' || a.type === 'roundup' ? 'BlogPosting' :
    ['news', 'release', 'broadcast', 'announcement'].includes(a.type) ? 'NewsArticle' : 'Article';
  const ld: Json = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: a.title,
    description: a.description,
    url: abs(`/news/${a.slug}`),
    mainEntityOfPage: abs(`/news/${a.slug}`),
    publisher: { '@type': 'Organization', name: SITE_NAME },
  };
  if (a.publishedAt) ld.datePublished = toISO(a.publishedAt);
  if (a.updatedAt) ld.dateModified = toISO(a.updatedAt);
  if (a.authorName) ld.author = { '@type': 'Person', name: a.authorName };
  if (a.image) ld.image = [abs(a.image)];
  return ld;
}

export function eventLd(e: {
  slug: string; eventName: string; startDateTime: Date; endDateTime?: Date | null;
  venue?: string | null; address?: string | null; eventStatus: string;
  ticketUrl?: string | null; performers: string[];
}): Json {
  const statusMap: Record<string, string> = {
    cancelled: 'https://schema.org/EventCancelled',
    postponed: 'https://schema.org/EventPostponed',
    scheduled: 'https://schema.org/EventScheduled',
    ticket_open: 'https://schema.org/EventScheduled',
    sold_out: 'https://schema.org/EventScheduled',
    completed: 'https://schema.org/EventScheduled',
  };
  const ld: Json = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.eventName,
    startDate: toISO(e.startDateTime),
    eventStatus: statusMap[e.eventStatus] ?? 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: abs(`/events/${e.slug}`),
  };
  if (e.endDateTime) ld.endDate = toISO(e.endDateTime);
  if (e.venue) {
    ld.location = {
      '@type': 'Place',
      name: e.venue,
      ...(e.address ? { address: e.address } : {}),
    };
  }
  if (e.performers.length) {
    ld.performer = e.performers.map((p) => ({ '@type': 'PerformingGroup', name: p }));
  }
  if (e.ticketUrl) {
    ld.offers = { '@type': 'Offer', url: e.ticketUrl, availability: 'https://schema.org/InStock' };
  }
  return ld;
}

export function musicLd(m: {
  slug: string; title: string; type: string; releaseDate?: Date | null;
  artistNames: string[]; tracks: string[];
}): Json {
  const ld: Json = {
    '@context': 'https://schema.org',
    '@type': m.type === 'album' ? 'MusicAlbum' : 'MusicRecording',
    name: m.title,
    url: abs(`/music/${m.slug}`),
  };
  if (m.releaseDate) ld.datePublished = toISO(m.releaseDate)?.slice(0, 10);
  if (m.artistNames.length) {
    ld.byArtist = m.artistNames.map((n) => ({ '@type': 'MusicGroup', name: n }));
  }
  if (m.type === 'album' && m.tracks.length) {
    ld.numTracks = m.tracks.length;
  }
  return ld;
}
