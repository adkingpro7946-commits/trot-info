import Link from 'next/link';
import { ArtistForm } from '@/components/admin/forms';
import { upsertArtist } from '../../crud-actions';

export const dynamic = 'force-dynamic';

export default function NewArtistPage() {
  return (
    <div>
      <Link href="/admin/artists" className="text-sm text-slate-500 hover:text-brand-600">← 가수 목록</Link>
      <h1 className="mt-2 text-xl font-bold text-ink-900">새 가수 등록</h1>
      <p className="mt-1 text-xs text-slate-400">확인되지 않은 정보(나이·가족 등)는 비워두세요. 추정 입력 금지.</p>
      <div className="mt-4"><ArtistForm action={upsertArtist} /></div>
    </div>
  );
}
