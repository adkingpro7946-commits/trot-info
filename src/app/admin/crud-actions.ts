'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ensureSlug } from '@/lib/slug';
import { stringifyArray } from '@/lib/json';

async function requireSession() {
  const s = await getSession();
  if (!s) throw new Error('인증이 필요합니다.');
  return s;
}

// ---- FormData 파싱 헬퍼 ----
const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const optStr = (fd: FormData, k: string) => {
  const v = str(fd, k);
  return v ? v : null;
};
const boolFd = (fd: FormData, k: string) => fd.get(k) === 'on' || fd.get(k) === 'true';
const optDate = (fd: FormData, k: string): Date | null => {
  const v = str(fd, k);
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};
const multi = (fd: FormData, k: string) => fd.getAll(k).map((v) => String(v)).filter(Boolean);
const linesToArray = (text: string): string[] =>
  text.split('\n').map((l) => l.trim()).filter(Boolean);
// "라벨|url" 형식의 여러 줄 → [{label,url}]
const socialLines = (text: string) =>
  linesToArray(text)
    .map((l) => {
      const [label, url] = l.split('|').map((x) => x.trim());
      return url ? { label: label || url, url } : null;
    })
    .filter((x): x is { label: string; url: string } => !!x && /^https?:\/\//.test(x.url));

async function logActivity(userId: string, action: string, target: string) {
  await prisma.adminActivityLog.create({ data: { userId, action, target } });
}

// ============================ 가수 ============================
export async function upsertArtist(fd: FormData): Promise<void> {
  const s = await requireSession();
  const id = str(fd, 'id');
  const stageName = str(fd, 'stageName');
  if (!stageName) throw new Error('활동명은 필수입니다.');
  const profileSummary = str(fd, 'profileSummary');

  const data = {
    stageName,
    slug: ensureSlug(str(fd, 'slug'), stageName),
    realName: optStr(fd, 'realName'),
    profileSummary: profileSummary || `${stageName} 프로필입니다.`,
    birthPlace: optStr(fd, 'birthPlace'),
    birthDate: optDate(fd, 'birthDate'),
    debutDate: optDate(fd, 'debutDate'),
    agency: optStr(fd, 'agency'),
    fanClubName: optStr(fd, 'fanClubName'),
    officialWebsite: optStr(fd, 'officialWebsite'),
    officialSocialLinks: stringifyArray(socialLines(str(fd, 'officialSocialLinks'))),
    status: str(fd, 'status') || 'draft',
    isSample: boolFd(fd, 'isSample'),
    lastFactCheckedAt: optDate(fd, 'lastFactCheckedAt'),
  };

  let savedId = id;
  if (id) {
    await prisma.artist.update({ where: { id }, data });
    await logActivity(s.sub, 'artist_update', `artist:${id}`);
  } else {
    const created = await prisma.artist.create({ data });
    savedId = created.id;
    await logActivity(s.sub, 'artist_create', `artist:${created.id}`);
  }
  revalidatePath('/admin/artists');
  revalidatePath('/artists');
  redirect(`/admin/artists/${savedId}`);
}

export async function archiveArtist(fd: FormData): Promise<void> {
  const s = await requireSession();
  const id = str(fd, 'id');
  await prisma.artist.update({ where: { id }, data: { status: 'archived' } });
  await logActivity(s.sub, 'artist_archive', `artist:${id}`);
  revalidatePath('/admin/artists');
  redirect('/admin/artists');
}

// ============================ 공연 ============================
export async function upsertEvent(fd: FormData): Promise<void> {
  const s = await requireSession();
  const id = str(fd, 'id');
  const eventName = str(fd, 'eventName');
  const start = optDate(fd, 'startDateTime');
  if (!eventName) throw new Error('공연명은 필수입니다.');
  if (!start) throw new Error('시작 일시는 필수입니다.');

  const artistIds = multi(fd, 'artistIds');
  const base = {
    eventName,
    slug: ensureSlug(str(fd, 'slug'), eventName),
    eventType: str(fd, 'eventType') || 'concert',
    startDateTime: start,
    endDateTime: optDate(fd, 'endDateTime'),
    venue: optStr(fd, 'venue'),
    address: optStr(fd, 'address'),
    region: optStr(fd, 'region'),
    ticketVendor: optStr(fd, 'ticketVendor'),
    ticketUrl: optStr(fd, 'ticketUrl'),
    ticketOpenDate: optDate(fd, 'ticketOpenDate'),
    priceInformation: optStr(fd, 'priceInformation'),
    ageRestriction: optStr(fd, 'ageRestriction'),
    organizer: optStr(fd, 'organizer'),
    officialSourceUrl: optStr(fd, 'officialSourceUrl'),
    transportInfo: optStr(fd, 'transportInfo'),
    eventStatus: str(fd, 'eventStatus') || 'scheduled',
    cancelledAt: str(fd, 'eventStatus') === 'cancelled' ? new Date() : null,
    status: str(fd, 'status') || 'draft',
    isSample: boolFd(fd, 'isSample'),
    sourceCheckedAt: optDate(fd, 'sourceCheckedAt'),
  };

  let savedId = id;
  if (id) {
    // update: set 으로 관계 전체 교체
    await prisma.event.update({ where: { id }, data: { ...base, artists: { set: artistIds.map((aid) => ({ id: aid })) } } });
    await logActivity(s.sub, 'event_update', `event:${id}`);
  } else {
    // create: connect 로 관계 연결
    const created = await prisma.event.create({ data: { ...base, artists: { connect: artistIds.map((aid) => ({ id: aid })) } } });
    savedId = created.id;
    await logActivity(s.sub, 'event_create', `event:${created.id}`);
  }
  revalidatePath('/admin/events');
  revalidatePath('/events');
  redirect(`/admin/events/${savedId}`);
}

// ============================ 음반/곡 ============================
export async function upsertMusic(fd: FormData): Promise<void> {
  const s = await requireSession();
  const id = str(fd, 'id');
  const title = str(fd, 'title');
  if (!title) throw new Error('제목은 필수입니다.');
  const artistIds = multi(fd, 'artistIds');

  const base = {
    title,
    slug: ensureSlug(str(fd, 'slug'), title),
    type: str(fd, 'type') || 'single',
    releaseDate: optDate(fd, 'releaseDate'),
    label: optStr(fd, 'label'),
    description: optStr(fd, 'description'),
    trackList: stringifyArray(linesToArray(str(fd, 'trackList'))),
    status: str(fd, 'status') || 'draft',
    isSample: boolFd(fd, 'isSample'),
  };

  let savedId = id;
  if (id) {
    await prisma.music.update({ where: { id }, data: { ...base, artists: { set: artistIds.map((aid) => ({ id: aid })) } } });
    await logActivity(s.sub, 'music_update', `music:${id}`);
  } else {
    const created = await prisma.music.create({ data: { ...base, artists: { connect: artistIds.map((aid) => ({ id: aid })) } } });
    savedId = created.id;
    await logActivity(s.sub, 'music_create', `music:${created.id}`);
  }
  revalidatePath('/admin/music');
  revalidatePath('/music');
  redirect(`/admin/music/${savedId}`);
}

// ============================ 기사 (신규 생성) ============================
export async function createArticle(fd: FormData): Promise<void> {
  const s = await requireSession();
  const title = str(fd, 'title');
  if (!title) throw new Error('제목은 필수입니다.');

  const created = await prisma.article.create({
    data: {
      type: str(fd, 'type') || 'news',
      slug: ensureSlug(str(fd, 'slug'), title),
      title,
      description: str(fd, 'description') || title,
      body: str(fd, 'body'),
      primaryKeyword: optStr(fd, 'primaryKeyword'),
      status: 'draft',
      isSample: boolFd(fd, 'isSample'),
      authorId: s.sub,
      artists: { connect: multi(fd, 'artistIds').map((id) => ({ id })) },
      events: { connect: multi(fd, 'eventIds').map((id) => ({ id })) },
      music: { connect: multi(fd, 'musicIds').map((id) => ({ id })) },
    },
  });
  await logActivity(s.sub, 'article_create', `article:${created.id}`);
  revalidatePath('/admin/articles');
  redirect(`/admin/articles/${created.id}`);
}

// 기사 연결(가수/공연/음반) 갱신 — 편집기에서 사용
export async function updateArticleRelations(fd: FormData): Promise<void> {
  const s = await requireSession();
  const id = str(fd, 'id');
  await prisma.article.update({
    where: { id },
    data: {
      artists: { set: multi(fd, 'artistIds').map((x) => ({ id: x })) },
      events: { set: multi(fd, 'eventIds').map((x) => ({ id: x })) },
      music: { set: multi(fd, 'musicIds').map((x) => ({ id: x })) },
    },
  });
  await logActivity(s.sub, 'article_relations', `article:${id}`);
  revalidatePath(`/admin/articles/${id}`);
}

// ============================ 출처 (공용) ============================
export async function addSource(fd: FormData): Promise<void> {
  await requireSession();
  const owner = str(fd, 'ownerType'); // article | artist | event | music
  const ownerId = str(fd, 'ownerId');
  const sourceUrl = str(fd, 'sourceUrl');
  const sourceTitle = str(fd, 'sourceTitle');
  if (!sourceUrl || !sourceTitle) throw new Error('출처 제목과 URL은 필수입니다.');
  if (!/^https?:\/\//.test(sourceUrl)) throw new Error('출처 URL은 http(s)여야 합니다.');

  const link: Record<string, string> = {};
  if (owner === 'article') link.articleId = ownerId;
  else if (owner === 'artist') link.artistId = ownerId;
  else if (owner === 'event') link.eventId = ownerId;
  else if (owner === 'music') link.musicId = ownerId;
  else throw new Error('알 수 없는 대상');

  await prisma.source.create({
    data: {
      sourceTitle,
      sourcePublisher: optStr(fd, 'sourcePublisher'),
      sourceUrl,
      sourceGrade: str(fd, 'sourceGrade') || 'B',
      factType: optStr(fd, 'factType'),
      quotedText: optStr(fd, 'quotedText'),
      verificationStatus: str(fd, 'verificationStatus') || 'unverified',
      ...link,
    },
  });
  revalidatePath(`/admin/${owner}s/${ownerId}`);
}

export async function deleteSource(fd: FormData): Promise<void> {
  await requireSession();
  const sid = str(fd, 'sourceId');
  const owner = str(fd, 'ownerType');
  const ownerId = str(fd, 'ownerId');
  await prisma.source.delete({ where: { id: sid } });
  revalidatePath(`/admin/${owner}s/${ownerId}`);
}
