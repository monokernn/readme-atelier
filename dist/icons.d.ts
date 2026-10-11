import type { SocialKind } from './types.js';
export interface Icon {
    slug: string;
    title: string;
    hex: string;
    /** SVG path data in a 24×24 box */
    path: string;
}
export declare function findIcon(name: string): Icon | undefined;
/** Display title for a stack entry even when no icon exists. */
export declare function stackTitle(name: string): string;
export declare function socialIcon(kind: SocialKind): Icon;
/** `<path>` for an icon scaled into a `size` box at (x, y). */
export declare function iconPath(icon: Icon, x: number, y: number, size: number, attrs?: string): string;
