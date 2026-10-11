import * as data from './data.js';
export type FontKey = keyof typeof data;
interface FontMeta {
    family: string;
    weight: number;
    style: 'normal' | 'italic';
    fallback: string;
}
export declare const FONTS: Record<FontKey, FontMeta>;
/** CSS font-family value (with fallbacks) for a key. */
export declare function ff(key: FontKey): string;
/** Inline style fragment: family + weight + style. */
export declare function font(key: FontKey, size: number): string;
/**
 * @font-face rule for `key`, subset to `chars` when the subsetter is available
 * (Node: CLI, Action, server). Falls back to the pre-subset Latin font.
 */
export declare function fontFace(key: FontKey, chars: string): Promise<string>;
export {};
