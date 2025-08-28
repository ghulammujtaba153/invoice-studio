"use client";

import React, { useState, useEffect } from "react";
import { SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListTree, DownloadCloud, Pencil, Check, X, Settings as SettingsIcon } from "lucide-react";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import { useActivityLog } from "@/context/ActivityLogContext";

export function ActivityBarContent({ onClose }: { onClose?: () => void }) {
  const { activityLog, renameEntry } = useActivityLog();
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateMatch = () => setIsMobile(mediaQuery.matches);
    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);
    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, []);

  const handleSaveRename = (id: string) => {
    if (editText.trim()) {
      renameEntry(id, editText.trim());
    }
    setEditingEntryId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditText("");
  };

  return (
    <SheetContent side={isMobile ? "bottom" : "left"} className={`${isMobile ? "h-[80vh]" : "w-80"} p-0 flex flex-col`}>
      <VisuallyHidden>
        <SheetTitle>Activity Log</SheetTitle>
      </VisuallyHidden>

      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Activity Log</h2>
      </div>

      <ScrollArea className="flex-1 px-2">
        {activityLog.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No activity yet. Process invoices to log activity.
          </div>
        ) : (
          activityLog.map((group) => (
            <div key={group.date} className="mb-4">
              <p className="px-2 mb-2 text-xs font-semibold text-muted-foreground">
                {format(new Date(group.date + "T00:00:00Z"), "MMMM d, yyyy")}
              </p>
              <div className="space-y-1">
                {group.entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between group px-2 py-1 hover:bg-accent rounded-md">
                    {editingEntryId === entry.id ? (
                      <div className="flex-grow flex items-center gap-1.5">
                        <ListTree className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(entry.id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="h-7 text-sm flex-grow"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button className="flex-grow flex items-center text-sm text-left">
                        <ListTree className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="truncate">{entry.label} ({format(new Date(entry.timestamp), "p")})</span>
                      </button>
                    )}
                    <div className="flex items-center ml-2 space-x-1">
                      {editingEntryId === entry.id ? (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => handleSaveRename(entry.id)} className="h-6 w-6 p-1 text-green-600">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="h-6 w-6 p-1 text-red-600">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button size="icon" variant="ghost" onClick={() => { setEditingEntryId(entry.id); setEditText(entry.label); }} className="h-6 w-6 p-1 text-muted-foreground opacity-0 group-hover:opacity-100">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {entry.excelFileDataUri && (
                        <Button size="icon" variant="ghost" onClick={() => saveAs(entry.excelFileDataUri!, `invoice_snapshot.xlsx`)} className="h-6 w-6 p-1 text-muted-foreground opacity-0 group-hover:opacity-100">
                          <DownloadCloud className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </ScrollArea>

      <div className="p-3 border-t flex justify-between items-center">
        <p className="text-xs text-muted-foreground">User activity history</p>
        <Button size="icon" variant="ghost" className="hover:bg-accent">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </div>
    </SheetContent>
  );
}
