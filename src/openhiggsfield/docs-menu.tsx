"use client";

import { useEffect, useRef, useState } from "react";

import { BookIcon } from "./icons";

const GUIDES = [
  {
    href: "/docs/models",
    title: "Guide des modèles",
    hint: "Quel modèle pour quel besoin",
  },
  {
    href: "/docs/prompts",
    title: "Guide des prompts",
    hint: "Structure idéale, variantes par modèle",
  },
];

/** Topbar entry to the in-app guides: a book button that drops a two-link
    card. Guides open in a new tab so the composer and its runs stay put. */
export function DocsMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="ohf-docs" ref={rootRef}>
      <button
        type="button"
        className="ohf-key ohf-docs-btn"
        aria-label="Guides"
        title="Guides"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <BookIcon />
        <span className="ohf-key-text">Guides</span>
      </button>
      {open && (
        <div className="ohf-docs-pop" role="menu" aria-label="Guides">
          {GUIDES.map((guide) => (
            <a
              key={guide.href}
              role="menuitem"
              className="ohf-docs-item"
              href={guide.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
            >
              <span className="ohf-docs-item-title">{guide.title} ↗</span>
              <span className="ohf-docs-item-hint">{guide.hint}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
