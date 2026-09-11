import { failure, type Result, success } from "../domain/result";
import type { CompatibilityError, ToolSnapshot } from "./types";

const supportedOrigin = "https://nitoyon.github.io";
const basePath = "/pokesleep-tool/";

export interface UpstreamEnvironment {
  readonly url: URL;
  readonly rootExists: boolean;
  readonly readStorage: (key: string) => string | null;
}

export function readToolSnapshot(
  environment: UpstreamEnvironment,
): Result<ToolSnapshot, CompatibilityError> {
  if (environment.url.origin !== supportedOrigin) {
    return failure({
      code: "unsupported-origin",
      message: "対象サイトではありません。",
    });
  }
  if (!environment.url.pathname.startsWith(basePath)) {
    return failure({
      code: "unsupported-path",
      message: "対応していないページです。",
    });
  }
  if (!environment.rootExists) {
    return failure({
      code: "missing-root",
      message: "元ツールの画面構造を確認できません。機能を停止しました。",
    });
  }

  const rawIvState = environment.readStorage("PstIvState");
  if (rawIvState !== null) {
    try {
      const parsed: unknown = JSON.parse(rawIvState);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        throw new TypeError("IV state must be an object");
      }
    } catch {
      return failure({
        code: "invalid-storage",
        message: "元ツールの保存データ形式が不明なため、機能を停止しました。",
      });
    }
  }

  return success({
    page: environment.url.pathname.startsWith(`${basePath}iv/`)
      ? "iv"
      : "research",
    hasIvState: rawIvState !== null,
  });
}
