import type { Card } from '../card.js';
import type { Ctx, Day, Repo, Scheme, Social, ThemeId } from '../types.js';
export declare const W = 840;
export declare const HALF = 410;
export interface Theme {
    id: ThemeId;
    name: string;
    /** One-line pitch shown in the gallery */
    blurb: string;
    accent: string;
    /** Color schemes this theme renders. More than one → <picture> with light/dark sources. */
    schemes: Scheme[];
    header(c: Ctx): Card;
    stats(c: Ctx): Card;
    languages(c: Ctx): Card;
    activity(c: Ctx): Card;
    repo(c: Ctx, r: Repo): Card;
    stack(c: Ctx): Card;
    social(c: Ctx, s: Social): Card;
    footer(c: Ctx): Card;
}
/** Always 53 full weeks (371 cells), oldest first, padded with empty days. */
export declare function gridDays(c: Ctx): Day[];
export interface StatRow {
    key: 'stars' | 'commits' | 'prs' | 'issues' | 'reviews' | 'contributed' | 'repos' | 'followers';
    label: string;
    short: string;
    value: number;
}
export declare function statRows(c: Ctx): StatRow[];
/** Month labels with the column index of the first week that starts in that month. */
export declare function monthLabels(days: Day[]): {
    col: number;
    label: string;
}[];
export declare function contributionLine(c: Ctx): string;
/**
 * Render a pixel bitmap. `rows` are strings of palette keys, `.` is transparent.
 * Horizontal runs of the same color are merged into one rect.
 */
export declare function bitmap(rows: string[], palette: Record<string, string>, x: number, y: number, s: number): string;
/** 5-point star polygon centered in a `size` box at (x, y). */
export declare function star(x: number, y: number, size: number, attrs?: string): string;
/** Git fork glyph (stroke) in a `size` box. */
export declare function fork(x: number, y: number, size: number, color: string, sw?: number): string;
/** 8×8 pixel icons for stat rows (pixel + minecraft themes). */
export declare const PIXEL_ICONS: Record<StatRow['key'], string[]>;
export declare function card(w: number, h: number, title: string, parts: Partial<Card> & {
    body: string;
}): Card;
