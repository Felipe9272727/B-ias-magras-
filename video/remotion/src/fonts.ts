import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fontes baixadas do Google Fonts para public/fonts (subconjuntos latin e latin-ext).
const FILES: [string, string, string][] = [
  ['Poppins', '600', 'Poppins-600'],
  ['Poppins', '800', 'Poppins-800'],
  ['Poppins', '900', 'Poppins-900'],
  ['Press Start 2P', '400', 'PressStart2P-400'],
  ['Bangers', '400', 'Bangers-400'],
  ['JetBrains Mono', '500', 'JetBrainsMono-500'],
  ['JetBrains Mono', '700', 'JetBrainsMono-700'],
];

const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';

export const fontsReady = Promise.all(
  FILES.flatMap(([family, weight, base]) => [
    loadFont({family, weight, url: staticFile(`fonts/${base}-latin.woff2`), unicodeRange: LATIN, display: 'block', format: 'woff2'}),
    loadFont({family, weight, url: staticFile(`fonts/${base}-latin-ext.woff2`), unicodeRange: LATIN_EXT, display: 'block', format: 'woff2'}),
  ]),
);
