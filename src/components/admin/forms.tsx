import { WORKFLOW_STATUS, WORKFLOW_STATUS_LABEL, EVENT_STATUS, EVENT_STATUS_LABEL, REGIONS, ARTICLE_TYPES, ARTICLE_TYPE_LABEL } from '@/lib/enums';
import { parseSocialLinks, parseArray } from '@/lib/json';

// ---- 공용 입력 프리미티브 ----
const dInput = (d?: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const dtInput = (d?: Date | null) => (d ? new Date(d).toISOString().slice(0, 16) : '');

export function Field({ label, name, defaultValue, type = 'text', required, placeholder, hint }: {
  label: string; name: string; defaultValue?: string; type?: string; required?: boolean; placeholder?: string; hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-800">{label}{required && <span className="text-red-500"> *</span>}</span>
      <input name={name} type={type} defaultValue={defaultValue} required={required} placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      {hint && <span className="mt-0.5 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, name, defaultValue, rows = 3, hint, mono }: {
  label: string; name: string; defaultValue?: string; rows?: number; hint?: string; mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-800">{label}</span>
      <textarea name={name} defaultValue={defaultValue} rows={rows}
        className={`mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ${mono ? 'font-mono text-xs' : ''}`} />
      {hint && <span className="mt-0.5 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function Select({ label, name, options, defaultValue }: {
  label: string; name: string; options: { value: string; label: string }[]; defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-800">{label}</span>
      <select name={name} defaultValue={defaultValue} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function SampleCheck({ defaultChecked }: { defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-700">
      <input type="checkbox" name="isSample" defaultChecked={defaultChecked} />
      SAMPLE(가상 데모) 데이터로 표시
    </label>
  );
}

const statusOptions = WORKFLOW_STATUS.map((s) => ({ value: s, label: WORKFLOW_STATUS_LABEL[s] }));

// 관계 다중선택 (체크박스)
export function RelationChecks({ label, name, all, selectedIds }: {
  label: string; name: string; all: { id: string; label: string }[]; selectedIds: string[];
}) {
  if (!all.length) return null;
  return (
    <fieldset className="rounded-lg border border-slate-200 p-3">
      <legend className="px-1 text-sm font-medium text-ink-800">{label}</legend>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {all.map((o) => (
          <label key={o.id} className="flex items-center gap-1.5 text-sm text-ink-700">
            <input type="checkbox" name={name} value={o.id} defaultChecked={selectedIds.includes(o.id)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type Action = (fd: FormData) => Promise<void>;

// ================= 가수 폼 =================
export function ArtistForm({ action, artist }: { action: Action; artist?: any }) {
  const social = artist ? parseSocialLinks(artist.officialSocialLinks).map((s: any) => `${s.label}|${s.url}`).join('\n') : '';
  return (
    <form action={action} className="space-y-4">
      {artist && <input type="hidden" name="id" value={artist.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="활동명" name="stageName" defaultValue={artist?.stageName} required />
        <Field label="slug" name="slug" defaultValue={artist?.slug} hint="비우면 활동명으로 자동 생성" />
        <Field label="본명(공개된 경우만)" name="realName" defaultValue={artist?.realName ?? ''} hint="미확인이면 비워둠(추정 금지)" />
        <Field label="출신지" name="birthPlace" defaultValue={artist?.birthPlace ?? ''} />
        <Field label="출생일" name="birthDate" type="date" defaultValue={dInput(artist?.birthDate)} />
        <Field label="데뷔일" name="debutDate" type="date" defaultValue={dInput(artist?.debutDate)} />
        <Field label="소속사" name="agency" defaultValue={artist?.agency ?? ''} />
        <Field label="팬덤명" name="fanClubName" defaultValue={artist?.fanClubName ?? ''} />
        <Field label="공식 홈페이지" name="officialWebsite" defaultValue={artist?.officialWebsite ?? ''} placeholder="https://" />
        <Field label="마지막 사실 확인일" name="lastFactCheckedAt" type="date" defaultValue={dInput(artist?.lastFactCheckedAt)} />
      </div>
      <TextArea label="핵심 소개(3문장 권장)" name="profileSummary" defaultValue={artist?.profileSummary} rows={3} />
      <TextArea label="공식 SNS (한 줄에 '라벨|https://url')" name="officialSocialLinks" defaultValue={social} rows={3}
        hint="예: 공식 유튜브|https://youtube.com/..." />
      <div className="flex flex-wrap items-center gap-4">
        <Select label="상태" name="status" options={statusOptions} defaultValue={artist?.status ?? 'draft'} />
        <div className="pt-5"><SampleCheck defaultChecked={artist ? artist.isSample : true} /></div>
      </div>
      <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">저장</button>
    </form>
  );
}

// ================= 공연 폼 =================
export function EventForm({ action, event, allArtists }: { action: Action; event?: any; allArtists: { id: string; label: string }[] }) {
  const selected = event?.artists?.map((a: any) => a.id) ?? [];
  return (
    <form action={action} className="space-y-4">
      {event && <input type="hidden" name="id" value={event.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="공연명" name="eventName" defaultValue={event?.eventName} required />
        <Field label="slug" name="slug" defaultValue={event?.slug} hint="비우면 공연명으로 자동 생성" />
        <Select label="유형" name="eventType" defaultValue={event?.eventType ?? 'concert'} options={[
          { value: 'concert', label: '콘서트' }, { value: 'festival', label: '페스티벌' },
          { value: 'fanmeeting', label: '팬미팅' }, { value: 'broadcast_recording', label: '공개방송' },
        ]} />
        <Select label="공연 상태" name="eventStatus" defaultValue={event?.eventStatus ?? 'scheduled'}
          options={EVENT_STATUS.map((s) => ({ value: s, label: EVENT_STATUS_LABEL[s] }))} />
        <Field label="시작 일시" name="startDateTime" type="datetime-local" defaultValue={dtInput(event?.startDateTime)} required />
        <Field label="종료 일시" name="endDateTime" type="datetime-local" defaultValue={dtInput(event?.endDateTime)} />
        <Field label="장소" name="venue" defaultValue={event?.venue ?? ''} />
        <Select label="지역" name="region" defaultValue={event?.region ?? ''} options={[{ value: '', label: '(미지정)' }, ...REGIONS.map((r) => ({ value: r.slug, label: r.label }))]} />
        <Field label="주소" name="address" defaultValue={event?.address ?? ''} />
        <Field label="주최" name="organizer" defaultValue={event?.organizer ?? ''} />
        <Field label="예매처" name="ticketVendor" defaultValue={event?.ticketVendor ?? ''} />
        <Field label="예매 URL" name="ticketUrl" defaultValue={event?.ticketUrl ?? ''} placeholder="https://" />
        <Field label="예매 시작" name="ticketOpenDate" type="datetime-local" defaultValue={dtInput(event?.ticketOpenDate)} />
        <Field label="가격 정보" name="priceInformation" defaultValue={event?.priceInformation ?? ''} />
        <Field label="관람 연령" name="ageRestriction" defaultValue={event?.ageRestriction ?? ''} />
        <Field label="공식 출처 URL" name="officialSourceUrl" defaultValue={event?.officialSourceUrl ?? ''} placeholder="https://" />
        <Field label="교통·주차" name="transportInfo" defaultValue={event?.transportInfo ?? ''} />
        <Field label="마지막 확인일" name="sourceCheckedAt" type="date" defaultValue={dInput(event?.sourceCheckedAt)} />
      </div>
      <RelationChecks label="출연 가수" name="artistIds" all={allArtists} selectedIds={selected} />
      <div className="flex flex-wrap items-center gap-4">
        <Select label="게시 상태" name="status" options={statusOptions} defaultValue={event?.status ?? 'draft'} />
        <div className="pt-5"><SampleCheck defaultChecked={event ? event.isSample : true} /></div>
      </div>
      <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">저장</button>
    </form>
  );
}

// ================= 음반 폼 =================
export function MusicForm({ action, music, allArtists }: { action: Action; music?: any; allArtists: { id: string; label: string }[] }) {
  const selected = music?.artists?.map((a: any) => a.id) ?? [];
  const tracks = music ? parseArray(music.trackList).join('\n') : '';
  return (
    <form action={action} className="space-y-4">
      {music && <input type="hidden" name="id" value={music.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="제목" name="title" defaultValue={music?.title} required />
        <Field label="slug" name="slug" defaultValue={music?.slug} hint="비우면 제목으로 자동 생성" />
        <Select label="유형" name="type" defaultValue={music?.type ?? 'single'} options={[
          { value: 'single', label: '싱글' }, { value: 'album', label: '앨범' }, { value: 'ost', label: 'OST' },
        ]} />
        <Field label="발매일" name="releaseDate" type="date" defaultValue={dInput(music?.releaseDate)} />
        <Field label="레이블" name="label" defaultValue={music?.label ?? ''} />
      </div>
      <TextArea label="설명" name="description" defaultValue={music?.description ?? ''} rows={3} />
      <TextArea label="수록곡 (한 줄에 한 곡)" name="trackList" defaultValue={tracks} rows={4} />
      <RelationChecks label="참여 가수" name="artistIds" all={allArtists} selectedIds={selected} />
      <div className="flex flex-wrap items-center gap-4">
        <Select label="상태" name="status" options={statusOptions} defaultValue={music?.status ?? 'draft'} />
        <div className="pt-5"><SampleCheck defaultChecked={music ? music.isSample : true} /></div>
      </div>
      <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">저장</button>
    </form>
  );
}

// ================= 기사 신규 =================
export function ArticleCreateForm({ action, allArtists, allEvents, allMusic }: {
  action: Action; allArtists: { id: string; label: string }[]; allEvents: { id: string; label: string }[]; allMusic: { id: string; label: string }[];
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="제목" name="title" required />
        <Field label="slug" name="slug" hint="비우면 제목으로 자동 생성" />
        <Select label="유형" name="type" defaultValue="news" options={ARTICLE_TYPES.map((t) => ({ value: t, label: ARTICLE_TYPE_LABEL[t] }))} />
        <Field label="핵심 키워드" name="primaryKeyword" />
      </div>
      <TextArea label="설명 / 요약 (meta description)" name="description" rows={2} />
      <TextArea label="본문 (Markdown)" name="body" rows={12} mono />
      <RelationChecks label="관련 가수" name="artistIds" all={allArtists} selectedIds={[]} />
      <RelationChecks label="관련 공연" name="eventIds" all={allEvents} selectedIds={[]} />
      <RelationChecks label="관련 음반" name="musicIds" all={allMusic} selectedIds={[]} />
      <SampleCheck defaultChecked={true} />
      <p className="text-xs text-slate-400">신규 기사는 초안(draft)으로 저장됩니다. 발행은 편집기에서 검증 후 진행하세요.</p>
      <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">초안 생성</button>
    </form>
  );
}
