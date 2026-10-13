import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Rendu du contenu d'une leçon (Markdown + tableaux, listes de tâches, code).
export function LessonMarkdown({ source }: { source: string }) {
  return (
    <div className="lesson-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target={href?.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="lesson-table">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
