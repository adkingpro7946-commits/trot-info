import Link from 'next/link';
import { prisma } from '@/lib/db';
import { EventForm } from '@/components/admin/forms';
import { upsertEvent } from '../../crud-actions';

export const dynamic = 'force-dynamic';

export default async function NewEventPage() {
  const artists = await prisma.artist.findMany({ orderBy: { stageName: 'asc' }, select: { id: true, stageName: true } });
  return (
    <div>
      <Link href="/admin/events" className="text-sm text-slate-500 hover:text-brand-600">← 공연 목록</Link>
      <h1 className="mt-2 text-xl font-bold text-ink-900">새 공연 등록</h1>
      <p className="mt-1 text-xs text-slate-400">공식 공연 페이지·주최사·티켓처에서 확인한 정보만 입력하세요.</p>
      <div className="mt-4">
        <EventForm action={upsertEvent} allArtists={artists.map((a) => ({ id: a.id, label: a.stageName }))} />
      </div>
    </div>
  );
}
