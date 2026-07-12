import Link from 'next/link';
import { prisma } from '@/lib/db';
import { MusicForm } from '@/components/admin/forms';
import { upsertMusic } from '../../crud-actions';

export const dynamic = 'force-dynamic';

export default async function NewMusicPage() {
  const artists = await prisma.artist.findMany({ orderBy: { stageName: 'asc' }, select: { id: true, stageName: true } });
  return (
    <div>
      <Link href="/admin/music" className="text-sm text-slate-500 hover:text-brand-600">← 음반 목록</Link>
      <h1 className="mt-2 text-xl font-bold text-ink-900">새 음반·곡 등록</h1>
      <div className="mt-4">
        <MusicForm action={upsertMusic} allArtists={artists.map((a) => ({ id: a.id, label: a.stageName }))} />
      </div>
    </div>
  );
}
