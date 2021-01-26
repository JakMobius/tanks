/**
 * tput.js - parse and compile terminfo caps to javascript.
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

// Resources:
//   $ man term
//   $ man terminfo
//   http://invisible-island.net/ncurses/man/term.5.html
//   https://en.wikipedia.org/wiki/Terminfo

// Todo:
// - xterm's XT (set-title capability?) value should
//   be true (at least tmux thinks it should).
//   It's not parsed as true. Investigate.
// - Possibly switch to other method of finding the
//   extended data string table: i += h.symOffsetCount * 2;

/**
 * Modules
 */

import path from 'path';
import fs from 'fs';
import {map} from '../alias'
import TerminfoParser from "./terminfo";

export interface TermACS {
    acsc?: { [ key: string ]: string },
    acscr?: { [ key: string ]: string }
}

export interface TerminzfoFeatures {
    unicode: boolean,
    brokenACS: boolean,
    PCRomSet: boolean,
    magicCookie: boolean,
    setbuf: boolean,
    acsc: { [ key: string ]: string },
    acscr: { [ key: string ]: string }
}

export interface Terminfo {
    methods?: { [key: string]: any };
    all?: { [key: string]: any };
    file: string;
    desc: string;
    names: string[];
    name: string;
    dir: string;
    bools: { [key: string]: boolean | undefined },
    strings: { [key: string]: any },
    numbers: { [key: string]: number | undefined },
    header: TerminfoHeader,
    features?: TerminzfoFeatures
}

export interface TerminfoHeader {
    dataSize: number,
    headerSize: number,
    magicNumber?: number,
    namesSize?: number,
    boolCount: number,
    numCount: number,
    strCount: number,
    strTableSize: number,
    lastStrTableOffset?: number
    total: number
    extended?: TerminfoHeader
}

export interface TputConfig {
    stringify?: boolean;
    terminal?: string;
    debug?: boolean
    extended?: boolean

    terminfoPrefix?: string
    terminfoFile?: string
    printf?: boolean
    forceUnicode?: boolean
}

type Prefix = string | Prefix[]

class Tput {
    public readonly options: TputConfig;
    private readonly debug: boolean
    private readonly extended: boolean

    private readonly terminfoPrefix: string
    private readonly terminfoFile: string
    private readonly printf: boolean
    private readonly terminal: string;

    public error: any
    public terminfo: Terminfo

    static getFallbackTerminal(): string {
        if(process.env.TERM) return process.env.TERM
        if(process.platform === 'win32') return 'windows-ansi'
        return 'xterm'
    }

    private static normalizeOptions(options?: TputConfig | string): TputConfig {
        if (typeof options === 'string') {
            return { terminal: options };
        }
        return options || {}
    }


    constructor(options: TputConfig | string) {
        options = Tput.normalizeOptions(options)

        this.options = options;
        this.terminal = options.terminal || Tput.getFallbackTerminal()

        this.terminal = this.terminal.toLowerCase();

        this.debug = options.debug;
        this.extended = options.extended;
        this.printf = options.printf;
        this.error = null;

        this.terminfoPrefix = options.terminfoPrefix;
        this.terminfoFile = options.terminfoFile;

        if (options.terminal) {
            this.setup();
        }
    }

    setup() {
        this.error = null;

        try {
            this.terminfo = this.compileTerminfo()
        } catch (ignored) {
            this.error = new Error('Terminfo parse error.');
            this._useInternalInfo(this.terminal);
        }
    }

    term(is: string) {
        return this.terminal.indexOf(is) === 0;
    }

    /**
     * Fallback
     */

    _useInternalInfo(name: string) {
        name = path.basename(name);
        this.terminfo = this.compileTerminfo(__dirname + 'resources/terminal/usr/' + name);
    }

    readTerminfo(term: string) {

        term = term || this.terminal;

        let file = path.normalize(this._prefix(term));
        let data = fs.readFileSync(file);
        return TerminfoParser.parseTerminfo(data, file, this.options.extended);
    }

    _prefix(term?: string) {
        // If we have a terminfoFile, or our
        // term looks like a filename, use it.
        if (term) {
            if (~term.indexOf(path.sep)) {
                return term;
            }
            if (this.terminfoFile) {
                return this.terminfoFile;
            }
        }

        let paths = Tput.ipaths.slice()
            , file;

        if (this.terminfoPrefix) {
            paths.unshift(this.terminfoPrefix);
        }

        // Try exact matches.
        file = this._tprefix(paths, term);
        if (file) return file;

        // Try similar matches.
        file = this._tprefix(paths, term, true);
        if (file) return file;

        // Not found.
        throw new Error('Terminfo directory not found.');
    }

    _tprefix(prefix: Prefix, term: string, soft?: boolean): string | null {
        if (!prefix) return null;

        let list;

        if (Array.isArray(prefix)) {
            for (let i = 0; i < prefix.length; i++) {
                let file = this._tprefix(prefix[i], term, soft);
                if (file) return file;
            }
            return null;
        }

        let find = function(word: string): string | null {
            let file = path.resolve(prefix, word[0]);
            try {
                fs.statSync(file);
                return file;
            } catch (e) {}

            let ch = word[0].charCodeAt(0).toString(16);
            if (ch.length < 2) ch = '0' + ch;

            file = path.resolve(prefix, ch);
            try {
                fs.statSync(file);
                return file;
            } catch (e) {
                return null
            }
        };

        if (!term) {
            // Make sure the directory's sub-directories
            // are all one-letter, or hex digits.
            // return find('x') ? prefix : null;
            try {
                let dir = fs.readdirSync(prefix).filter(function(file) {
                    return file.length !== 1 && !/^[0-9a-fA-F]{2}$/.test(file);
                });
                if (!dir.length) {
                    return prefix;
                }
            } catch (e) {}
            return null;
        }

        term = path.basename(term);
        let dir = find(term);
        if (!dir) return null;

        if (soft) {
            try {
                list = fs.readdirSync(dir);
            } catch (e) {
                return null;
            }

            let sfile: string = null
            let sdiff: number = null

            list.forEach(function(file) {
                if (file.indexOf(term) === 0) {
                    let diff = file.length - term.length;
                    if (!sfile || diff < sdiff) {
                        sdiff = diff;
                        sfile = file;
                    }
                }
            });

            return sfile && (soft || sdiff === 0)
                ? path.resolve(dir, sfile)
                : null;
        }

        let file = path.resolve(dir, term);
        try {
            fs.statSync(file);
            return file;
        } catch (e) {
            return null
        }
    }

    compileTerminfo(term?: string) {
        return TerminfoParser.compile(this.readTerminfo(term), this.options)
    }

    has(name: string) {
        name = map[name];

        let val = this.terminfo.all[name];

        if (!name) return false;

        if (typeof val === 'number') {
            return val !== -1;
        }

        return !!val;
    }

    static ipaths = [
        process.env.TERMINFO || '',
        (process.env.TERMINFO_DIRS || '').split(':'),
        (process.env.HOME || '') + '/.terminfo',
        '/usr/share/terminfo',
        '/usr/share/lib/terminfo',
        '/usr/lib/terminfo',
        '/usr/local/share/terminfo',
        '/usr/local/share/lib/terminfo',
        '/usr/local/lib/terminfo',
        '/usr/local/ncurses/lib/terminfo',
        '/lib/terminfo'
    ];
}

export default Tput;