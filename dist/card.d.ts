import { type FontKey } from './fonts/index.js';
/**
 * A rendered card before finalisation. Inside `body`, `css` and `defs`,
 * every `__` is a scope token: ids (`id="__sky"`), references (`url(#__sky)`),
 * classes (`.__title`) and keyframes (`@keyframes __drift`). It is replaced
 * with a unique prefix so several cards can be nested into one SVG.
 * User text must always pass through `esc()`, which encodes `_`.
 */
export interface Card {
    w: number;
    h: number;
    title: string;
    body: string;
    css?: string;
    defs?: string;
    fonts: FontKey[];
    /** Rounded clip radius applied to the whole card (0 = none) */
    radius?: number;
}
/** Standalone SVG document for one card. */
export declare function renderCard(card: Card, uid?: string): Promise<string>;
/**
 * One SVG containing several cards laid out in rows. Used by the
 * "paste a single file" install path. Each row is centered, with `gap` spacing.
 */
export declare function renderCombined(rows: Card[][], title: string, width?: number, gap?: number): Promise<string>;
