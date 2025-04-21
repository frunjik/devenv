import {isCharAlpha, isCharAlphaUpper, isCharDigit, isCharID, StringCursor, Strings}  from './core-string';

export class MetaII {
    // final output
    output = new Strings();

    // output left margin
    margin = 0;

    // stack information
    // stack frame size (0=gn1, 1=gn2, 2=pc, 3=rule, 4=lm)
    stackframesize = 5;
    // stack frame pointer into stack array
    stackframe = 0;
    // stack of stackframes
    // stack = new array(600) ;
    stack: any[] = [];

    // runtime variables
    // interpreter exit flag
    exitlevel = false;
    // parser control flag
    flag = false;
    // next numeric label to use
    gnlabel = 0;
    // token string from parse
    token = '';

    // output buffer from code ejection
    outbuf = new Strings();

    // extension variables
    // collecting token characters
    tokenflag = false;

    // msg - error msg ?
    msg = '';

    grammar = new StringCursor();
    program = new StringCursor();

    nextGrammarChar() {
        if (this.grammar.eof) throw new Error(`grammar eof`);
        return this.grammar.nextChar();
    }

    nextProgramChar() {
        if (this.program.eof) throw new Error(`program eof`);
        return this.program.nextChar();
    }

    indexOfLabel(s: string) {
        let r = this.program.indexOf("\n" + s + "\n");
    
        if (r === -1)
            r = this.program.indexOf("\n" + s + "\r");
    
        return r;
    }

    findlabel(argSymbol: string) {
        const i = this.indexOfLabel(argSymbol);
    
        if (i >= 0) {
            // skip label
            this.program.pos = i + argSymbol.length + 1;
        } else {
            this.exitlevel = true;
            throw new Error("label '" + argSymbol + "' not found!\n");
        }
    }
    
    runTST() {
        let i;

        const argString = this.readArgString();
    
        this.grammar.skipWhitespace();
    
        // test string case insensitive
        this.flag = true;
        i = 0;
        while (this.flag && i < argString.length) {
            this.flag = argString.charAt(i).toUpperCase() == this.grammar.peekCharAt(this.grammar.pos + i).toUpperCase();
            i++;
        }
    
        // advance input if found
        if (this.flag) {
            this.grammar.skip(argString.length);
        };
    }

    runID() {
        this.grammar.skipWhitespace();
    
        // accept upper alpha or lower alpha
        this.flag = isCharAlpha(this.grammar.peekChar());
    
        if (this.flag) {
            this.token = "";
            while (this.flag) {
                // add to token
                this.token = this.token + this.nextGrammarChar();
                // accept upper alpha or lower alpha or numeral
                this.flag = isCharID(this.grammar.peekChar());
            }
    
            this.flag = true;
        }
    }
    
    runNUM() {
        this.grammar.skipWhitespace();
    
        // accept a numeral
        this.flag = isCharDigit(this.grammar.peekChar());
        if (this.flag) {
            this.token = "";
            while (this.flag) {
                // add to token
                this.token = this.token + this.nextGrammarChar();
                // accept numerals
                this.flag = isCharDigit(this.grammar.peekChar());
            }
            this.flag = true;
        }
    }
    
    runSR() {
        this.grammar.skipWhitespace();
    
        // accept a single quote
        this.flag = this.grammar.peekChar() == "'";
        if (this.flag) {
            this.token = "";
            while (this.flag) {
                // add to token
                this.token = this.token + this.nextGrammarChar();
    
                // accept anything but a single quote
                this.flag = this.grammar.peekChar() != "'";
            }
            // skip teminating single quote
            this.token = this.token + "'";
            this.grammar.skip();
    
            this.flag = true;
        }
    }

