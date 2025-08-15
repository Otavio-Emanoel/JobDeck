import React, { createContext, useContext, useState, type ReactNode } from 'react';

type ResumeContextValue = {
  resume: unknown;
  setResume: (r: unknown) => void;
};

const ResumeContext = createContext<ResumeContextValue | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resume, setResume] = useState<unknown>(null);
  return (
    <ResumeContext.Provider value={{ resume, setResume }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within ResumeProvider');
  return ctx;
}
