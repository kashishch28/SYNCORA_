import React, { createContext, useContext, useState } from 'react';
import { MOOD_THEMES } from '../utils/moods';

const MoodContext = createContext(null);
export const useMood = () => useContext(MoodContext);

export function MoodProvider({ children }) {
  const [currentMood, setCurrentMood] = useState('Calm');
  const theme = MOOD_THEMES[currentMood];
  return (
    <MoodContext.Provider value={{ currentMood, setCurrentMood, theme, MOOD_THEMES }}>
      {children}
    </MoodContext.Provider>
  );
}
