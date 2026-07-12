import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ArtistForm } from '@/components/admin/forms';
import { SourcePanel } from '@/components/admin/SourcePanel';
import { upsertArtist, archiveArtist } from '../../crud-actions';

export const dynamic = 'force-dynamic';

export default async function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = await prisma.artist.findUnique({ where: { id }, include: { sources: true } });
  if (!artist) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/admin/artists" className="text-sm text-slate-500 hover:text-brand-600">← 가수 목록</Link>
        <Link href={`/artists/${artist.slug}`} target="_blank" className="text-sm text-brand-600 hover:underline">공개 페이지 ↗</Link>
      </div>
      <h1 className="mt-2 text-xl font-bold text-ink-900">가수 수정: {artist.stageName}</h1>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <ArtistForm action={upsertArtist} artist={artist} />
        <aside className="space-y-4">
          <SourcePanel ownerType="artist" ownerId={artist.id} sources={artist.sources} />
          <form action={archiveArtist}>
            <input type="hidden" name="id" value={artist.id} />
            <button className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">보관(archived) 처리</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
