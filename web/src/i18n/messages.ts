import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";
import jaMessages from "../../messages/ja.json";
import koMessages from "../../messages/ko.json";
import zhMessages from "../../messages/zh.json";
import type { Locale } from "./config";

// 다섯 언어 메시지를 모두 정적으로 번들해 둔다. 그래야 사용자가 설정 화면에서 언어를
// 바꿀 때 재빌드나 페이지 새로고침, 비동기 로딩 없이 그 자리에서 모든 문구가 선택한
// 언어로 다시 렌더링된다(정적 내보내기 output: "export" 와도 호환된다).
export const MESSAGES: Record<Locale, Record<string, unknown>> = {
  en: enMessages as Record<string, unknown>,
  ko: koMessages as Record<string, unknown>,
  zh: zhMessages as Record<string, unknown>,
  es: esMessages as Record<string, unknown>,
  ja: jaMessages as Record<string, unknown>,
};

// 점으로 이어진 키로 메시지 문자열을 찾는다. 없으면 undefined.
function lookup(tree: Record<string, unknown>, key: string): string | undefined {
  let node: unknown = tree;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

// React 밖(lib·mock handler·fetch 오류)에서 쓰는 번역 함수. 훅을 쓸 수 없는 곳에서 사용자에게
// 보일 문구를 현재 locale 로 만든다. `{name}` 자리표시자만 치환하며(ICU plural/select 미지원),
// 해당 locale 에 키가 없으면 영어로, 그것도 없으면 키 자체를 돌려준다.
export function translatePlain(locale: Locale, key: string, values?: Record<string, string | number>): string {
  const template = lookup(MESSAGES[locale], key) ?? lookup(MESSAGES.en, key) ?? key;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    values && name in values ? String(values[name]) : whole,
  );
}
