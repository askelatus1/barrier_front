interface ImportMeta {
  glob: (pattern: string | string[], options?: { eager?: boolean; import?: string }) => Record<string, any>;
} 