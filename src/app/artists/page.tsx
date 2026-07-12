import type { Metadata } from 'next';
import { prisma, safe } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ArtistCard } from '@/components/cards';
import { SearchBox } from '@/components/SearchBox';

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: '트로트 가수 목록 · 프로필·공연·방송·신곡 정리',
  description: '트로트 가수들의 프로필과 대표곡, 방송·공연 일정을 한곳에서 확인하세요. 공식 출처 기반 정리.',
  path: '/artists',
});

export default async function ArtistsPage() {
  const artists = await safe(prisma.artist.findMany({
    where: { status: 'published' },
    orderBy: { stageName: 'asc' },
  }), []);

  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '가수', path: '/artists' }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">트로트 가수</h1>
      <p className="mt-1 text-sm text-ink-700">
        프로필·대표곡·방송·공연 일정을 공식 출처 기반으로 정리합니다.
      </p>
      <div className="mt-4 max-w-content">
        <SearchBox placeholder="가수 이름으로 찾기" />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
      </div>
      {artists.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">등록된 가수가 없습니다.</p>
      )}
    </div>
  );
}
