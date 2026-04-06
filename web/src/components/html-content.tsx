export function HtmlContent({ html }: { html: string }) {
  return <div className="article-html" dangerouslySetInnerHTML={{ __html: html }} />;
}
