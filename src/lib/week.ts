// ISO 주(week) 범위 계산 (주간 정리 /weekly/{year-week})

// year, week(1~53) → 해당 주의 월요일 00:00 ~ 다음 월요일 00:00
export function weekRange(year: number, week: number): { start: Date; end: Date } {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay();
  const monday = new Date(simple);
  // ISO: 목요일 포함 주 규칙 → 월요일로 정렬
  const diff = dow <= 4 ? dow - 1 : dow - 8;
  monday.setUTCDate(simple.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  const end = new Date(monday.getTime() + 7 * 86400000);
  return { start: monday, end };
}

// "2026-W28" 파싱
export function parseYearWeek(yw: string): { year: number; week: number } | null {
  const m = /^(\d{4})-W(\d{2})$/.exec(yw);
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  if (week < 1 || week > 53) return null;
  return { year, week };
}
