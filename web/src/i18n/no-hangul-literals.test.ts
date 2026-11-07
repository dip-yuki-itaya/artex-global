import { describe, expect, it } from "vitest";

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

// 화면에 그대로 렌더되는 문자열이 locale 을 무시하고 한글로 하드코딩되는 회귀를 막는다.
// 사용자 문구는 messages/*.json 키로 옮겨야 하며, 코드 주석의 한글은 허용한다.
// (주석을 걷어낸 뒤의 코드에서만 한글을 찾는다.)

const SRC = path.resolve(process.cwd(), "src");
const HANGUL = /[가-힣]/;

// 한글이 의도적으로 남는 파일: 언어 선택기의 자국어 표기, ko 메타데이터, 개발용 스크립트.
const ALLOWED = [
  /^i18n\/config\.ts$/,
  /^config\/app-config\.ts$/,
  /^scripts\//,
  // 백엔드(intercept/intercept.go 의 msgToolApprovalRequestFmt)가 내보내는 고정 문장을 해석하는
  // 정규식이라 화면 문구가 아니다. Go 쪽 테스트가 이 형태를 고정한다.
  /^components\/transcript\.tsx$/,
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => line.replace(/(^|\s)\/\/.*$/, "$1"))
    .join("\n");
}

describe("hard-coded Hangul in UI source", () => {
  it("strips block, JSX and line comments but keeps string literals", () => {
    expect(HANGUL.test(stripComments("// 주석\nconst a = 1;"))).toBe(false);
    expect(HANGUL.test(stripComments("{/* 주석\n  이어짐 */}\n<p>ok</p>"))).toBe(false);
    expect(HANGUL.test(stripComments('const a = "한글"; // 주석'))).toBe(true);
  });

  it("has no Hangul string literals outside the allowlist", () => {
    const offenders = walk(SRC)
      .map((file) => path.relative(SRC, file).split(path.sep).join("/"))
      .filter((rel) => !ALLOWED.some((re) => re.test(rel)))
      .filter((rel) => HANGUL.test(stripComments(readFileSync(path.join(SRC, rel), "utf8"))));
    expect(offenders, `Hangul literals found in: ${offenders.join(", ")}`).toEqual([]);
  });
});
