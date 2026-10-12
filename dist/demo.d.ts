import type { AtelierConfig, Profile } from './types.js';
/** Fictional profiles for previews and the gallery. No real people. */
export declare const DEMO_USERS: readonly ['nova-kim', 'orbitalfox', 'lumen-ray'];
export declare const DEMO_CONFIG: Record<string, Partial<AtelierConfig>>;
export declare function demoProfile(login?: string): Profile;
