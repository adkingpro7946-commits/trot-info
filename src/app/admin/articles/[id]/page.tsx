import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { updateArticle } from '../../actions';
import { updateArticleRelations } from '../../crud-actions';
import { WORKFLOW_STATUS, WORKFLOW_STATUS_LABEL } from '@/lib/enums';
import { scoreQuality, assessRisk } from '@/lib/quality-score';
import { articleLd } from '@/lib/structured-data';
import { SourcePanel } from '@/components/admin/SourcePanel';
import { RelationChecks } from '@/components/admin/forms';
import { formatDateTime } from '@/lib/format';
import { SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function ArticleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      artists: true,
      events: true,
      music: true,
      sources: true,
      revisions: { orderBy: { changedAt: 'desc' }, take: 10 },
    },
  });
  if (!article) notFound();

  const [allArtists, allEvents, allMusic] = await Promise.all([
    prisma.artist.findMany({ orderBy: { stageName: 'asc' }, select: { id: true, stageName: true } }),
    prisma.event.findMany({ orderBy: { startDateTime: 'desc' }, take: 40, select: { id: true, eventName: true } }),
    prisma.music.findMany({ orderBy: { updatedAt: 'desc' }, take: 40, select: { id: true, title: true } }),
  ]);

  const artistNames = article.artists.map((a) => a.stageName);
  const qInput = {
    title: article.title,
    body: article.body,
    description: article.description,
    primaryKeyword: article.primaryKeyword,
    sources: article.sources,
    artistNames,
    hasInternalLinks: article.body.includes('](/') || artistNames.length > 0,
    hasValidHero: !!article.heroImage,
    structuredDataOk: true,
    duplicateSimilarity: 0,
  };
  const quality = scoreQuality(qInput);
  const risk = assessRisk(qInput);
  const ld = articleLd({
    type: article.type, title: article.title, description: article.description, slug: article.slug,
    publishedAt: article.publishedAt, updatedAt: article.updatedAt, image: article.heroImage,
  });

  const seoTitle = article.seoTitle || article.title;

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/admin/articles" className="text-sm text-slate-500 hover:text-brand-600">← 기사 목록</Link>
        <Link href={`/news/${article.slug}`} target="_blank" className="text-sm text-brand-600 hover:underline">공개 페이지 미리보기 ↗</Link>
      </div>

      {/* 민감 콘텐츠 경고 (§8·§16) */}
      {risk.riskLevel === 'high' && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <strong>민감 콘텐츠</strong> — {risk.reasons.join(' · ') || '민감 키워드 감지'}. 자동 발행 대상이 아니며, 발행 시 관리자 승인으로 기록됩니다.
        </div>
      )}

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* 편집 폼 */}
        <form action={updateArticle} className="space-y-4">
          <input type="hidden" name="id" value={article.id} />
          <div>
            <label className="block text-sm font-medium text-ink-800">제목</label>
            <input name="title" defaultValue={article.title} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-800">SEO 제목 (선택)</label>
            <input name="seoTitle" defaultValue={article.seoTitle ?? ''} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-800">설명 / 요약 (meta description)</label>
            <textarea name="description" defaultValue={article.description} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-800">본문 (Markdown)</label>
            <textarea name="body" defaultValue={article.body} rows={16} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs" />
          </div>
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-sm font-medium text-ink-800">상태</label>
              <select name="status" defaultValue={article.status} className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {WORKFLOW_STATUS.map((s) => (
                  <option key={s} value={s}>{WORKFLOW_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">저장</button>
          </div>
          <p className="text-xs text-slate-400">
            발행 전 위험 검사·품질 점수·구조화 데이터를 우측 패널에서 확인하세요. 민감 주제는 검수 후에만 발행하세요.
          </p>
        </form>

        {/* 우측: 검사 패널 */}
        <aside className="space-y-5">
          {/* SEO 미리보기 (§16) */}
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase text-slate-400">SEO 미리보기</p>
            <p className="mt-2 truncate text-brand-700">{seoTitle} · {SITE_NAME}</p>
            <p className="text-xs text-emerald-700">/news/{article.slug}</p>
            <p className="mt-1 line-clamp-2 text-xs text-slate-600">{article.description}</p>
          </div>

          {/* 품질 점수 (§20) */}
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase text-slate-400">품질 점수 (미리보기)</p>
            <p className="mt-1 text-2xl font-extrabold text-ink-900">{quality.score}<span className="text-sm text-slate-400"> / 100</span></p>
            <p className="text-xs text-slate-500">자동 발행 기준 85점 {quality.score >= 85 ? '충족' : '미달'}</p>
            <ul className="mt-2 space-y-0.5 text-xs text-ink-700">
              {Object.entries(quality.breakdown).map(([k, v]) => (
                <li key={k} className="flex justify-between"><span>{k}</span><span className="text-slate-500">{v.got}/{v.max}</span></li>
              ))}
            </ul>
          </div>

          {/* 위험도 */}
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase text-slate-400">위험 검사</p>
            <p className={`mt-1 text-sm font-semibold ${risk.riskLevel === 'high' ? 'text-red-600' : risk.riskLevel === 'medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
              {risk.riskLevel.toUpperCase()}
            </p>
            <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
              {risk.reasons.length ? risk.reasons.map((r, i) => <li key={i}>• {r}</li>) : <li>특이사항 없음</li>}
            </ul>
          </div>

          {/* 구조화 데이터 미리보기 (§16) */}
          <details className="rounded-lg border border-slate-200 p-3">
            <summary className="cursor-pointer text-xs font-semibold uppercase text-slate-400">구조화 데이터 (JSON-LD)</summary>
            <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-[10px] text-slate-700">{JSON.stringify(ld, null, 2)}</pre>
          </details>

          {/* 출처 관리 (추가/삭제) */}
          <SourcePanel ownerType="article" ownerId={article.id} sources={article.sources} />
        </aside>
      </div>

      {/* 관련 콘텐츠 연결 (§14·§16) */}
      <form action={updateArticleRelations} className="mt-8 space-y-3">
        <input type="hidden" name="id" value={article.id} />
        <h2 className="text-sm font-bold text-ink-900">관련 콘텐츠 연결</h2>
        <RelationChecks label="관련 가수" name="artistIds" all={allArtists.map((a) => ({ id: a.id, label: a.stageName }))} selectedIds={article.artists.map((a) => a.id)} />
        <RelationChecks label="관련 공연" name="eventIds" all={allEvents.map((e) => ({ id: e.id, label: e.eventName }))} selectedIds={article.events.map((e) => e.id)} />
        <RelationChecks label="관련 음반" name="musicIds" all={allMusic.map((m) => ({ id: m.id, label: m.title }))} selectedIds={article.music.map((m) => m.id)} />
        <button type="submit" className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-ink-700 hover:bg-slate-50">연결 저장</button>
      </form>

      {/* 수정 이력 (§18) */}
      {article.revisions.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-ink-900">수정 이력</h2>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {article.revisions.map((r) => (
              <li key={r.id}>{formatDateTime(r.changedAt)} · {r.changedBy ?? '시스템'} · {r.summary}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
