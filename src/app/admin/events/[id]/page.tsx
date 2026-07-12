import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { EventForm } from '@/components/admin/forms';
import { SourcePanel } from '@/components/admin/SourcePanel';
import { upsertEvent } from '../../crud-actions';

export const dynamic = 'force-dynamic';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, artists] = await Promise.all([
    prisma.event.findUnique({ where: { id }, include: { artists: true, sources: true } }),
    prisma.artist.findMany({ orderBy: { stageName: 'asc' }, select: { id: true, stageName: true } }),
  ]);
  if (!event) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/admin/events" className="text-sm text-slate-500 hover:text-brand-600">← 공연 목록</Link>
        <Link href={`/events/${event.slug}`} target="_blank" className="text-sm text-brand-600 hover:underline">공개 페이지 ↗</Link>
      </div>
      <h1 className="mt-2 text-xl font-bold text-ink-900">공연 수정: {event.eventName}</h1>
      {['cancelled', 'postponed'].includes(event.eventStatus) && (
        <p className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-700">취소·연기 공연은 삭제하지 말고 상태만 변경하세요. 공개 페이지 상단에 안내가 표시됩니다.</p>
      )}
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <EventForm action={upsertEvent} event={event} allArtists={artists.map((a) => ({ id: a.id, label: a.stageName }))} />
        <aside><SourcePanel ownerType="event" ownerId={event.id} sources={event.sources} /></aside>
      </div>
    </div>
  );
}
