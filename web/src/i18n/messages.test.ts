import { describe, expect, it } from "vitest";

import { LOCALES } from "./config";
import { translatePlain } from "./messages";

describe("translatePlain", () => {
  it("returns the Japanese text and substitutes placeholders", () => {
    expect(translatePlain("ja", "apiErrors.uploadFailed", { status: 500 })).toBe("アップロードに失敗しました: 500");
    expect(translatePlain("ja", "scopeEditor.error.tooLong", { max: 1024 })).toContain("1024");
  });

  it("resolves every plain-text key in every locale without leaking a raw key", () => {
    const keys = [
      "apiErrors.unauthorized",
      "apiErrors.downloadFailed",
      "mockData.report",
      "scopeEditor.error.empty",
      "logsPage.mock.plan",
      "chat.agentFallback",
    ];
    for (const locale of LOCALES) {
      for (const key of keys) expect(translatePlain(locale, key)).not.toBe(key);
    }
  });

  it("falls back to the key itself when nothing matches", () => {
    expect(translatePlain("ja", "no.such.key")).toBe("no.such.key");
  });
});
