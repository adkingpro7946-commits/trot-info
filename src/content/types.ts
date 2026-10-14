// 정적 편집 콘텐츠 타입 — DB를 거치지 않고 빌드 시 정적 생성(SSG)된다. (Neon 컴퓨트 0)

export type GuideCategory = '입문' | '역사' | '음악 이해' | '명곡 가이드' | '방송·경연' | '공연·관람' | '문화';

export interface Reference {
  title: string;
  publisher: string;
  url?: string;
}

export interface Guide {
  slug: string; // 영문 소문자-하이픈
  title: string;
  description: string; // 120~160자 요약 (메타 설명)
  category: GuideCategory;
  publishedAt: string; // 'YYYY-MM-DD'
  updatedAt?: string; // 'YYYY-MM-DD'
  relatedArtists?: string[]; // 가수 slug
  relatedGuides?: string[]; // 가이드 slug
  /**
   * 본문 (제한 마크다운: ## h2, ### h3, > 인용, - 목록, 빈 줄 문단, [텍스트](/경로 또는 https://), **굵게**)
   * 표·번호 목록 문법은 지원하지 않는다.
   */
  body: string;
  references?: Reference[];
}

export interface ArtistNote {
  /** 편집부 해설 본문 (제한 마크다운, 위와 동일) */
  body: string;
  updatedAt: string; // 'YYYY-MM-DD'
  references?: Reference[];
}
