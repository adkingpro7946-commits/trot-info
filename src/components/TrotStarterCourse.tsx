'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type QuestionKey = 'mood' | 'activity' | 'era' | 'level';
type Answers = Record<QuestionKey, string>;
type CourseKind = '해설' | '가수' | '실전';

interface CourseItem {
  href: string;
  title: string;
  kind: CourseKind;
  description: string;
  tags: string[];
  priority: number;
}

const QUESTIONS: Array<{
  key: QuestionKey;
  title: string;
  description: string;
  options: Array<{ value: string; label: string }>;
}> = [
  {
    key: 'mood',
    title: '어떤 매력부터 느끼고 싶나요?',
    description: '노래를 고를 때 가장 먼저 끌리는 지점을 골라 주세요.',
    options: [
      { value: 'emotion', label: '가사와 감정선' },
      { value: 'energy', label: '흥과 리듬' },
      { value: 'story', label: '시대와 이야기' },
      { value: 'stage', label: '경연과 무대' },
    ],
  },
  {
    key: 'activity',
    title: '트로트를 어떻게 즐길 계획인가요?',
    description: '지금 가장 해 보고 싶은 활동을 선택해 주세요.',
    options: [
      { value: 'listen', label: '차분히 들어 보기' },
      { value: 'sing', label: '직접 따라 부르기' },
      { value: 'concert', label: '공연 보러 가기' },
      { value: 'family', label: '부모님과 함께 즐기기' },
    ],
  },
  {
    key: 'era',
    title: '어느 시대가 궁금한가요?',
    description: '정답은 없습니다. 잘 모르겠다면 골고루를 선택하세요.',
    options: [
      { value: 'classic', label: '1930~80년대 명곡' },
      { value: 'middle', label: '1990~2010년대' },
      { value: 'current', label: '경연 프로그램 시대' },
      { value: 'all', label: '시대별로 골고루' },
    ],
  },
  {
    key: 'level',
    title: '트로트가 얼마나 익숙한가요?',
    description: '설명의 깊이와 시작 지점을 정하는 데 반영합니다.',
    options: [
      { value: 'new', label: '거의 처음' },
      { value: 'casual', label: '아는 노래가 조금 있음' },
      { value: 'fan', label: '자주 듣고 무대도 봄' },
    ],
  },
];

const ITEMS: CourseItem[] = [
  {
    href: '/guides/songs-1930s-1960s',
    title: '1930~60년대 명곡 — 트로트의 뿌리 듣기',
    kind: '해설',
    description: '노래가 시대의 기억을 어떻게 담았는지 대표곡과 감상 포인트로 살펴봅니다.',
    tags: ['story', 'emotion', 'listen', 'classic', 'all', 'new', 'casual'],
    priority: 3,
  },
  {
    href: '/guides/songs-1970s-1980s',
    title: '1970~80년대 명곡 — 국민가요의 시대',
    kind: '해설',
    description: '남진·나훈아 라이벌 시대부터 주현미까지 익숙한 명곡의 차이를 짚습니다.',
    tags: ['emotion', 'energy', 'listen', 'family', 'classic', 'all', 'new', 'casual'],
    priority: 4,
  },
  {
    href: '/guides/songs-1990s-2010s',
    title: '1990~2010년대 명곡 — 세미 트로트의 확장',
    kind: '해설',
    description: '트로트가 젊은 세대와 다시 만난 흐름을 노래 중심으로 따라갑니다.',
    tags: ['energy', 'listen', 'sing', 'middle', 'all', 'new', 'casual'],
    priority: 3,
  },
  {
    href: '/guides/songs-audition-era',
    title: '경연 프로그램 시대 명곡 — 무대로 다시 듣기',
    kind: '해설',
    description: '오디션 무대에서 다시 주목받은 곡과 원곡을 함께 듣는 순서를 제안합니다.',
    tags: ['stage', 'emotion', 'listen', 'family', 'current', 'all', 'new', 'casual'],
    priority: 5,
  },
  {
    href: '/guides/trot-rhythm-and-scale',
    title: '쿵짝 리듬과 음계 — 들리는 이유 이해하기',
    kind: '해설',
    description: '익숙한 트로트 느낌이 어디에서 생기는지 리듬과 선율로 풀어 봅니다.',
    tags: ['energy', 'story', 'listen', 'sing', 'all', 'casual', 'fan'],
    priority: 2,
  },
  {
    href: '/guides/audition-judging-and-voting',
    title: '경연 심사와 투표 — 점수를 읽는 법',
    kind: '해설',
    description: '마스터 점수와 시청자 투표가 어떻게 다르고 무엇을 의미하는지 정리합니다.',
    tags: ['stage', 'story', 'listen', 'family', 'current', 'fan', 'casual'],
    priority: 4,
  },
  {
    href: '/artists/na-hoon-a',
    title: '나훈아 — 긴 활동사와 대표곡의 변화',
    kind: '가수',
    description: '정통 트로트의 표현과 시대별 활동 흐름을 대표곡과 함께 읽습니다.',
    tags: ['emotion', 'story', 'listen', 'family', 'classic', 'all', 'casual', 'fan'],
    priority: 4,
  },
  {
    href: '/artists/song-ga-in',
    title: '송가인 — 정통 창법이 경연 무대와 만난 방식',
    kind: '가수',
    description: '정통 트로트의 감정선과 현대 경연 무대의 접점을 살펴봅니다.',
    tags: ['emotion', 'stage', 'listen', 'family', 'current', 'all', 'new', 'casual'],
    priority: 5,
  },
  {
    href: '/artists/jang-yoon-jeong',
    title: '장윤정 — 세미 트로트 대중화의 흐름',
    kind: '가수',
    description: '쉽게 따라 부르는 멜로디와 세대 확장의 이유를 대표곡 중심으로 읽습니다.',
    tags: ['energy', 'listen', 'sing', 'family', 'middle', 'all', 'new', 'casual'],
    priority: 5,
  },
  {
    href: '/artists/lim-young-woong',
    title: '임영웅 — 발라드 감성과 트로트 무대의 결합',
    kind: '가수',
    description: '경연 이후 넓어진 음악적 스펙트럼과 감정 전달 방식을 살펴봅니다.',
    tags: ['emotion', 'stage', 'listen', 'family', 'current', 'all', 'new', 'casual'],
    priority: 5,
  },
  {
    href: '/guides/trot-karaoke-guide',
    title: '노래방 실전 — 키·박자·선곡부터 시작하기',
    kind: '실전',
    description: '내 음역에 맞게 키를 고르고 쿵짝 박자를 놓치지 않는 연습 순서를 안내합니다.',
    tags: ['energy', 'emotion', 'sing', 'middle', 'current', 'all', 'new', 'casual'],
    priority: 6,
  },
  {
    href: '/guides/trot-concert-first-visit',
    title: '첫 콘서트 준비 — 예매 뒤부터 귀가까지',
    kind: '실전',
    description: '처음 공연장을 찾는 사람이 놓치기 쉬운 준비물과 현장 흐름을 정리합니다.',
    tags: ['stage', 'energy', 'concert', 'family', 'classic', 'middle', 'current', 'all', 'new', 'casual'],
    priority: 6,
  },
  {
    href: '/guides/trot-streaming-for-parents',
    title: '부모님과 듣기 — 음원 앱과 영상 찾는 법',
    kind: '실전',
    description: '글자 크기, 데이터 사용, 공식 채널 구분까지 가족이 함께 설정하는 순서입니다.',
    tags: ['emotion', 'energy', 'listen', 'family', 'classic', 'middle', 'current', 'all', 'new'],
    priority: 6,
  },
];

