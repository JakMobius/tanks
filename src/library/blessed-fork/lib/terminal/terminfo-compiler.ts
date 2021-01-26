import fs from "fs";
import sprintf from "./sprintf";
import {Terminfo, TputConfig} from "./tput";

export interface TerminfoCompilerConfig {
    info: Terminfo
    key: string
    str: any
    debug?: boolean
    tputOptions: TputConfig
}

export default class TerminfoCompiler {
    private info: Terminfo;
    private str: string;
    private key: string;
    private debug: boolean
    private code: string
    private buff: string;
    private val: string;
    private cap: string[]
    private ch: string
    private config: TerminfoCompilerConfig;

    private static header = 'let v, dyn = {}, stat = {}, stack = [], out = [];'
    private static footer = ';return out.join("");'

    _debug(...values: any[]) {
        if(!this.debug) return
        return console.log.apply(console, arguments);
    }

    private constructor(config: TerminfoCompilerConfig) {
        this.info = config.info
        this.key = config.key
        this.str = config.str as string
        this.debug = config.debug
        this.config = config

        this.val = this.str
        this.code = TerminfoCompiler.header
        this.buff = ""
    }

    static noop() { return "" }

    static compile(config: TerminfoCompilerConfig): any {

        switch (typeof config.str) {
            case 'boolean':
                return config.str;
            case 'number':
                return config.str;
            case 'string':
                break;
            default:
                return TerminfoCompiler.noop;
        }

        if (!config.str) {
            return TerminfoCompiler.noop;
        }

        let compiler = new TerminfoCompiler(config)

        return compiler.compile()
    }

    stmt(c: string) {
        if (this.code[this.code.length - 1] === ',') {
            this.code = this.code.slice(0, -1);
        }
        this.code += c;
    }

    expr(c: string) {
        this.code += c + ',';
    }

    echo(c: string) {
        if (c === '""') return;
        this.expr('out.push(' + c + ')');
    }

    read(regex: RegExp, no?: boolean): boolean {
        this.cap = regex.exec(this.val);
        if (!this.cap) return false;
        this.val = this.val.substring(this.cap[0].length);
        this.ch = this.cap[1];
        if (!no) this.clear();
        return true
    }

    print(c: string) {
        this.buff += c;
    }

