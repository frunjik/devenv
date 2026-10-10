import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt({ html: false, linkify: false });
parser.renderer.rules.image = (tokens, index) => parser.utils.escapeHtml(tokens[index].content);

export function renderMarkdownPreview(markdown: string): string {
    const normalized = markdown.replace(/\r\n?/g, '\n');
    const frontmatter = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(normalized);
    if (!frontmatter) return parser.render(normalized);
    const metadata = parser.utils.escapeHtml(frontmatter[1]);
    return `<section aria-label="YAML frontmatter"><h2>YAML frontmatter</h2><pre><code>${metadata}</code></pre></section>\n`
        + parser.render(normalized.slice(frontmatter[0].length));
}
