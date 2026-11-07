import { getActiveLocale } from "./locale-store";
import { translatePlain } from "./messages";

// 훅을 쓸 수 없는 곳에서 현재 표시 언어로 번역한다(translatePlain 의 활성 locale 판).
export function plainT(key: string, values?: Record<string, string | number>): string {
  return translatePlain(getActiveLocale(), key, values);
}
