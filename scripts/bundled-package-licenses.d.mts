import type { OutputBundle } from "rollup";

export function packageRootForModule(moduleId: string): string | null;

export function bundledPackageLicenses(bundle: OutputBundle): {
  text: string;
  packages: Array<{
    name: string;
    version: string;
    license: string;
    notices: Array<{ fileName: string; content: string }>;
  }>;
};
