"use client";

import { useEffect, useMemo, useState } from "react";

import type { ModelEntry } from "@/generation/catalog";
import { assemblePrompt, countWords, missingRequired } from "@/prompting/assemble";
import { hasPromptAssistantAi, refinePrompt } from "@/prompting/actions";
import {
  BLOCK_HINTS,
  BLOCK_LABELS,
  profileFor,
  visibleBlocks,
  type Block,
  type Fields,
} from "@/prompting/profiles";

import { CloseIcon, SparkIcon } from "./icons";

/* Drafts survive closing the panel and switching models, for the session. */
const DRAFTS = new Map<string, Fields>();
const BRIEFS = new Map<string, string>();

type Tab = "build" | "brief";

export function PromptAssistant({
  model,
  currentPrompt,
  hasStartFrame,
  onInsert,
  onClose,
}: {
  model: ModelEntry;
  currentPrompt: string;
  hasStartFrame: boolean;
  onInsert: (prompt: string) => void;
  onClose: () => void;
}) {
  const profile = useMemo(() => profileFor(model), [model]);
  const blocks = useMemo(() => visibleBlocks(profile), [profile]);

  const [tab, setTab] = useState<Tab>("build");
  const [fields, setFields] = useState<Fields>(() => DRAFTS.get(model.id) ?? {});
  const [brief, setBrief] = useState(() => BRIEFS.get(model.id) ?? "");
  const [ai, setAi] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ prompt: string; note: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    hasPromptAssistantAi()
      .then((value) => live && setAi(value))
      .catch(() => live && setAi(false));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    DRAFTS.set(model.id, fields);
  }, [model.id, fields]);
  useEffect(() => {
    BRIEFS.set(model.id, brief);
  }, [model.id, brief]);

  const assembled = useMemo(() => assemblePrompt(fields, profile), [fields, profile]);
  const missing = useMemo(() => missingRequired(fields, profile), [fields, profile]);
  const words = countWords(assembled);
  const [minWords, maxWords] = profile.words;
  const lengthNote =
    words === 0 ? null : words < minWords ? "short" : words > maxWords ? "long" : "ok";

  const setField = (block: Block, value: string) => {
    setFields((prev) => ({ ...prev, [block]: value }));
    setResult(null);
  };

  async function refine(source: "fields" | "brief" | "draft") {
    setBusy(true);
    setError(null);
    try {
      const out = await refinePrompt({
        modelId: model.id,
        hasStartFrame,
        ...(source === "fields" ? { fields, draft: assembled } : {}),
        ...(source === "brief" ? { brief } : {}),
        ...(source === "draft" ? { draft: currentPrompt } : {}),
      });
      setResult(out);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  }

  const preview = result?.prompt ?? assembled;
  const canInsert = preview.trim().length > 0;

  return (
    <div className="ohf-popover ohf-popover--assistant" role="dialog" aria-label="Prompt assistant">
      <div className="ohf-assets-head">
        <div className="ohf-assets-tabs" role="tablist" aria-label="Assistant mode">
          <button
            type="button"
            role="tab"
            className="ohf-assets-tab"
            aria-selected={tab === "build"}
            onClick={() => setTab("build")}
          >
            Build
          </button>
          <button
            type="button"
            role="tab"
            className="ohf-assets-tab"
            aria-selected={tab === "brief"}
            onClick={() => setTab("brief")}
            title={ai === false ? "Needs ANTHROPIC_API_KEY on the server" : undefined}
          >
            <SparkIcon size={13} />
            From a brief
            {ai === false && <span className="ohf-assets-tab-count">off</span>}
          </button>
        </div>
        <span className="ohf-assistant-model">{model.label}</span>
        <button
          type="button"
          className="ohf-icon-btn ohf-icon-btn--ghost"
          aria-label="Close"
          title="Close"
          onClick={onClose}
        >
          <CloseIcon size={13} />
        </button>
      </div>

      <div className="ohf-assistant-body ohf-scroll">
        {tab === "build" ? (
          <div className="ohf-assistant-form">
            {blocks.map((block) => {
              const required = profile.blocks[block] === "required";
              return (
                <label key={block} className="ohf-assistant-field">
                  <span className="ohf-assistant-label">
                    {BLOCK_LABELS[block]}
                    {required && <span className="ohf-assistant-req" aria-label="required" />}
                  </span>
                  <textarea
                    className="ohf-assistant-input"
                    rows={2}
                    value={fields[block] ?? ""}
                    placeholder={profile.hints?.[block] ?? BLOCK_HINTS[block]}
                    onChange={(event) => setField(block, event.target.value)}
                  />
                </label>
              );
            })}
          </div>
        ) : (
          <div className="ohf-assistant-form">
            <label className="ohf-assistant-field">
              <span className="ohf-assistant-label">Brief — any language, as rough as you like</span>
              <textarea
                className="ohf-assistant-input ohf-assistant-input--brief"
                rows={6}
                value={brief}
                placeholder="Pub 15 s pour une école d'arts martiaux : les combattants de la photo, le logo au sol devient un socle lumineux, palette rouge / ambre / cyan…"
                onChange={(event) => {
                  setBrief(event.target.value);
                  setResult(null);
                }}
                disabled={ai === false}
              />
            </label>
            {ai === false && (
              <p className="ohf-assistant-hint">
                The AI writer needs <code>ANTHROPIC_API_KEY</code> in the server’s <code>.env</code>. The
                Build tab works without it.
              </p>
            )}
          </div>
        )}

        <aside className="ohf-assistant-side">
          <div className="ohf-pop-head">How {model.label} listens</div>
          <ul className="ohf-assistant-tips">
            {hasStartFrame && profile.startFrameNote && (
              <li className="ohf-assistant-tip--strong">{profile.startFrameNote}</li>
            )}
            {profile.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
            <li>
              Aim for {minWords}–{maxWords} words.
            </li>
          </ul>
          <div className="ohf-pop-head">Example</div>
          <p className="ohf-assistant-example">{profile.example}</p>
          <button type="button" className="ohf-btn-quiet" onClick={() => onInsert(profile.example)}>
            Use the example
          </button>
        </aside>
      </div>

      <div className="ohf-assistant-preview">
        <div className="ohf-assistant-preview-head">
          <span className="ohf-pop-head">{result ? "AI prompt" : "Assembled prompt"}</span>
          <span className="ohf-assistant-count" data-state={lengthNote ?? undefined}>
            {countWords(preview)} words
            {lengthNote === "short" && " · a bit short"}
            {lengthNote === "long" && " · over target"}
          </span>
        </div>
        <p className="ohf-assistant-preview-text">
          {preview || (
            <span className="ohf-assistant-empty">
              {tab === "build"
                ? `Fill the fields — ${missing.map((block) => BLOCK_LABELS[block].toLowerCase()).join(", ") || "any of them"} to start.`
                : "Write a brief and press “Write with AI”."}
            </span>
          )}
        </p>
        {result?.note && <p className="ohf-assistant-note">Note: {result.note}</p>}
        {error && (
          <p className="ohf-assistant-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="ohf-assets-foot">
        <span className="ohf-assets-tally">
          {tab === "build" && missing.length > 0 && !result
            ? `${missing.length} required field${missing.length > 1 ? "s" : ""} left`
            : hasStartFrame
              ? "Start frame attached"
              : ""}
        </span>
        <div className="ohf-assistant-actions">
          {ai !== false && (
            <button
              type="button"
              className="ohf-btn-solid"
              disabled={busy || ai === null || (tab === "brief" ? !brief.trim() : !assembled)}
              onClick={() => refine(tab === "brief" ? "brief" : "fields")}
            >
              {busy ? <span className="ohf-spinner" aria-hidden /> : <SparkIcon size={13} />}
              {tab === "brief" ? "Write with AI" : "Polish with AI"}
            </button>
          )}
          {ai !== false && currentPrompt.trim() && tab === "brief" && (
            <button
              type="button"
              className="ohf-btn-quiet"
              disabled={busy || ai === null}
              onClick={() => refine("draft")}
              title="Rewrite the prompt already in the composer for this model"
            >
              Rewrite current
            </button>
          )}
          <button
            type="button"
            className="ohf-btn-accent"
            disabled={!canInsert}
            onClick={() => onInsert(preview)}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
