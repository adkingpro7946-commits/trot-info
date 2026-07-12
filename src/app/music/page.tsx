import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma, safe } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SampleBadge } from '@/components/badges';
import { formatDate } from '@/lib/format';

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: '트로트 신곡·앨범 정보',
  description: '트로트 가수들의 신곡과 앨범 발매 정보를 정리했습니다.',
  path: '/music',
});

export default async function MusicIndexPage() {
  const music = await safe(prisma.music.findMany({
    where: { status: 'published' },
    include: { artists: { select: { stageName: true } } },
    orderBy: { releaseDate: 'desc' },
  }), []);
  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '신곡·앨범', path: '/music' }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">신곡·앨범</h1>
      {music.length ? (
        <ul className="mt-6 space-y-3">
          {music.map((m) => (
            <li key={m.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <Link href={`/music/${m.slug}`} className="font-semibold text-ink-900 hover:text-brand-600">{m.title}</Link>
                {m.isSample && <SampleBadge />}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {m.artists.map((a) => a.stageName).join(', ')}{m.releaseDate ? ` · ${formatDate(m.releaseDate)} 발매` : ''}
              </p>
            </li>
          ))}
        </ul>
      ) : <p className="mt-6 text-sm text-slate-500">등록된 음반이 없습니다.</p>}
    </div>
  );
}