    clear() {
        if (this.buff) {
            this.echo(JSON.stringify(this.buff).replace(/\\u00([0-9a-fA-F]{2})/g, '\\x$1'));
            this.buff = '';
        }
    }

// See:
// ~/ncurses/ncurses/tinfo/lib_tparm.c
// ~/ncurses/ncurses/tinfo/comp_scan.c
    compile(): Function {
        let v;

        this._debug('Compiling %s: %s', this.key, JSON.stringify(this.str));

        // See:
        // ~/ncurses/progs/tput.c - tput() - L149
        // ~/ncurses/progs/tset.c - set_init() - L992
        if (this.key === 'init_file' || this.key === 'reset_file') {
            try {
                this.str = fs.readFileSync(this.str, 'utf8');
                if (this.debug) {
                    v = ('return ' + JSON.stringify(this.str) + ';')
                        .replace(/\x1b/g, '\\x1b')
                        .replace(/\r/g, '\\r')
                        .replace(/\n/g, '\\n');
                    process.stdout.write(v + '\n');
                }
                return () => this.str;
            } catch (e) {
                return TerminfoCompiler.noop;
            }
        }

        let tkey = this.info.name + '.' + this.key
        let end = null;

        while (this.val) {
            // Ignore newlines
            if (this.read(/^\n /, true)) {
                continue;
            }

            // '^A' -> ^A
            if (this.read(/^\^(.)/i, true)) {
                if (!(this.ch >= ' ' && this.ch <= '~')) {
                    this._debug('%s: bad caret char.', tkey);
                    // NOTE: ncurses appears to simply
                    // continue in this situation, but
                    // I could be wrong.
                    this.print(this.cap[0]);
                    continue;
                }
                if (this.ch === '?') {
                    this.ch = '\x7f';
                } else {
                    let charCode = this.ch.charCodeAt(0) & 31;
                    if (charCode === 0) charCode = 128;
                    this.ch = String.fromCharCode(charCode);
                }
                this.print(this.ch);
                continue;
            }

            // 3 octal digits -> character
            if (this.read(/^\\([0-7]{3})/, true)) {
                this.print(String.fromCharCode(parseInt(this.ch, 8)));
                continue;
            }

            // '\e' -> ^[
            // '\n' -> \n
            // '\r' -> \r
            // '\0' -> \200 (special case)
            if (this.read(/^\\([eEnlrtbfs\^\\,:0]|.)/, true)) {
                switch (this.ch) {
                    case 'e':
                    case 'E':
                        this.ch = '\x1b';
                        break;
                    case 'n':
                        this.ch = '\n';
                        break;
                    case 'l':
                        this.ch = '\x85';
                        break;
                    case 'r':
                        this.ch = '\r';
                        break;
                    case 't':
                        this.ch = '\t';
                        break;
                    case 'b':
                        this.ch = '\x08';
                        break;
                    case 'f':
                        this.ch = '\x0c';
                        break;
                    case 's':
                        this.ch = ' ';
                        break;
                    case '^':
                        this.ch = '^';
                        break;
                    case '\\':
                        this.ch = '\\';
                        break;
                    case ',':
                        this.ch = ',';
                        break;
                    case ':':
                        this.ch = ':';
                        break;
                    case '0':
                        this.ch = '\x80';
                        break;
                    case 'a':
                        this.ch = '\x07';
                        break;
                    default:
                        this._debug('%s: bad backslash char.', tkey);
                        this.ch = this.cap[0];
                        break;
                }
                this.print(this.ch);
                continue;
            }

            // $<5> -> padding
            // e.g. flash_screen: '\u001b[?5h$<100/>\u001b[?5l',
            if (this.read(/^\$<(\d+)([*\/]{0,2})>/, true)) {
                //if (this.config.tputOptions.padding) this.print(this.cap[0]);
                continue;
            }

            // %%   outputs `%'
            if (this.read(/^%%/, true)) {
                this.print('%');
                continue;
            }

            // %[[:]flags][width[.precision]][doxXs]
            //   as in printf, flags are [-+#] and space.  Use a `:' to allow the
            //   next character to be a `-' flag, avoiding interpreting "%-" as an
            //   operator.
            // %c   print pop() like %c in printf
            // Example from screen terminfo:
            //   S0: "\u001b(%p1%c"
            // %d   print pop()
            // "Print (e.g., "%d") is a special case."
            // %s   print pop() like %s in printf
            if (this.read(/^%((?::-|[+# ]){1,4})?(\d+(?:\.\d+)?)?([doxXsc])/)) {
                if (this.config.tputOptions.printf || this.cap[1] || this.cap[2] || ~'oxX'.indexOf(this.cap[3])) {
                    this.echo('sprintf("'+ this.cap[0].replace(':-', '-') + '", stack.pop())');
                } else if (this.cap[3] === 'c') {
                    this.echo('(v = stack.pop(), isFinite(v) '
                        + '? String.fromCharCode(v || 0200) : "")');
                } else {
                    this.echo('stack.pop()');
                }
                continue;
            }

            // %p[1-9]
            //   push i'th parameter
            if (this.read(/^%p([1-9])/)) {
                //this.expr('(Number.isNaN(params[' + (Number(this.ch) - 1) + '])) && (function(){throw "ouch"})()')
                this.expr('(stack.push(v = params[' + (Number(this.ch) - 1) + ']), v)');
                continue;
            }

            // %P[a-z]
            //   set dynamic letiable [a-z] to pop()
            if (this.read(/^%P([a-z])/)) {
                this.expr('dyn.' + this.ch + ' = stack.pop()');
                continue;
            }

            // %g[a-z]
            //   get dynamic letiable [a-z] and push it
            if (this.read(/^%g([a-z])/)) {
                this.expr('(stack.push(dyn.' + this.ch + '), dyn.' + this.ch + ')');
                continue;
            }

            // %P[A-Z]
            //   set static letiable [a-z] to pop()
            if (this.read(/^%P([A-Z])/)) {
                this.expr('stat.' + this.ch + ' = stack.pop()');
                continue;
            }

            // %g[A-Z]
            //   get static letiable [a-z] and push it
            //   The  terms  "static"  and  "dynamic" are misleading.  Historically,
            //   these are simply two different sets of letiables, whose values are
            //   not reset between calls to tparm.  However, that fact is not
            //   documented in other implementations.  Relying on it will adversely
            //   impact portability to other implementations.
            if (this.read(/^%g([A-Z])/)) {
                this.expr('(stack.push(v = stat.' + this.ch + '), v)');
                continue;
            }

            // %'c' char constant c
            // NOTE: These are stored as c chars, exemplified by:
            // cursor_address: "\u001b=%p1%' '%+%c%p2%' '%+%c"
            if (this.read(/^%'(.)'/)) {
                this.expr('(stack.push(v = ' +this.ch.charCodeAt(0) + '), v)');
                continue;
            }

            // %{nn}
            //   integer constant nn
            if (this.read(/^%\{(\d+)\}/)) {
                this.expr('(stack.push(v = ' + this.ch + '), v)');
                continue;
            }

            // %l   push strlen(pop)
            if (this.read(/^%l/)) {
                this.expr('(stack.push(v = (stack.pop() || "").length || 0), v)');
                continue;
            }

            // %+ %- %* %/ %m
            //   arithmetic (%m is mod): push(pop() op pop())
            // %& %| %^
            //   bit operations (AND, OR and exclusive-OR): push(pop() op pop())
            // %= %> %<
            //   logical operations: push(pop() op pop())
            if (this.read(/^%([+\-*\/m&|\^=><])/)) {
                if (this.ch === '=') this.ch = '===';
                else if (this.ch === 'm') this.ch = '%';
                this.expr('(v = stack.pop(),'
                    + ' stack.push(v = (stack.pop() ' + this.ch + ' v) || 0),'
                    + ' v)');
                continue;
            }

            // %A, %O
            //   logical AND and OR operations (for conditionals)
            if (this.read(/^%([AO])/)) {
                // Are we supposed to store the result on the stack?
                this.expr('(stack.push(v = (stack.pop() '
                    + (this.ch === 'A' ? '&&' : '||')
                    + ' stack.pop())), v)');
                continue;
            }

            // %! %~
            //   unary operations (logical and bit complement): push(op pop())
            if (this.read(/^%([!~])/)) {
                this.expr('(stack.push(v = ' + this.ch + 'stack.pop()), v)');
                continue;
            }

            // %i   add 1 to first two parameters (for ANSI terminals)
            if (this.read(/^%i/)) {
                // Are these supposed to go on the stack in certain situations?
                // ncurses doesn't seem to put them on the stack, but xterm.user6
                // seems to assume they're on the stack for some reason. Could
                // just be a bad terminfo string.
                // user6: "\u001b[%i%d;%dR" - possibly a termcap-style string.
                // expr('(params[0] |= 0, params[1] |= 0, params[0]++, params[1]++)');
                this.expr('(params[0]++, params[1]++)');
                continue;
            }

            // %? expr %t thenpart %e elsepart %;
            //   This forms an if-then-else.  The %e elsepart is optional.  Usually
            //   the %? expr part pushes a value onto the stack, and %t pops it from
            //   the stack, testing if it is nonzero (true).  If it is zero (false),
            //   control passes to the %e (else) part.
            //   It is possible to form else-if's a la Algol 68:
            //     %? c1 %t b1 %e c2 %t b2 %e c3 %t b3 %e c4 %t b4 %e %;
            //   where ci are conditions, bi are bodies.
            if (this.read(/^%\?/)) {
                end = -1;
                this.stmt(';if (');
                continue;
            }

            if (this.read(/^%t/)) {
                end = -1;
                // Technically this is supposed to pop everything off the stack that was
                // pushed onto the stack after the if statement, see man terminfo.
                // Right now, we don't pop anything off. This could cause compat issues.
                // Perhaps implement a "pushed" counter from the time the if statement
                // is added, to the time the then statement is added, and pop off
                // the appropriate number of elements.
                // while (pushed--) expr('stack.pop()');
                this.stmt(') {');
                continue;
            }

            // Terminfo does elseif's like
            // this: %?[expr]%t...%e[expr]%t...%;
            if (this.read(/^%e/)) {
                let fi = this.val.indexOf('%?');
                let then = this.val.indexOf('%t');
                let els = this.val.indexOf('%e');
                end = this.val.indexOf('%;');
                if (end === -1) end = Infinity;
                if (then !== -1 && then < end
                    && (fi === -1 || then < fi)
                    && (els === -1 || then < els)) {
                    this.stmt('} else if (');
                } else {
                    this.stmt('} else {');
                }
                continue;
            }

            if (this.read(/^%;/)) {
                end = null;
                this.stmt('}');
                continue;
            }

            this.buff += this.val[0];
            this.val = this.val.substring(1);
        }

        // Clear the buffer of any remaining text.
        this.clear();

        // Some terminfos (I'm looking at you, atari-color), don't end an if
        // statement. It's assumed terminfo will automatically end it for
        // them, because they are a bunch of lazy bastards.
        if (end != null) {
            this.stmt('}');
        }

        // Add the footer.
        this.stmt(TerminfoCompiler.footer);

        // Optimize and cleanup generated code.
        v = this.code.slice(TerminfoCompiler.header.length, -TerminfoCompiler.footer.length);
        if (v.length) {
            if (v = /^out\.push\(("(?:[^"]|\\")+")\)$/.exec(v)) {
                this.code = 'return ' + v[1] + ';';
            } else {
                // Turn `(stack.push(v = params[0]), v),out.push(stack.pop())`
                // into `out.push(params[0])`.
                this.code = this.code.replace(
                    /\(stack\.push\(v = params\[(\d+)\]\), v\),out\.push\(stack\.pop\(\)\)/g,
                    'out.push(params[$1])');

                // Remove unnecessary letiable initializations.
                v = this.code.slice(TerminfoCompiler.header.length, -TerminfoCompiler.footer.length);
                if (!~v.indexOf('v = ')) this.code = this.code.replace('v, ', '');
                if (!~v.indexOf('dyn')) this.code = this.code.replace('dyn = {}, ', '');
                if (!~v.indexOf('stat')) this.code = this.code.replace('stat = {}, ', '');
                if (!~v.indexOf('stack')) this.code = this.code.replace('stack = [], ', '');

                // Turn `let out = [];out.push("foo"),` into `let out = ["foo"];`.
                this.code = this.code.replace(
                    /out = \[\];out\.push\(("(?:[^"]|\\")+")\),/,
                    'out = [$1];');
            }
        } else {
            this.code = 'return "";';
        }

        // Terminfos `wyse350-vb`, and `wy350-w`
        // seem to have a few broken strings.
        if (this.str === '\u001b%?') {
            this.code = 'return "\\x1b";';
        }

        if (this.debug) {
            v = this.code
                .replace(/\x1b/g, '\\x1b')
                .replace(/\r/g, '\\r')
                .replace(/\n/g, '\\n');
            process.stdout.write(v + '\n');
        }

        try {
            if (this.config.tputOptions.stringify && this.code.indexOf('return ') === 0) {
                return new Function('', this.code)();
            }
            return this.config.tputOptions.printf || ~this.code.indexOf('sprintf(')
                ? new Function('sprintf, params', this.code).bind(null, sprintf)
                : new Function('params', this.code);
        } catch (e) {
            console.log('');
            console.log('Error on %s:', tkey);
            console.log(JSON.stringify(this.str));
            console.log('');
            console.log(this.code.replace(/(,|;)/g, '$1\n'));
            e.stack = e.stack.replace(/\x1b/g, '\\x1b');
            throw e;
        }
    }
}