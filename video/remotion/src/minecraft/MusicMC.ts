import {createContext} from 'react';

// Audio export uses the original voice/SFX tree; music is mixed by mix_audio.py.
// Normal video compositions retain their existing music behavior.
export const MusicMC = createContext(true);
export const AudioOnlyMC = createContext(false);
