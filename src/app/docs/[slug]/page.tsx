import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DOCS, isDocSlug, renderDoc } from "@/docs/docs";

import "@/openhiggsfield/openhiggsfield.css";
import "./doc.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ohf-inter",
  display: "swap",
});

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isDocSlug(slug)) return {};
  return { title: DOCS[slug].title, alternates: { canonical: `/docs/${slug}` } };
}

export default async function DocPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!isDocSlug(slug)) notFound();
  const doc = await renderDoc(slug);
  if (!doc) notFound();

  return (
    <div className={`ohf ohf-doc ${inter.variable}`}>
      <nav className="ohf-doc-nav" aria-label="Documentation">
        <Link href="/" className="ohf-doc-back">
          ← Studio
        </Link>
        <span className="ohf-doc-tabs">
          {Object.entries(DOCS).map(([key, doc]) => (
            <Link
              key={key}
              href={`/docs/${key}`}
              className="ohf-doc-tab"
              aria-current={key === slug ? "page" : undefined}
            >
              {doc.title}
            </Link>
          ))}
        </span>
      </nav>
      {/* Our own Markdown from the repo, rendered at build time — not user input. */}
      <article className="ohf-doc-body" dangerouslySetInnerHTML={{ __html: doc.html }} />
    </div>
  );
}
