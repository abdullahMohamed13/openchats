"use client";

import { useState } from "react";
import { useRef } from "react";
import { Image as ImageIcon, Smile, Send } from "pixelarticons/react";

interface MessageComposerProps {
  placeholder?: string;
  onSend: (content: string) => void;
}

export function MessageComposer({ placeholder = "Send a message", onSend }: MessageComposerProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const content = value.trim();
    if (!content) return;
    onSend(content);
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <div className="shrink-0 border-t border-border bg-background px-4 py-3">
      <div className="flex items-end gap-2 rounded-lg border border-border bg-muted px-2 py-1.5 focus-within:border-primary">
        <button
          type="button"
          aria-label="Add attachment"
          title="Add attachment"
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <ImageIcon width={18} height={18} />
        </button>

        <textarea
          ref={inputRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          rows={1}
          className="max-h-32 min-h-6 flex-1 resize-none bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />

        <button
          type="button"
          aria-label="Add emoji"
          title="Add emoji"
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <Smile width={18} height={18} />
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={!value.trim()}
          aria-label="Send message"
          title="Send message"
          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send width={16} height={16} />
        </button>
      </div>
      <p className="mt-1.5 px-1 text-[11px] text-muted-foreground/70">
        <span className="font-semibold">Enter</span> to send · <span className="font-semibold">Shift + Enter</span> for a new line
      </p>
    </div>
  );
}