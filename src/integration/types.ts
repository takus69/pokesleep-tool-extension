export type CompatibilityErrorCode =
  | "unsupported-origin"
  | "unsupported-path"
  | "missing-root"
  | "invalid-storage";

export interface CompatibilityError {
  readonly code: CompatibilityErrorCode;
  readonly message: string;
}

export interface ToolSnapshot {
  readonly page: "research" | "iv";
  readonly hasIvState: boolean;
}