    runADR() {
        const argSymbol = this.readArgSymbol();

        this.gnlabel = 1;
        
        this.grammar.pos = 0;
    
        this.margin = 0;
        this.stackframe = 0;
        // initialize first stackframe
        this.stack[this.stackframe * this.stackframesize + 0] = 0; // GN1  also GN (extended only)
        this.stack[this.stackframe * this.stackframesize + 1] = 0; // GN2
        this.stack[this.stackframe * this.stackframesize + 2] = -1; // return pc value
        this.stack[this.stackframe * this.stackframesize + 3] = argSymbol; // rule name called for error messages
        this.stack[this.stackframe * this.stackframesize + 4] = this.margin; // left margin (extended only)
        this.findlabel(argSymbol);
    }
    
    runCLL() {
        // push and initialize a new stackframe
        const argSymbol = this.readArgSymbol();
        this.stackframe++;
        this.stack[this.stackframe * this.stackframesize + 0] = 0; // GN1  also GN (extended only)
        this.stack[this.stackframe * this.stackframesize + 1] = 0; // GN2
        this.stack[this.stackframe * this.stackframesize + 2] = this.program.pos; // return pc value
        this.stack[this.stackframe * this.stackframesize + 3] = argSymbol; // rule name called for error messages
        this.stack[this.stackframe * this.stackframesize + 4] = this.margin; // left margin (needed on backtrack)
        this.findlabel(argSymbol);
    }
    
    runEND() {
        this.exitlevel = true;
        if (!this.flag) {
            throw new Error(
                'first rule "' + this.stack[this.stackframe * this.stackframesize + 3] + '" failed'
            );
        }
    }
    
    runR() {
        // interpretation completed on return on empty stack
        if (this.stackframe == 0) {
            this.runEND();
            return;
        }
        // get return pc from stackframe and pop stack
        this.program.pos = this.stack[this.stackframe * this.stackframesize + 2]; // return pc
    
        this.margin = this.stack[this.stackframe * this.stackframesize + 4];
        this.stackframe--; // pop stackframe
    }

    runSET() {
        this.flag = true;
    }
    
    runB() {
        const argSymbol = this.readArgSymbol();
        this.findlabel(argSymbol);
    }
    
    runBT() {
        const argSymbol = this.readArgSymbol();
        if (this.flag) this.findlabel(argSymbol);
    }
    
    runBF() {
        const argSymbol = this.readArgSymbol();
        if (!this.flag) this.findlabel(argSymbol);
    }
    
    runBE() {
        let msg;
        // only halt if there is an error
        if (this.flag) return;
    
        // provide error context
        this.msg =
            "SYNTAX ERROR:\n" +
            "rule:" +
            this.stack[this.stackframe * this.stackframesize + 3] +
            "\n" +
            "last token:" +
            this.token +
            "\n" +
            "out string:" +
    
            this.outbuf.text +
            "\n" +
            "INPUT:" +
            "\n";
    
        this.msg += "\n";
        this.exitlevel = true;
    
        throw new Error(msg);
    }

    runCL() {
        const argString = this.readArgString();
        this.out(argString);
    }
    
    runCI() {
        this.out(this.token);
    }
    
    runGN1() {
        if (this.stack[this.stackframe * this.stackframesize + 0] == 0) {
            this.stack[this.stackframe * this.stackframesize + 0] = this.gnlabel;
            this.gnlabel++;
        }
        this.out("L" + this.stack[this.stackframe * this.stackframesize + 0]);
    }
    
    runGN2() {
        if (this.stack[this.stackframe * this.stackframesize + 1] == 0) {
            this.stack[this.stackframe * this.stackframesize + 1] = this.gnlabel;
            this.gnlabel++;
        }
        this.out("B" + this.stack[this.stackframe * this.stackframesize + 1]);
    }
    
    runLB() {
        this.outbuf.reset();
    }
    
    runOUT() {
        this.output.append(this.outbuf.text + "\n");
        this.outbuf.reset('\t');
    }
    
    outputLeftMarginIfNeeded() {
        if (this.margin > 0 && this.outbuf.length == 0) {
            // advance to left margin
            let col = 0;
            while (col < this.margin) {
                this.outbuf.append(' ');
                col++;
            }
        }
    }
    
    // out - if necessary move to margin before output of s
    out(s: string) {
        this.outputLeftMarginIfNeeded();
        // output given string
        this.outbuf.append(s);
    }
    
