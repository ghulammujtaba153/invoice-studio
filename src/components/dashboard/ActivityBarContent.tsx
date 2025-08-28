"use client";

import React, { useState } from "react";
import type { ActivityLog } from "@/types/activity";
import { SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ListTree,
  DownloadCloud,
  Pencil,
  Check,
  X,
  PanelLeft,
  Settings as SettingsIcon,
} from "lucide-react";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";

interface ActivityBarContentProps {
  activityLog: ActivityLog;
  onRenameEntry: (entryId: string, newLabel: string) => void;
  onOpenSettings: () => void;
  onClose?: () => void; // optional close fn
}

export function ActivityBarContent({
  activityLog,
  onRenameEntry,
  onOpenSettings,
  onClose,
}: ActivityBarContentProps) {
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");

  const handleStartEdit = (id: string, currentLabel: string) => {
    setEditingEntryId(id);
    setEditText(currentLabel);
  };

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateMatch = () => setIsMobile(mediaQuery.matches);
    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);
    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, []);

  const handleSaveRename = (id: string) => {
    if (editText.trim()) {
      onRenameEntry(id, editText.trim());
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

      {/* Header */}
      <div className="p-4 flex items-center justify-start gap-2 border-b">
        <h2 className="text-lg font-semibold">Activity Log</h2>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-2">
        {activityLog.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No activity yet. Process invoices to log activity.
          </div>
        )}
        {activityLog.map((group) => (
          <div key={group.date} className="mb-4">
            <p className="px-2 mb-2 text-xs font-semibold text-muted-foreground">
              {format(new Date(group.date + "T00:00:00Z"), "MMMM d, yyyy")}
            </p>
            <div className="space-y-1">
              {group.entries.map((entry) => {
                const handleDownload = () => {
                  if (entry.excelFileDataUri) {
                    const timestampStr = format(
                      new Date(entry.timestamp),
                      "yyyyMMdd_HHmmss"
                    );
                    const fileName = `invoice_snapshot_${timestampStr}.xlsx`;
                    fetch(entry.excelFileDataUri)
                      .then((res) => res.blob())
                      .then((blob) => {
                        if (blob.size > 0) {
                          saveAs(blob, fileName);
                        } else {
                          console.warn("Empty Excel file in activity log.");
                        }
                      })
                      .catch((err) =>
                        console.error("Error downloading Excel:", err)
                      );
                  }
                };

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between w-full group rounded-md px-2 py-1 hover:bg-accent"
                  >
                    {editingEntryId === entry.id ? (
                      <div className="flex-grow flex items-center gap-1.5">
                        <ListTree className="h-4 w-4 mr-1 flex-shrink-0 text-muted-foreground" />
                        <Input
                          type="text"
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
                      <button className="flex-grow text-left flex items-center text-sm">
                        <ListTree className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {entry.label} (
                          {format(new Date(entry.timestamp), "p")})
                        </span>
                      </button>
                    )}

                    <div className="flex items-center flex-shrink-0 ml-1.5 space-x-0.5">
                      {editingEntryId === entry.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveRename(entry.id)}
                            aria-label="Save rename"
                            className="h-6 w-6 p-1 text-green-600 hover:bg-accent hover:text-green-500"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancelEdit}
                            aria-label="Cancel rename"
                            className="h-6 w-6 p-1 text-red-600 hover:bg-accent hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleStartEdit(entry.id, entry.label)
                            }
                            aria-label="Edit activity label"
                            className={cn(
                              "h-6 w-6 p-1 text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity",
                              entry.excelFileDataUri ? "" : "mr-[28px]"
                            )}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {entry.excelFileDataUri && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleDownload}
                              aria-label="Download Excel snapshot"
                              className="h-6 w-6 p-1 text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                            >
                              <DownloadCloud className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t flex items-center justify-between">
        <p className="text-xs text-muted-foreground">User activity history</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="hover:bg-accent"
          aria-label="Open Settings"
        >
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </div>
    </SheetContent>
  );
}
