import { redirect } from 'next/navigation';
import { isoYearWeek } from '@/lib/format';

// /weekly → 이번 주 정리로 이동
export default function WeeklyIndex() {
  redirect(`/weekly/${isoYearWeek(new Date())}`);
}
