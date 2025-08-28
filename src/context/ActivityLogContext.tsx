"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { ActivityLog } from "@/types/activity";
import { nanoid } from "nanoid";
import { ActivityEntry, ActivityDateGroup } from "@/types/activity";

type ActivityLogContextType = {
  activityLog: ActivityLog;
  logActivity: (label: string, excelFileDataUri?: string) => void;
  renameEntry: (entryId: string, newLabel: string) => void;
};

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export const ActivityLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activityLog, setActivityLog] = useState<ActivityLog>([]);

  const logActivity = useCallback((label: string, excelFileDataUri?: string) => {
    const newEntry: ActivityEntry = {
      id: nanoid(),
      label,
      timestamp: Date.now(),
      excelFileDataUri,
    };
    const today = new Date().toISOString().split("T")[0];

    setActivityLog((prevLog) => {
      const todayGroupIndex = prevLog.findIndex((group) => group.date === today);
      if (todayGroupIndex > -1) {
        const updatedLog = [...prevLog];
        updatedLog[todayGroupIndex] = {
          ...updatedLog[todayGroupIndex],
          entries: [newEntry, ...updatedLog[todayGroupIndex].entries],
        };
        return updatedLog;
      } else {
        const newGroup: ActivityDateGroup = { date: today, entries: [newEntry] };
        return [newGroup, ...prevLog];
      }
    });
  }, []);

  const renameEntry = useCallback((entryId: string, newLabel: string) => {
    setActivityLog((prevLog) =>
      prevLog.map((group) => ({
        ...group,
        entries: group.entries.map((entry) =>
          entry.id === entryId ? { ...entry, label: newLabel } : entry
        ),
      }))
    );
  }, []);

  return (
    <ActivityLogContext.Provider value={{ activityLog, logActivity, renameEntry }}>
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = () => {
  const ctx = useContext(ActivityLogContext);
  if (!ctx) throw new Error("useActivityLog must be used within an ActivityLogProvider");
  return ctx;
};
