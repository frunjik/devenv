export type char = string;

export class Strings {
    private _strings: string[] = [];

    get text(): string {
        return this._strings.join('');
    }

    get length(): number {
        return this.text.length;
    }

    reset(s: string = '') {
        this._strings = [];
        s && this._strings.push(s);
    }

    append(s: string) {
        this._strings.push(s);
    }
}

export class StringCursor {
    private _txt = '';
    private _pos = 0;

    constructor(t: string = '') {
        this.init(t);
    }

    init(t: string, p = 0) {
        this._txt = t;
        this._pos = p;
    }

    get eof(): boolean {
        return this._pos >= this.length;
    }

    get txt(): string {
        return this._txt;
    }

    get pos(): number {
        return this._pos;
    }

    set pos(p) {
        this._pos = p;
    }

    get length(): number {
        return this._txt.length;
    }

    skip(n = 1) {
        this._pos += n;
    }

    skipWhitespace() {
        // skip initial whitespace (space, newline, return, tab)
        while (!this.eof && isCharWhitespace(this.peekChar())) {
            this.skip();
        }
    }

    peekCharAt(i: number): string {
        return this._txt.charAt(i);
    }

    peekCharCodeAt(i: number): number {
        return this._txt.charCodeAt(i);
    }

    peekChar(): string {
        return this.peekCharAt(this.pos);
    }

    peekCharCode(): number {
        return this.peekCharCodeAt(this.pos);
    }

    nextChar(): string {
        const r = this.peekChar();
        this.skip();
        return r;
    }

    nextCharCode(): number {
        const r = this.peekCharCode();
        this.skip();
        return r;
    }

    indexOf(s: string): number {
        return this._txt.indexOf(s);
    }
}

export function isCharAlphaUpper(s: char) {
    return s >= 'A' && s <= 'Z';
}

export function isCharAlphaLower(s: char) {
    return s >= 'a' && s <= 'z';
}

export function isCharAlpha(s: char) {
    return isCharAlphaLower(s) || isCharAlphaUpper(s);
}

export function isCharDigit(s: char) {
    return s >= '0' && s <= '9';
}

export function isCharSpace(s: char) {
    return s === ' ';
}

export function isCharLF(s: char) {
    return s === '\r';
}

export function isCharCR(s: char) {
    return s === '\n';
}

export function isCharTab(s: char) {
    return s === '\t';
}

export function isCharWhitespace(s: char) {
    return isCharSpace(s) || isCharLF(s) || isCharCR(s) || isCharTab(s)
}

export function isCharID(s: char) {
    return isCharAlpha(s) || isCharDigit(s);
}