    // extended runtime order codes not in original Meta II paper

    // extensions to provide label and nested output definition

    // NL - generate newline (extended only, compare with runOUT)
    runextNL() {
        // output current line
        this.output.append(this.outbuf.text + "\n");
        this.outbuf.reset();
    }

    // TB - add a tab to the output
    runextTB() {
        this.out("\t");
    }

    // GN - generate unique number (extended only, compare with runGN1)
    runextGN() {
        if (this.stack[this.stackframe * this.stackframesize + 0] == 0) {
            this.stack[this.stackframe * this.stackframesize + 0] = this.gnlabel;
            this.gnlabel++;
        }
        this.out(this.stack[this.stackframe * this.stackframesize + 0]);
    }

    // LMI - increase left margin (extended only)
    runextLMI() {
        this.margin += 2;
    }

    // LMD - decrease left margin (extended only)
    runextLMD() {
        this.margin -= 2;
    }
        
    // extensions to provide token definition

    // CE  - compare input char to code for equal
    runextCE() {
        const argSymbol = this.readArgSymbol();
        this.flag = this.grammar.peekCharCode().toString() == argSymbol;
    }
    
    // CGE - compare input char to code for greater or equal
    runextCGE() {
        const argSymbol = this.readArgSymbol();
        this.flag = this.grammar.peekCharCode().toString() >= argSymbol;
    }
    
    // CLE - compare input char to code for less or equal
    runextCLE() {
        const argSymbol = this.readArgSymbol();
        this.flag = this.grammar.peekCharCode().toString() <= argSymbol;
    }

    // LCH - literal char code to token buffer (extended only)
    runextLCH() {
        // scan the character
        this.token = this.grammar.nextCharCode().toString();
    }

    // NOT - invert parse flag
    runextNOT() {
        this.flag = !this.flag;
    }

    // TFT - set token flag true and clear token
    runextTFT() {
        this.tokenflag = true;
        this.token = "";
    }

    // TFF - set token flag false
    runextTFF() {
        this.tokenflag = false;
    }

    // SCN - if flag, scan input character; if token flag, add to token (extended only)
    runextSCN() {
        if (this.flag) {
            // if taking token, add to token
            if (this.tokenflag) this.token = this.token + this.grammar.peekChar();
            // scan the character
            this.grammar.skip();
        }
    }

    // CC - copy char code to output
    runextCC() {
        // VERIFY !!!!
        const argSymbol = this.readArgSymbol();
        this.outbuf.append(String.fromCharCode(argSymbol as any as number));
    }

    readArgString() {
        let result = '';
        
        // find the beginning of the string
        while (this.program.peekChar() != "'") {
            this.nextProgramChar();
        }
    
        // skip opening single quote
        this.program.skip();
        
        // concat string together
        while (this.program.peekChar() != "'") {
            result += this.nextProgramChar();
        }
    
        // skip terminating single quote
        this.program.skip();

        return result;
    }
    
    readArgSymbol(): string {
        let result = '';

        // skip over the operator (not tab and not blank)
        while (this.program.peekChar() != " " && this.program.peekChar() != "\t") {
            this.nextProgramChar();
        }

        // skip over tabs or blanks
        while (this.program.peekChar() == " " || this.program.peekChar() == "\t") {
            this.nextProgramChar();
        };

        // accrete symbol of alpha and numeral
        while (isCharAlphaUpper(this.program.peekChar()) || isCharDigit(this.program.peekChar())) {
            result += this.nextProgramChar();
        }

        return result;
    }
    
