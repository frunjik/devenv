import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { MarkdownPreviewComponent } from './markdown-preview.component';
import { renderMarkdownPreview } from './render-markdown-preview';

describe('Markdown preview', () => {
    beforeEach(() => { TestBed.configureTestingModule({ imports: [MarkdownPreviewComponent] }); });
    afterEach(() => { TestBed.resetTestingModule(); });

    it('renders headings, lists, code, tables and links from its input and updates', () => {
        const fixture = TestBed.createComponent(MarkdownPreviewComponent);
        fixture.componentRef.setInput('markdown', '# Title\n\n- Item\n\n```ts\nconst x = 1;\n```\n\n[Link](https://example.com)\n\n| A |\n| - |\n| B |');
        fixture.detectChanges();
        const host: HTMLElement = fixture.nativeElement;
        expect(host.querySelector('h1')?.textContent).toBe('Title');
        expect(host.querySelector('li')?.textContent).toBe('Item');
        expect(host.querySelector('pre code')?.textContent).toContain('const x = 1;');
        expect(host.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
        expect(host.querySelector('table')).not.toBeNull();
        fixture.componentRef.setInput('markdown', '## Updated');
        fixture.detectChanges();
        expect(host.querySelector('h1')).toBeNull();
        expect(host.querySelector('h2')?.textContent).toBe('Updated');
    });

    it('shows frontmatter as labelled code without treating incomplete delimiters as metadata', () => {
        expect(renderMarkdownPreview('---\r\nname: Test\r\n---\r\n# Body')).toContain('<h2>YAML frontmatter</h2>');
        expect(renderMarkdownPreview('---\nname: Test\n---\n# Body')).toContain('name: Test');
        expect(renderMarkdownPreview('---\nunfinished')).not.toContain('YAML frontmatter');
        expect(renderMarkdownPreview('')).toBe('');
    });

    it('does not render raw HTML, images or unsafe link destinations', () => {
        const fixture = TestBed.createComponent(MarkdownPreviewComponent);
        fixture.componentRef.setInput('markdown', '<script>alert(1)</script>\n\n<img src="https://example.com/track" onerror="alert(1)">\n\n[bad](javascript:alert%281%29)\n\n![remote](https://example.com/image)');
        fixture.detectChanges();
        const host: HTMLElement = fixture.nativeElement;
        expect(host.querySelector('script,img')).toBeNull();
        expect([...host.querySelectorAll('a')].some(link => link.getAttribute('href')?.includes('javascript:'))).toBe(false);
        expect(host.textContent).toContain('remote');
    });
});
