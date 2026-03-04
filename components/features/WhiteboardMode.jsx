"use client";

import { useState } from "react";
import { PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function WhiteboardMode({ enabled, onToggle }) {
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className={cn(
          "h-7 px-3 text-xs gap-1.5",
          enabled && "bg-primary/10 text-primary-foreground border-primary/25 hover:bg-primary-foreground/15 hover:text-primary-foreground/80"
        )}
      >
        <PenLine size={12} />
        Whiteboard {enabled ? "On" : "Off"}
      </Button>

      {enabled && (
        <div className="relative">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Draft your approach, pseudocode, or key points before revealing the answer..."
            className="h-36 font-mono text-sm leading-relaxed resize-y bg-primary-foreground/5 border-primary/20 focus-visible:ring-primary/30"
          />
          {notes && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotes("")}
              className="absolute top-2 right-2 h-5 w-5 text-muted-foreground hover:text-foreground"
              title="Clear notes"
            >
              <X size={12} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
