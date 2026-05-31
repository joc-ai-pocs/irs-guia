import { marked } from 'marked';
import { html } from '@/ui/dom';
import './Markdown.css';

/**
 * Configure marked once for the whole app: GFM-flavored, with line breaks
 * preserved as <br>. We render synchronously so {@link Markdown} can return
 * an element directly without dealing with Promises.
 */
marked.setOptions({ gfm: true, breaks: false, async: false });

export interface MarkdownProps {
  /** Raw markdown source (typically imported via `?raw`). */
  readonly source: string;
  /** Optional extra class added to the wrapper, e.g. `intro`. */
  readonly className?: string;
}

/**
 * Renders a chunk of markdown into a `<div class="md">` element. Inline raw
 * HTML in the markdown is preserved — useful for editorial constructs like
 * `<em class="term">coletável</em>` that don't have a pure-markdown analog.
 */
export function Markdown(props: MarkdownProps): HTMLElement {
  const rendered = marked.parse(props.source.trim()) as string;
  const el = html(rendered);
  el.className = props.className ? `md ${props.className}` : 'md';
  return el;
}
