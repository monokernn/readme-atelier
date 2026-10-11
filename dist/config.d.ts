import type { AtelierConfig, Ctx, Profile, Scheme, SectionId, Social, SocialKind, ThemeId } from './types.js';
export declare const THEME_IDS: ThemeId[];
export declare const SECTION_IDS: SectionId[];
export declare const SOCIAL_KINDS: SocialKind[];
export declare function defaultConfig(username: string, theme?: ThemeId): AtelierConfig;
/** Validate and clean an untrusted config object. */
export declare function normalizeConfig(raw: any, fallbackUser?: string): AtelierConfig;
export declare function parseConfigYaml(text: string, fallbackUser?: string): AtelierConfig;
export declare function configToYaml(cfg: AtelierConfig): string;
/** Compact URL-safe encoding of a config (for hosted image URLs). */
export declare function encodeConfig(cfg: AtelierConfig): string;
export declare function decodeConfig(s: string): AtelierConfig;
export declare function resolveSocials(cfg: AtelierConfig): Social[];
export declare function makeCtx(p: Profile, c: AtelierConfig, accent: string, scheme: Scheme): Ctx;