const EMPTY: Answers = { mood: '', activity: '', era: '', level: '' };

function score(item: CourseItem, answers: Answers) {
  const matched = Object.values(answers).filter((value) => item.tags.includes(value)).length;
  return matched * 10 + item.priority;
}

function selectedLabel(key: QuestionKey, value: string) {
  return QUESTIONS.find((q) => q.key === key)?.options.find((option) => option.value === value)?.label ?? '';
}

export function TrotStarterCourse() {
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const complete = Object.values(answers).every(Boolean);

  const course = useMemo(() => {
    if (!complete) return [];
    const ranked = [...ITEMS].sort((a, b) => score(b, answers) - score(a, answers));
    const picks: CourseItem[] = [];
    for (const kind of ['해설', '가수', '실전'] as CourseKind[]) {
      const pick = ranked.find((item) => item.kind === kind && !picks.includes(item));
      if (pick) picks.push(pick);
    }
    const extra = ranked.find((item) => !picks.includes(item));
    if (extra) picks.splice(1, 0, extra);
    return picks;
  }, [answers, complete]);

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2">
        {QUESTIONS.map((question, index) => (
          <fieldset key={question.key} className="rounded-xl border border-slate-200 p-4">
            <legend className="px-1 font-bold text-ink-900">{index + 1}. {question.title}</legend>
            <p className="mt-1 text-sm leading-6 text-ink-700">{question.description}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => {
                const checked = answers[question.key] === option.value;
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition ${
                      checked ? 'border-brand-600 bg-brand-50 font-semibold text-brand-800' : 'border-slate-200 text-ink-700 hover:border-brand-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.key}
                      value={option.value}
                      checked={checked}
                      onChange={() => setAnswers((current) => ({ ...current, [question.key]: option.value }))}
                      className="mr-2 accent-brand-600"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {!complete && (
        <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-ink-700" role="status">
          네 질문에 모두 답하면 광고나 인기 순위가 아닌 선택 조건만으로 입문 코스를 계산합니다.
        </p>
      )}

      {complete && (
        <section className="mt-8 rounded-2xl border border-brand-200 bg-brand-50/50 p-5" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-brand-700">선택 조건으로 만든 4단계 코스</p>
              <h2 className="mt-1 text-xl font-extrabold text-ink-900">
                {selectedLabel('mood', answers.mood)}부터 시작하는 트로트 길
              </h2>
              <p className="mt-2 max-w-content text-sm leading-6 text-ink-700">
                {selectedLabel('activity', answers.activity)} · {selectedLabel('era', answers.era)} · {selectedLabel('level', answers.level)} 선택을 반영했습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAnswers(EMPTY)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:border-brand-400"
            >
              다시 고르기
            </button>
          </div>

          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            {course.map((item, index) => (
              <li key={item.href} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs font-semibold text-brand-600">{index + 1}단계 · {item.kind}</p>
                <Link href={item.href} className="mt-1 block font-bold text-ink-900 hover:text-brand-700 hover:underline">
                  {item.title}
                </Link>
                <p className="mt-2 text-sm leading-6 text-ink-700">{item.description}</p>
              </li>
            ))}
          </ol>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            이 결과는 인기투표나 광고 제휴와 무관합니다. 같은 답을 고르면 같은 코스가 나오며, 선택 내용은 서버로 보내거나 저장하지 않습니다.
          </p>
        </section>
      )}
    </div>
  );
}

