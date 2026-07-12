import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MusicForm } from '@/components/admin/forms';
import { SourcePanel } from '@/components/admin/SourcePanel';
import { upsertMusic } from '../../crud-actions';

export const dynamic = 'force-dynamic';

export default async function EditMusicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [music, artists] = await Promise.all([
    prisma.music.findUnique({ where: { id }, include: { artists: true, sources: true } }),
    prisma.artist.findMany({ orderBy: { stageName: 'asc' }, select: { id: true, stageName: true } }),
  ]);
  if (!music) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/admin/music" className="text-sm text-slate-500 hover:text-brand-600">← 음반 목록</Link>
        <Link href={`/music/${music.slug}`} target="_blank" className="text-sm text-brand-600 hover:underline">공개 페이지 ↗</Link>
      </div>
      <h1 className="mt-2 text-xl font-bold text-ink-900">음반 수정: {music.title}</h1>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <MusicForm action={upsertMusic} music={music} allArtists={artists.map((a) => ({ id: a.id, label: a.stageName }))} />
        <aside><SourcePanel ownerType="music" ownerId={music.id} sources={music.sources} /></aside>
      </div>
    </div>
  );
}
