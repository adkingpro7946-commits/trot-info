'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { WORKFLOW_STATUS, type WorkflowStatus } from '@/lib/enums';

async function requireSession() {
  const s = await getSession();
  if (!s) throw new Error('인증이 필요합니다.');
  return s;
}

// 기사 편집 저장 + 상태 변경 (§16·§18)
export async function updateArticle(formData: FormData): Promise<void> {
  const session = await requireSession();
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('id 누락');

  const before = await prisma.article.findUnique({ where: { id } });
  if (!before) throw new Error('기사를 찾을 수 없습니다.');

  const title = String(formData.get('title') ?? '').trim();
  const seoTitle = String(formData.get('seoTitle') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const body = String(formData.get('body') ?? '');
  const nextStatusRaw = String(formData.get('status') ?? before.status);
  const nextStatus = (WORKFLOW_STATUS as readonly string[]).includes(nextStatusRaw)
    ? (nextStatusRaw as WorkflowStatus)
    : (before.status as WorkflowStatus);

  if (!title || !description) throw new Error('제목과 설명은 필수입니다.');

  // 민감 콘텐츠(high) 발행 시 = 관리자 승인 행위. 로그로 남긴다 (§8·§16).
  const isPublishing = nextStatus === 'published' && before.status !== 'published';
  if (isPublishing && before.riskLevel === 'high') {
    await prisma.adminActivityLog.create({
      data: { userId: session.sub, action: 'publish_high_risk', target: `article:${id}` },
    });
  }

  // 변경 요약 계산 (§18)
  const changes: string[] = [];
  if (before.title !== title) changes.push('제목');
  if (before.description !== description) changes.push('설명');
  if (before.body !== body) changes.push('본문');
  if (before.status !== nextStatus) changes.push(`상태(${before.status}→${nextStatus})`);

  await prisma.article.update({
    where: { id },
    data: {
      title,
      seoTitle: seoTitle || null,
      description,
      body,
      status: nextStatus,
      reviewerId: nextStatus === 'published' || nextStatus === 'review' ? session.sub : before.reviewerId,
      publishedAt:
        isPublishing && !before.publishedAt ? new Date() : before.publishedAt,
    },
  });

  if (changes.length) {
    await prisma.revisionLog.create({
      data: {
        articleId: id,
        changedBy: session.name,
        summary: `${changes.join(', ')} 변경`,
        diff: JSON.stringify({
          title: before.title !== title ? { from: before.title, to: title } : undefined,
          status: before.status !== nextStatus ? { from: before.status, to: nextStatus } : undefined,
        }),
      },
    });
  }

  await prisma.adminActivityLog.create({
    data: { userId: session.sub, action: `article_update:${nextStatus}`, target: `article:${id}` },
  });

  revalidatePath(`/admin/articles/${id}`);
  revalidatePath('/admin/articles');
  if (nextStatus === 'published') revalidatePath(`/news/${before.slug}`);
}

// 정정 요청 상태 변경
export async function resolveCorrection(formData: FormData): Promise<void> {
  await requireSession();
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? 'reviewing');
  const note = String(formData.get('note') ?? '');
  await prisma.correctionRequest.update({
    where: { id },
    data: { status, handledNote: note || null, handledAt: new Date() },
  });
  revalidatePath('/admin/corrections');
}
