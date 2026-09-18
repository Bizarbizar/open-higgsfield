import { readFile } from "node:fs/promises";
import path from "node:path";

import { Marked } from "marked";

/** Repo-root Markdown files served under /docs/<slug>. The file stays the
    single source; the page is a rendering of it. */
export const DOCS = {
  models: { file: "MODELS.md", title: "Guide des modèles" },
  prompts: { file: "PROMPTS.md", title: "Guide des prompts" },
} as const;

export type DocSlug = keyof typeof DOCS;

export function isDocSlug(value: string): value is DocSlug {
  return Object.hasOwn(DOCS, value);
}

const CODE_ID = /`([a-z0-9][a-z0-9.-]*)`/;

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const marked = new Marked({
  gfm: true,
  renderer: {
    /* A heading that names a catalog id ("Soul 2 — `soul-2`") is anchored on
       that id, so /docs/models#soul-2 works from anywhere the id is known. */
    heading({ tokens, depth, raw }) {
      const inline = this.parser.parseInline(tokens);
      const id = raw.match(CODE_ID)?.[1] ?? slugify(raw.replace(/^#+\s*/, ""));
      return `<h${depth} id="${id}"><a href="#${id}" class="ohf-doc-anchor">${inline}</a></h${depth}>\n`;
    },
  },
});

export async function renderDoc(slug: DocSlug): Promise<{ title: string; html: string } | null> {
  let source: string;
  try {
    source = await readFile(path.join(process.cwd(), DOCS[slug].file), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  return { title: DOCS[slug].title, html: await marked.parse(source) };
}
