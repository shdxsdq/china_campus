import type { ReactNode } from "react";
import Link from "next/link";

import type { RichContentNode } from "@/lib/types";

const headingTags = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const;

const isNodeRecord = (value: unknown): value is RichContentNode =>
  typeof value === "object" && value !== null;

const getChildren = (node: RichContentNode) =>
  Array.isArray(node.children) ? node.children.filter(isNodeRecord) : [];

const renderInlineChildren = (nodes: RichContentNode[]) =>
  nodes.map((node, index) => renderInlineNode(node, `inline-${index}`));

const wrapTextMarks = (node: RichContentNode, content: ReactNode) => {
  let output = content;

  if (node.code) {
    output = <code>{output}</code>;
  }
  if (node.bold) {
    output = <strong>{output}</strong>;
  }
  if (node.italic) {
    output = <em>{output}</em>;
  }
  if (node.underline) {
    output = <u>{output}</u>;
  }
  if (node.strikethrough) {
    output = <s>{output}</s>;
  }

  return output;
};

const renderInlineNode = (node: RichContentNode, key: string): ReactNode => {
  if (node.type === "link") {
    const href = typeof node.url === "string" ? node.url : "#";

    return (
      <Link key={key} href={href} target="_blank" rel="noreferrer">
        {renderInlineChildren(getChildren(node))}
      </Link>
    );
  }

  if (typeof node.text === "string") {
    return <span key={key}>{wrapTextMarks(node, node.text)}</span>;
  }

  const children = getChildren(node);
  if (children.length === 0) {
    return null;
  }

  return <span key={key}>{renderInlineChildren(children)}</span>;
};

const renderListItem = (node: RichContentNode, key: string) => {
  const children = getChildren(node);

  return <li key={key}>{renderInlineChildren(children)}</li>;
};

const renderBlock = (node: RichContentNode, key: string): ReactNode => {
  const children = getChildren(node);

  switch (node.type) {
    case "heading": {
      const level = Math.min(Math.max(Number(node.level ?? 2), 1), 6) as keyof typeof headingTags;
      const Tag = headingTags[level];
      return <Tag key={key}>{renderInlineChildren(children)}</Tag>;
    }
    case "list": {
      const Tag = node.format === "ordered" ? "ol" : "ul";
      return (
        <Tag key={key}>
          {children.map((child, index) => renderListItem(child, `${key}-${index}`))}
        </Tag>
      );
    }
    case "quote":
      return <blockquote key={key}>{renderInlineChildren(children)}</blockquote>;
    case "code": {
      const content = children
        .map((child) => (typeof child.text === "string" ? child.text : ""))
        .join("");
      return (
        <pre key={key}>
          <code>{content}</code>
        </pre>
      );
    }
    case "paragraph":
    default:
      return <p key={key}>{renderInlineChildren(children)}</p>;
  }
};

export function RichContent({ content }: { content: RichContentNode[] }) {
  return <>{content.map((block, index) => renderBlock(block, `block-${index}`))}</>;
}
