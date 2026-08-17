import "server-only";

import { cache } from "react";
import { getPool } from "@/lib/db";
import { content } from "@/lib/content";

export const SECTION_KEYS = [
  "seo",
  "hero",
  "stats",
  "ancestral",
  "civet",
  "craft",
  "packaging",
  "dubai",
  "press",
  "nav",
  "footer",
  "media",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export type Settings = Record<SectionKey, unknown>;

export function isSectionKey(key: string): key is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(key);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function mergeDeep<T>(base: T, override: unknown): T {
  if (!isPlainObject(override)) return base;
  if (!isPlainObject(base)) return override as T;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (isPlainObject(v) && isPlainObject(out[k])) {
      out[k] = mergeDeep(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

export function buildSettings(dbRows: Record<string, unknown> | null): Settings {
  const sections = {} as Settings;
  for (const key of SECTION_KEYS) {
    sections[key] = mergeDeep(content[key], dbRows?.[key] ?? null);
  }
  return sections;
}

export const getSettings = cache(async (): Promise<Settings> => {
  try {
    const pool = getPool();
    const result = (await pool.query(
      `SELECT setting_key, settings FROM site_settings`
    )) as unknown as { setting_key: string; settings: unknown }[];
    const dbRows: Record<string, unknown> = {};
    for (const row of result) dbRows[row.setting_key] = row.settings;
    return buildSettings(dbRows);
  } catch (err) {
    console.error("getSettings failed, using defaults:", err);
    return buildSettings(null);
  }
});

export function sanitizeSectionValue(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length > 200) return undefined;
    const out = value.map(sanitizeSectionValue).filter((v) => v !== undefined);
    return out;
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (k.length > 80) continue;
      if (typeof v === "function" || v === undefined) continue;
      const s = sanitizeSectionValue(v);
      if (s !== undefined) out[k] = s;
    }
    return out;
  }
  return undefined;
}