/** Escape text for SVG/XML. Underscores are encoded so they never collide with `__` id scoping. */
export declare function esc(s: unknown): string;
export declare function compact(n: number): string;
export declare function grouped(n: number): string;
export declare function truncate(s: string, max: number): string;
/** Greedy word wrap by character count. */
export declare function wrap(s: string, max: number, maxLines?: number): string[];
export declare function hash(s: string): number;
/** Deterministic PRNG (mulberry32). */
export declare function rng(seed: number | string): {
    next: () => number;
    range: (lo: number, hi: number) => number;
    int: (lo: number, hi: number) => number;
    pick: <T>(arr: T[]) => T;
    chance: (p: number) => boolean;
};
export declare function hexToRgb(hex: string): [number, number, number];
export declare function rgbToHex(r: number, g: number, b: number): string;
export declare function mix(a: string, b: string, t: number): string;
export declare function rgba(hex: string, a: number): string;
export declare function luminance(hex: string): number;
export declare function isHex(s: unknown): s is string;
export declare function normHex(s: string): string;
export declare const f: (n: number) => number;
export declare function sinceYear(iso: string): string;
export declare function updatedLabel(iso: string): string;
/** Group calendar days into weeks (columns of 7). */
export declare function weeks<T>(days: T[]): T[][];
/** Rough text width estimate in px for a given font-size and average glyph factor. */
export declare function textWidth(s: string, size: number, factor?: number): number;
/** Shrink a font size so `s` fits into `max` px. */
export declare function fitSize(s: string, size: number, max: number, factor?: number, min?: number): number;
