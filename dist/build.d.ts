import { type Card } from './card.js';
import type { Theme } from './themes/shared.js';
import type { AtelierConfig, Ctx, Profile, Scheme } from './types.js';
export declare const REPO_URL = "https://github.com/monokern/readme-atelier";
export declare const ACTION_REF = "monokern/readme-atelier@v1";
export declare const ASSET_DIR = "atelier";
export declare const START = "<!-- readme-atelier:start -->";
export declare const END = "<!-- readme-atelier:end -->";
export type CardName = 'header' | 'stats' | 'languages' | 'activity' | 'stack' | 'footer' | `repo-${number}` | `social-${string}`;
/** Render one named card as a Card object (not yet serialised). */
export declare function cardFor(theme: Theme, ctx: Ctx, name: CardName): Card | null;
/** Serialise one card to SVG text. Used by the hosted image endpoint. */
export declare function renderNamedCard(profile: Profile, cfg: AtelierConfig, name: CardName, scheme?: Scheme): Promise<string | null>;
/** Where images live: files in the repo, or the hosted endpoint. */
export type ImageSource = {
    kind: 'files';
    dir?: string;
} | {
    kind: 'hosted';
    base: string;
};
/** The generated README block (between the start/end markers). */
export declare function readmeBlock(profile: Profile, cfg: AtelierConfig, src: ImageSource): string;
/** Insert or replace the generated block inside an existing README. */
export declare function mergeReadme(existing: string | null, block: string): string;
/** Every card, for every scheme the theme supports, as SVG files keyed by repo path. */
export declare function buildAssets(profile: Profile, cfg: AtelierConfig, dir?: string): Promise<Record<string, string>>;
export declare function workflowYaml(): string;
export declare function installGuide(cfg: AtelierConfig): string;
/** Everything needed for the ZIP / local install: README, assets, config, workflow, guide. */
export declare function buildRepoFiles(profile: Profile, cfg: AtelierConfig): Promise<Record<string, string>>;
/** Single-file variant: one combined SVG + a README that points at it. */
export declare function buildSingleFile(profile: Profile, cfg: AtelierConfig): Promise<{
    svg: string;
    readme: string;
}>;
