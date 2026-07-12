// 구조화 데이터 삽입 — 화면 표시 내용과 일치하는 JSON-LD만 (§12)
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify로 안전하게 직렬화 (< 이스케이프)
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
