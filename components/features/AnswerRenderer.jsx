"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

/** Shared answer renderer — used in modal + flashcard */
export default function AnswerRenderer({ content }) {
  // Replace escaped newlines, but preserve indentation inside fenced code blocks
  const cleaned = (content ?? "")
    .replace(/\\n/g, "\n")
    .replace(/\n\s{2,}/g, "\n")
    .trim();

  return (
    <div className="answer-prose text-wrap">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            if (!inline && match) {
              return (
                <div className="my-4 rounded-xl overflow-hidden" style={{ border: "1px solid color-mix(in srgb, var(--app-green) 18%, transparent)" }}>
                  {/* language label */}
                  <div
                    className="flex items-center justify-between px-4 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest"
                    style={{
                      background: "color-mix(in srgb, var(--app-green) 8%, transparent)",
                      color: "var(--app-green)",
                      borderBottom: "1px solid color-mix(in srgb, var(--app-green) 12%, transparent)",
                    }}
                  >
                    <span>{match[1]}</span>
                    <span className="opacity-40">···</span>
                  </div>
                  <SyntaxHighlighter
                    style={atomOneDark}
                    language={match[1]}
                    PreTag="div"
                    wrapLines
                    wrapLongLines
                    lineProps={() => ({
                      style: {
                        display: "block",
                        paddingLeft: "1.5em",
                        textIndent: "-1.5em",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      },
                    })}
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      fontSize: "13px",
                      lineHeight: "1.6",
                      padding: "16px",
                      background: "#0d1117",
                      overflowX: "hidden",
                    }}
                    codeTagProps={{
                      style: {
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      },
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              );
            }
            return (
              <code
                className="px-1.5 py-0.5 rounded-md font-mono text-[13px]"
                style={{
                  background: "color-mix(in srgb, var(--app-green) 10%, transparent)",
                  color: "var(--app-green)",
                  border: "1px solid color-mix(in srgb, var(--app-green) 18%, transparent)",
                }}
                {...props}
              >
                {children}
              </code>
            );
          },

          h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-3 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold mt-5 mb-2.5 text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold mt-4 mb-2 text-foreground">{children}</h3>,

          p: ({ children }) => <p className="mb-3 text-sm leading-relaxed text-foreground/90">{children}</p>,

          ul: ({ children }) => <ul className="mb-3 space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 space-y-1 pl-5 list-decimal">{children}</ol>,
          li: ({ children }) => (
            <li className="text-sm text-foreground/90 leading-relaxed relative before:absolute before:-left-3.5 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--app-green)] list-none">
              {children}
            </li>
          ),

          blockquote: ({ children }) => (
            <blockquote
              className="my-3 pl-4 py-2 rounded-r-xl text-sm italic text-muted-foreground"
              style={{
                borderLeft: "3px solid var(--app-green)",
                background: "color-mix(in srgb, var(--app-green) 5%, transparent)",
              }}
            >
              {children}
            </blockquote>
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--app-green)" }}
            >
              {children}
            </a>
          ),

          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,

          hr: () => <hr className="my-4 border-border" />,

          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
          th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-sm text-foreground/90 border-b border-border/50">{children}</td>,
        }}
      >
        {cleaned}
      </Markdown>
    </div>
  );
}
