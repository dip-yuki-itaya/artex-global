"use client";

import type { ReactNode } from "react";
import * as React from "react";

import { NextIntlClientProvider } from "next-intl";

import { useActiveLocale } from "./locale-store";
import { MESSAGES } from "./messages";

// 실행 환경(브라우저·프리렌더 서버)의 시간대.
const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

// 실행 중 언어 전환을 담당하는 프로바이더. 루트 레이아웃의 NextIntlClientProvider 를
// 대신해, 사용자가 고른 활성 locale(쿠키·localStorage)로 messages 를 골라 공급한다.
export function IntlRuntimeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const locale = useActiveLocale();

  // 언어가 바뀌면 <html lang> 도 맞춘다. 루트 레이아웃이 서버에서 심은 초기 lang 을
  // 클라이언트 선택값으로 덮어, 스크린 리더·브라우저 번역이 올바른 언어로 동작하게 한다.
  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // 루트 레이아웃의 프로바이더와 달리 서버 요청 설정을 물려받지 않으므로 timeZone 을
  // 직접 넘긴다. 빠지면 next-intl 이 프리렌더 중 ENVIRONMENT_FALLBACK 오류를 남긴다.
  return (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone={TIME_ZONE}>
      {children}
    </NextIntlClientProvider>
  );
}
