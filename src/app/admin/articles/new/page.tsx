import Link from 'next/link';
import { prisma } from '@/lib/db';
import { ArticleCreateForm } from '@/components/admin/forms';
import { createArticle } from '../../crud-actions';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const [artists, events, music] = await Promise.all([
    prisma.artist.findMany({ orderBy: { stageName: 'asc' }, select: { id: true, stageName: true } }),
    prisma.event.findMany({ orderBy: { startDateTime: 'desc' }, take: 30, select: { id: true, eventName: true } }),
    prisma.music.findMany({ orderBy: { updatedAt: 'desc' }, take: 30, select: { id: true, title: true } }),
  ]);
  return (
    <div>
      <Link href="/admin/articles" className="text-sm text-slate-500 hover:text-brand-600">← 기사 목록</Link>
      <h1 className="mt-2 text-xl font-bold text-ink-900">새 기사 작성</h1>
      <div className="mt-4">
        <ArticleCreateForm
          action={createArticle}
          allArtists={artists.map((a) => ({ id: a.id, label: a.stageName }))}
          allEvents={events.map((e) => ({ id: e.id, label: e.eventName }))}
          allMusic={music.map((m) => ({ id: m.id, label: m.title }))}
        />
      </div>
    </div>
  );
}
