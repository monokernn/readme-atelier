import type { ThemeId } from '../types.js';
import { garden } from './garden.js';
import { minecraft } from './minecraft.js';
import { minimal } from './minimal.js';
import { pixel } from './pixel.js';
import type { Theme } from './shared.js';
import { terminal } from './terminal.js';
import { y2k } from './y2k.js';

export const THEMES: Record<ThemeId, Theme> = { terminal, y2k, pixel, minimal, garden, minecraft };
export type { Theme };
