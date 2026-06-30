// @author codex
import { useEffect, useId, useMemo, useState } from "react";

type MarkdownBlock =
  | { content: string; type: "heading"; level: 1 | 2 | 3 | 4 }
  | { content: string; type: "paragraph" }
  | { items: string[]; type: "ul" | "ol" }
  | { content: string; language?: string; type: "code" }
  | { content: string; type: "quote" }
  | { headers: string[]; rows: string[][]; type: "table" }
  | { content: string; title: string; type: "callout" }
  | { type: "hr" };

type MarkdownDocumentProps = {
  markdown: string;
};

let hasInitializedMermaid = false;

const flushParagraph = (blocks: MarkdownBlock[], lines: string[]) => {
  if (lines.length === 0) return;
  blocks.push({ content: lines.join(" "), type: "paragraph" });
  lines.length = 0;
};

const isTableDivider = (line: string) =>
  /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());

const isTableRow = (line: string) => {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.split("|").length > 2;
};

const parseTableRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

const parseMarkdown = (markdown: string) => {
  const blocks: MarkdownBlock[] = [];
  const paragraphLines: string[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let codeLines: string[] | null = null;
  let codeLanguage = "";
  let pendingList: Extract<MarkdownBlock, { type: "ul" | "ol" }> | null = null;
  let calloutLines: string[] | null = null;
  let calloutTitle = "";

  const flushList = () => {
    if (!pendingList) return;
    blocks.push(pendingList);
    pendingList = null;
  };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const trimmed = line.trim();

    if (calloutLines) {
      if (trimmed === ":::") {
        blocks.push({
          content: calloutLines.join(" ").trim(),
          title: calloutTitle || "提示",
          type: "callout",
        });
        calloutLines = null;
        calloutTitle = "";
      } else {
        calloutLines.push(trimmed);
      }
      continue;
    }

    if (codeLines) {
      if (trimmed.startsWith("```")) {
        blocks.push({
          content: codeLines.join("\n"),
          language: codeLanguage,
          type: "code",
        });
        codeLines = null;
        codeLanguage = "";
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (trimmed.startsWith(":::")) {
      flushParagraph(blocks, paragraphLines);
      flushList();
      calloutLines = [];
      calloutTitle = trimmed.replace(/^:::\w*/, "").trim();
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph(blocks, paragraphLines);
      flushList();
      codeLines = [];
      codeLanguage = trimmed.replace(/^```/, "").trim();
      continue;
    }

    if (!trimmed) {
      flushParagraph(blocks, paragraphLines);
      flushList();
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      flushParagraph(blocks, paragraphLines);
      flushList();
      blocks.push({ type: "hr" });
      continue;
    }

    if (
      isTableRow(trimmed) &&
      lines[lineIndex + 1] &&
      isTableDivider(lines[lineIndex + 1])
    ) {
      flushParagraph(blocks, paragraphLines);
      flushList();
      const headers = parseTableRow(trimmed);
      const rows: string[][] = [];
      let rowIndex = lineIndex + 2;
      while (rowIndex < lines.length && isTableRow(lines[rowIndex])) {
        rows.push(parseTableRow(lines[rowIndex]));
        rowIndex += 1;
      }
      blocks.push({ headers, rows, type: "table" });
      lineIndex = rowIndex - 1;
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushParagraph(blocks, paragraphLines);
      flushList();
      blocks.push({
        content: heading[2],
        level: heading[1].length as 1 | 2 | 3 | 4,
        type: "heading",
      });
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph(blocks, paragraphLines);
      flushList();
      blocks.push({ content: trimmed.replace(/^>\s+/, ""), type: "quote" });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph(blocks, paragraphLines);
      if (!pendingList || pendingList.type !== "ul") flushList();
      pendingList ??= { items: [], type: "ul" };
      pendingList.items.push(trimmed.replace(/^[-*]\s+/, ""));
      continue;
    }

    const orderedMatch = /^\d+\.\s+(.+)$/.exec(trimmed);
    if (orderedMatch) {
      flushParagraph(blocks, paragraphLines);
      if (!pendingList || pendingList.type !== "ol") flushList();
      pendingList ??= { items: [], type: "ol" };
      pendingList.items.push(orderedMatch[1]);
      continue;
    }

    flushList();
    paragraphLines.push(trimmed);
  }

  flushList();
  flushParagraph(blocks, paragraphLines);
  if (calloutLines) {
    blocks.push({
      content: calloutLines.join(" ").trim(),
      title: calloutTitle || "提示",
      type: "callout",
    });
  }
  if (codeLines) {
    blocks.push({ content: codeLines.join("\n"), language: codeLanguage, type: "code" });
  }

  return blocks;
};

function InlineText({ value }: { value: string }) {
  const parts = value
    .split(/(\[[^\]]+\]\(https?:\/\/[^)]+\)|`[^`]+`|\*\*[^*]+\*\*)/g)
    .filter(Boolean);

  return (
    <>
      {parts.map((part, index) => {
        const link = /^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/.exec(part);
        if (link) {
          return (
            <a
              className="font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
              href={link[2]}
              key={`${part}-${index}`}
              rel="noreferrer"
              target="_blank"
            >
              {link[1]}
            </a>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.85em] font-semibold text-slate-900"
              key={`${part}-${index}`}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong className="font-bold text-slate-950" key={`${part}-${index}`}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

function MermaidDiagram({ chart }: { chart: string }) {
  const reactId = useId();
  const diagramId = useMemo(
    () => `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [reactId],
  );
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      try {
        const { default: mermaid } = await import("mermaid");

        if (!hasInitializedMermaid) {
          mermaid.initialize({
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif',
            securityLevel: "strict",
            startOnLoad: false,
            theme: "base",
            themeVariables: {
              primaryColor: "#f8fafc",
              primaryBorderColor: "#334155",
              primaryTextColor: "#0f172a",
              lineColor: "#475569",
              secondaryColor: "#eef2ff",
              tertiaryColor: "#ecfeff",
            },
          });
          hasInitializedMermaid = true;
        }

        const result = await mermaid.render(diagramId, chart);
        if (isMounted) {
          setSvg(result.svg);
          setError("");
        }
      } catch (renderError) {
        if (isMounted) {
          setSvg("");
          setError(renderError instanceof Error ? renderError.message : "Mermaid render failed");
        }
      }
    };

    void renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart, diagramId]);

  if (svg) {
    return (
      <div
        aria-label="Mermaid 架构图"
        className="mermaid-rendered overflow-x-auto p-4"
        dangerouslySetInnerHTML={{ __html: svg }}
        role="img"
      />
    );
  }

  return (
    <div className="space-y-2 p-4">
      {error ? <p className="text-xs font-semibold text-rose-700">{error}</p> : null}
      <pre className="overflow-x-auto rounded bg-white p-3 text-xs leading-6 text-slate-700">
        <code>{chart}</code>
      </pre>
    </div>
  );
}

export function MarkdownDocument({ markdown }: MarkdownDocumentProps) {
  const blocks = useMemo(() => parseMarkdown(markdown), [markdown]);

  return (
    <section className="space-y-5">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <h1 className="text-2xl font-bold leading-9 text-slate-950" key={key}>
                {block.content}
              </h1>
            );
          }
          if (block.level === 2) {
            return (
              <h2 className="border-b border-slate-200 pb-2 text-lg font-bold text-slate-950" key={key}>
                {block.content}
              </h2>
            );
          }
          return (
            <h3 className="text-base font-bold text-slate-950" key={key}>
              {block.content}
            </h3>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p className="text-sm leading-8 text-slate-700" key={key}>
              <InlineText value={block.content} />
            </p>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote className="border-l-4 border-slate-300 pl-4 text-sm leading-7 text-slate-600" key={key}>
              <InlineText value={block.content} />
            </blockquote>
          );
        }

        if (block.type === "code") {
          if (block.language === "mermaid") {
            return (
              <figure
                className="overflow-hidden rounded-md border border-slate-200 bg-slate-50"
                key={key}
              >
                <figcaption className="border-b border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-normal text-slate-500">
                  Mermaid 图
                </figcaption>
                <MermaidDiagram chart={block.content} />
              </figure>
            );
          }
          return (
            <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100" key={key}>
              <code>{block.content}</code>
            </pre>
          );
        }

        if (block.type === "table") {
          return (
            <div className="overflow-x-auto rounded-md border border-slate-200" key={key}>
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-normal text-slate-500">
                  <tr>
                    {block.headers.map((header) => (
                      <th className="px-3 py-2" key={header}>
                        <InlineText value={header} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {block.rows.map((row, rowIndex) => (
                    <tr key={`${key}-row-${rowIndex}`}>
                      {block.headers.map((header, cellIndex) => (
                        <td className="px-3 py-3 align-top leading-6" key={`${header}-${cellIndex}`}>
                          <InlineText value={row[cellIndex] ?? ""} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === "callout") {
          return (
            <aside className="rounded-md border border-blue-200 bg-blue-50 p-4" key={key}>
              <h4 className="text-sm font-bold text-blue-950">{block.title}</h4>
              <p className="mt-2 text-sm leading-7 text-blue-900">
                <InlineText value={block.content} />
              </p>
            </aside>
          );
        }

        if (block.type === "ul" || block.type === "ol") {
          const ListTag = block.type;
          return (
            <ListTag className="ml-5 space-y-2 text-sm leading-7 text-slate-700" key={key}>
              {block.items.map((item) => (
                <li className={block.type === "ul" ? "list-disc" : "list-decimal"} key={item}>
                  <InlineText value={item} />
                </li>
              ))}
            </ListTag>
          );
        }

        return <hr className="border-slate-200" key={key} />;
      })}
    </section>
  );
}
