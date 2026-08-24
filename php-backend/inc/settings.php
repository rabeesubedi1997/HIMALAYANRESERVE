<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/content.php';

const HR_SECTION_KEYS = ['seo', 'hero', 'stats', 'ancestral', 'civet', 'craft', 'packaging', 'dubai', 'faq', 'press', 'nav', 'footer', 'media'];

function hr_is_section_key(string $key): bool
{
    return in_array($key, HR_SECTION_KEYS, true);
}

function hr_is_assoc(mixed $v): bool
{
    return is_array($v) && !array_is_list($v);
}

/** Deep-merges $override onto $base. Non-array overrides win outright; assoc arrays merge key by key; lists (numeric arrays) are replaced wholesale (matches the original mergeDeep semantics). */
function hr_merge_deep(mixed $base, mixed $override): mixed
{
    if (!hr_is_assoc($override)) {
        return $override === null ? $base : $override;
    }
    if (!hr_is_assoc($base)) {
        return $override;
    }
    $out = $base;
    foreach ($override as $k => $v) {
        if (hr_is_assoc($v) && hr_is_assoc($out[$k] ?? null)) {
            $out[$k] = hr_merge_deep($out[$k], $v);
        } else {
            $out[$k] = $v;
        }
    }
    return $out;
}

/** Builds the full settings array: content.php defaults, deep-merged with whatever rows exist in site_settings. */
function hr_build_settings(?array $dbRows): array
{
    $defaults = hr_content_defaults();
    $out = [];
    foreach (HR_SECTION_KEYS as $key) {
        $override = $dbRows[$key] ?? null;
        $out[$key] = hr_merge_deep($defaults[$key], $override);
    }
    return $out;
}

/** Fetches + merges settings from the DB. Falls back to pure defaults on any DB error. */
function hr_get_settings(): array
{
    try {
        $pdo = hr_db();
        $rows = $pdo->query('SELECT setting_key, settings FROM site_settings')->fetchAll();
        $dbRows = [];
        foreach ($rows as $row) {
            $dbRows[$row['setting_key']] = json_decode($row['settings'], true);
        }
        return hr_build_settings($dbRows);
    } catch (Throwable $e) {
        error_log('hr_get_settings failed, using defaults: ' . $e->getMessage());
        return hr_build_settings(null);
    }
}

/** Recursively strips anything that isn't a scalar/array, and caps sizes — mirrors sanitizeSectionValue in settings.ts. */
function hr_sanitize_section_value(mixed $value): mixed
{
    if ($value === null || is_string($value) || is_int($value) || is_float($value) || is_bool($value)) {
        return $value;
    }
    if (is_array($value)) {
        if (array_is_list($value)) {
            if (count($value) > 200) {
                return null;
            }
            $out = [];
            foreach ($value as $v) {
                $s = hr_sanitize_section_value($v);
                if ($s !== null || $v === null) {
                    $out[] = $s;
                }
            }
            return $out;
        }
        $out = [];
        foreach ($value as $k => $v) {
            if (!is_string($k) || strlen($k) > 80) {
                continue;
            }
            $s = hr_sanitize_section_value($v);
            if ($s !== null || $v === null) {
                $out[$k] = $s;
            }
        }
        return $out;
    }
    return null;
}
