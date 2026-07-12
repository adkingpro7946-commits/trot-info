// enum 성격 필드의 허용값 + 표시 라벨 (SQLite enum 미지원 대체)

export const ARTICLE_TYPES = [
  'news', 'release', 'broadcast', 'award', 'announcement', 'roundup', 'guide', 'timeline',
] as const;
export type ArticleType = (typeof ARTICLE_TYPES)[number];

export const ARTICLE_TYPE_LABEL: Record<string, string> = {
  news: '최신 소식',
  release: '신곡·앨범',
  broadcast: '방송 출연',
  award: '수상·기록',
  announcement: '공식 발표',
  roundup: '주간 정리',
  guide: '가이드',
  timeline: '활동 연대기',
};

// 게시 워크플로 상태 (§16)
export const WORKFLOW_STATUS = [
  'draft', 'researching', 'verification_needed', 'review',
  'scheduled', 'published', 'rejected', 'archived',
] as const;
export type WorkflowStatus = (typeof WORKFLOW_STATUS)[number];

export const WORKFLOW_STATUS_LABEL: Record<string, string> = {
  draft: '초안',
  researching: '자료 수집',
  verification_needed: '검증 필요',
  review: '검수 대기',
  scheduled: '예약 발행',
  published: '발행됨',
  rejected: '반려',
  archived: '보관',
};

// 공연 상태 (§5)
export const EVENT_STATUS = [
  'scheduled', 'ticket_open', 'sold_out', 'cancelled',
  'postponed', 'completed', 'verification_needed',
] as const;
export type EventStatus = (typeof EVENT_STATUS)[number];

export const EVENT_STATUS_LABEL: Record<string, string> = {
  scheduled: '예정',
  ticket_open: '예매 중',
  sold_out: '매진',
  cancelled: '취소',
  postponed: '연기',
  completed: '종료',
  verification_needed: '확인 필요',
};

export const SOURCE_GRADES = ['A', 'B', 'C'] as const;
export type SourceGrade = (typeof SOURCE_GRADES)[number];

export const RISK_LEVELS = ['low', 'medium', 'high'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

// 지역 (§3 region-slug)
export const REGIONS: { slug: string; label: string }[] = [
  { slug: 'seoul', label: '서울' },
  { slug: 'busan', label: '부산' },
  { slug: 'daegu', label: '대구' },
  { slug: 'incheon', label: '인천' },
  { slug: 'gwangju', label: '광주' },
  { slug: 'daejeon', label: '대전' },
  { slug: 'gyeonggi', label: '경기' },
  { slug: 'gangwon', label: '강원' },
  { slug: 'other', label: '기타' },
];
export const regionLabel = (slug?: string | null) =>
  REGIONS.find((r) => r.slug === slug)?.label ?? slug ?? '';
