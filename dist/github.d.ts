import type { Day, Profile } from './types.js';
export declare class GitHubError extends Error {
    status: number;
    constructor(message: string, status?: number);
}
export declare function computeStreak(days: Day[]): {
    current: number;
    longest: number;
};
export interface FetchOptions {
    token?: string;
    /** Repo names to feature, in order */
    featured?: string[];
    /** Skip downloading avatars (faster previews) */
    noAvatar?: boolean;
}
/** Collect everything the themes need. GraphQL requires a token; without one a reduced REST fallback is used. */
export declare function fetchProfile(login: string, opts?: FetchOptions): Promise<Profile>;