    InterpretOp() {
        let oc;
        let op;
    
        // assumes pc on operator in line
        oc = this.program.pos;
    
        op = "";
        // accrete operator of upper alpha and numeral
        while (
            oc < this.program.length &&
            isCharAlphaUpper(this.program.peekCharAt(oc)) || isCharDigit(this.program.peekCharAt(oc))
        ) {
            op = op + this.program.peekCharAt(oc);
            oc++;
        }
    
        // intrepreter op case branch
        switch (op) {
            // original META II order codes
            case "ADR":
                this.runADR();
                return;         // ADR - specify starting rule
            case "B":
                this.runB();
                return;         // B   - unconditional branch to label
            case "BT":
                this.runBT();
                return;         // BT  - branch if switch true to label
            case "BF":
                this.runBF();
                return;         // BF  - branch if switch false to label
            case "BE":
                this.runBE();
                return;         // BE  - branch if switch false to error halt
            case "CLL":
                this.runCLL();
                return;         // CLL - call rule at label
            case "CL":
                this.runCL();
                return;         // CL  - copy given string argument to output
            case "CI":
                this.runCI();
                return;         // CI  - copy scanned token to output
            case "END":
                this.runEND();
                return;         // END - pseudo op, end of source
            case "GN1":
                this.runGN1();
                return;         // GN1 - make and output label 1
            case "GN2":
                this.runGN2();
                return;         // GN2 - make and output label 2
            case "ID":
                this.runID();
                return;         //  ID  - recognize identifier token
            case "LB":
                this.runLB();
                return;         // LB  - start output in label field
            case "NUM":
                this.runNUM();
                return;         // NUM - recognize number token
            case "OUT":
                this.runOUT();
                return;         // OUT - output out buffer with new line
            case "R":
                this.runR();
                return;         // R   - return from rule call with CLL
            case "SET":
                this.runSET();
                return;         // SET - set switch true
            case "SR":
                this.runSR();
                return;         // SR  - recognize string token including single quotes
            case "TST":
                this.runTST();
                return;         // TST - test for given string argument, if found set switch

            // extensions to provide label and nested output definition
            case "GN":
                this.runextGN();
                return;         // GN  - make and output unique number
            case "LMI":
                this.runextLMI();
                return;         // LMI - left margin increase
            case "LMD":
                this.runextLMD();
                return;         // LMD - left margin decrease
            case "NL":
                this.runextNL();
                return;         // NL  - new line output
            case "TB":
                this.runextTB();
                return;         // TB  - output a tab

            // extensions to provide token definition
            case "CE":
                this.runextCE();
                return;         // CE  - compare input char to code for equal
            case "CGE":
                this.runextCGE();
                return;         // CGE - compare input char to code for greater or equal
            case "CLE":
                this.runextCLE();
                return;         // CLE - compare input char to code for less or equal
            case "LCH":
                this.runextLCH();
                return;         // LCH - literal character code to token as string
            case "NOT":
                this.runextNOT();
                return;         // NOT - complement flag
            case "RF":
                if (!this.flag) {
                    this.runR();
                }
                return;         // RF  - return if switch false
            case "SCN":
                this.runextSCN();
                return;         // SCN - if flag, scan input character; if token flag, add to token
            case "TFF":
                this.runextTFF();
                return;         // TFF - token flag set to false
            case "TFT":
                this.runextTFT();
                return;         // TFT - token flag set to true

            // extensions for backtracking, error handling, and char code output
            case "PFF":
                this.flag = false;
                return;         // PFF - parse flag set to false
            case "PFT":
                this.flag = true;
                return;         // PFT - parse flag set to true (AKA SET)
            case "CC":
                this.runextCC();
                return;         //  CC - copy char code to output
            default:
                this.exitlevel = true;
                throw new Error("ERROR: unknown interpret op '" + op + "'");
        }
    }
    
    compile(g: string, p: string) {
        // create stack of stackframes
        this.stack = new Array(600);
    
        // snap copy of the input and interpreter
        this.grammar.init(g);
        this.program.init(p);
    
        // clear the output
        this.output.reset();
    
        // default initial output to command field (override with LB)
        this.outbuf.reset('\t');
    
        this.exitlevel = false;
        while (true) {

            // skip to the next operator which is prefaced by a '\t'
            while (this.program.peekChar() != "\t") {
                this.nextProgramChar();
            }
    
            this.program.skip();
    
            this.InterpretOp();
            if (this.exitlevel) return this.output.text;
        }
    }
}
