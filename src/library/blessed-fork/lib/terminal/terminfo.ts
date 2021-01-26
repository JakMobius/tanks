import * as characters from "./characters";
import cp from "child_process";
import {TermACS, Terminfo, TerminfoHeader, TputConfig} from "./tput";
import * as capabilities from "./capabilities";
import {aliases} from "../alias";
import fs from "fs";
import sprintf from "./sprintf";
import TerminfoCompiler from "./terminfo-compiler";
import path from "path";
import assert from "assert";

export default class TerminfoParser {

    /**
     * Terminfo Parser
     * All shorts are little-endian
     */
    static parseTerminfo(data: Buffer, file: string, extended?: boolean): Terminfo {
        let info: Partial<Terminfo> = {}

        let i = 0

        let header: TerminfoHeader = {
            dataSize: data.length,
            headerSize: 12,
            magicNumber: (data[1] << 8) | data[0],
            namesSize: (data[3] << 8) | data[2],
            boolCount: (data[5] << 8) | data[4],
            numCount: (data[7] << 8) | data[6],
            strCount: (data[9] << 8) | data[8],
            strTableSize: (data[11] << 8) | data[10],
            total: 0
        };

        info.header = header

        header.total = header.headerSize
            + header.namesSize
            + header.boolCount
            + header.numCount * 2
            + header.strCount * 2
            + header.strTableSize;

        i += header.headerSize;

        // Names Section
        let names = data.toString('ascii', i, i + header.namesSize - 1)
        let parts = names.split('|')
        let name = parts[0]
        let desc = parts.pop();

        info.name = name;
        info.names = parts;
        info.desc = desc;

        info.dir = path.resolve(file, '..', '..');
        info.file = file;

        i += header.namesSize - 1;

        // Names is nul-terminated.
        assert.strictEqual(data[i], 0);
        i++;

        // Booleans Section
        // One byte for each flag
        // Same order as <term.h>
        info.bools = {};
        let l = i + header.boolCount;
        let o = 0;
        let v
        for (; i < l; i++) {
            v = capabilities.bools[o++];
            info.bools[v] = data[i] === 1;
        }

        // Null byte in between to make sure numbers begin on an even byte.
        if (i % 2) {
            assert.equal(data[i], 0);
            i++;
        }

        // Numbers Section
        info.numbers = {};
        l = i + header.numCount * 2;
        o = 0;
        for (; i < l; i += 2) {
            v = capabilities.numbers[o++];
            if (data[i + 1] === 0xff && data[i] === 0xff) {
                info.numbers[v] = -1;
            } else {
                info.numbers[v] = (data[i + 1] << 8) | data[i];
            }
        }

        // Strings Section
        info.strings = {};
        l = i + header.strCount * 2;
        o = 0;
        for (; i < l; i += 2) {
            v = capabilities.strings[o++];
            if (data[i + 1] === 0xff && data[i] === 0xff) {
                info.strings[v] = -1;
            } else {
                info.strings[v] = (data[i + 1] << 8) | data[i];
            }
        }

        // String Table
        Object.keys(info.strings).forEach(function(key) {
            if (info.strings[key] === -1) {
                delete info.strings[key];
                return;
            }

            // Workaround: fix an odd bug in the screen-256color terminfo where it tries
            // to set -1, but it appears to have {0xfe, 0xff} instead of {0xff, 0xff}.
            // TODO: Possibly handle errors gracefully below, as well as in the
            // extended info. Also possibly do: `if (info.strings[key] >= data.length)`.
            if (info.strings[key] === 65534) {
                delete info.strings[key];
                return;
            }

            let s = i + info.strings[key]
                , j = s;

            while (data[j]) j++;

            assert(j < data.length);

            info.strings[key] = data.toString('ascii', s, j);
        });

        // Extended Header
        if (extended !== false) {
            i--;
            i += header.strTableSize;
            if (i % 2) {
                assert.equal(data[i], 0);
                i++;
            }
            l = data.length;
            if (i < l - 1) {
                try {
                    this.parseExtended(data.slice(i), info as Terminfo);
                } catch (e) {
                    return info as Terminfo;
                }
            }
        }

        return info as Terminfo;
    }

// How lastStrTableOffset works:
//   data.length - h.lastStrTableOffset === 248
//     (sym-offset end, string-table start)
//   364 + 316 === 680 (lastStrTableOffset)
// How strTableSize works:
//   h.strCount + [symOffsetCount] === h.strTableSize
//   57 + 60 === 117 (strTableSize)
//   symOffsetCount doesn't actually exist in the header. it's just implied.
// Getting the number of sym offsets:
//   h.symOffsetCount = h.strTableSize - h.strCount;
//   h.symOffsetSize = (h.strTableSize - h.strCount) * 2;
    static parseExtended(data: Buffer, old: Terminfo) {
        let l, i = 0;

        let header: TerminfoHeader = {
            dataSize: data.length,
            headerSize: 10,
            boolCount: (data[i + 1] << 8) | data[i + 0],
            numCount: (data[i + 3] << 8) | data[i + 2],
            strCount: (data[i + 5] << 8) | data[i + 4],
            strTableSize: (data[i + 7] << 8) | data[i + 6],
            lastStrTableOffset: (data[i + 9] << 8) | data[i + 8],
            total: 0
        };

        // h.symOffsetCount = h.strTableSize - h.strCount;

        header.total = header.headerSize
            + header.boolCount
            + header.numCount * 2
            + header.strCount * 2
            + header.strTableSize;

        old.header.extended = header

        i += header.headerSize;

        // Booleans Section
        // One byte for each flag
        let _bools = [];
        l = i + header.boolCount;
        for (; i < l; i++) {
            _bools.push(data[i] === 1);
        }

        // Null byte in between to make sure numbers begin on an even byte.
        if (i % 2) {
            assert.equal(data[i], 0);
            i++;
        }

        // Numbers Section
        let _numbers = [];
        l = i + header.numCount * 2;
        for (; i < l; i += 2) {
            if (data[i + 1] === 0xff && data[i] === 0xff) {
                _numbers.push(-1);
            } else {
                _numbers.push((data[i + 1] << 8) | data[i]);
            }
        }

        // Strings Section
        let _strings = [];
        l = i + header.strCount * 2;
        for (; i < l; i += 2) {
            if (data[i + 1] === 0xff && data[i] === 0xff) {
                _strings.push(-1);
            } else {
                _strings.push((data[i + 1] << 8) | data[i]);
            }
        }

        // Pass over the sym offsets and get to the string table.
        i = data.length - header.lastStrTableOffset;
        // Might be better to do this instead if the file has trailing bytes:
        // i += h.symOffsetCount * 2;

        // String Table
        let high = 0;
        _strings.forEach(function(offset, k) {
            if (offset === -1) {
                _strings[k] = '';
                return;
            }

            let s = i + offset
                , j = s;

            while (data[j]) j++;

            assert(j < data.length);

            // Find out where the string table ends by
            // getting the highest string length.
            if (high < j - i) {
                high = j - i;
            }

            _strings[k] = data.toString('ascii', s, j);
        });

        // Symbol Table
        // Add one to the highest string length because we didn't count \0.
        i += high + 1;
        l = data.length;

        let sym: string[] = [];

        for (; i < l; i++) {
            let j = i;
            while (data[j]) j++;
            sym.push(data.toString('ascii', i, j));
            i = j;
        }

        // Identify by name
        let j = 0;

        _bools.forEach(function(bool) {
            old.bools[sym[j++]] = bool;
        });

        _numbers.forEach(function(number) {
            old.numbers[sym[j++]] = number;
        });

        _strings.forEach(function(string) {
            old.strings[sym[j++]] = string;
        });

        // Should be the very last bit of data.
        assert.strictEqual(i, data.length);
    }

    /**
     * Detect Features / Quirks
     */
    static detectFeatures(info: Terminfo) {
        let data = this.parseACS(info);
        info.features = {
            unicode: this.detectUnicode(),
            brokenACS: this.detectBrokenACS(info),
            PCRomSet: this.detectPCRomSet(info),
            magicCookie: this.detectMagicCookie(),
            setbuf: this.detectSetbuf(),
            acsc: data.acsc,
            acscr: data.acscr
        };
        return info.features;
    }

    static detectUnicode(force?: boolean | null) {
        if (process.env.NCURSES_FORCE_UNICODE != null) {
            return !!+process.env.NCURSES_FORCE_UNICODE;
        }

        if (force != null) {
            return force;
        }

        let LANG = process.env.LANG
            + ':' + process.env.LANGUAGE
            + ':' + process.env.LC_ALL
            + ':' + process.env.LC_CTYPE;

        return /utf-?8/i.test(LANG) || (this.GetConsoleCP() === 65001);
    }

// For some reason TERM=linux has smacs/rmacs, but it maps to `^[[11m`
// and it does not switch to the DEC SCLD character set. What the hell?
// xterm: \x1b(0, screen: \x0e, linux: \x1b[11m (doesn't work)
// `man console_codes` says:
// 11  select null mapping, set display control flag, reset tog‐
//     gle meta flag (ECMA-48 says "first alternate font").
// See ncurses:
// ~/ncurses/ncurses/base/lib_set_term.c
// ~/ncurses/ncurses/tinfo/lib_acs.c
// ~/ncurses/ncurses/tinfo/tinfo_driver.c
// ~/ncurses/ncurses/tinfo/lib_setup.c
    static detectBrokenACS(info: Terminfo) {
        // ncurses-compatible env letiable.
        if (process.env.NCURSES_NO_UTF8_ACS != null) {
            return !!+process.env.NCURSES_NO_UTF8_ACS;
        }

        // If the terminal supports unicode, we don't need ACS.
        if (info.numbers.U8 >= 0) {
            return !!info.numbers.U8;
        }

        // The linux console is just broken for some reason.
        // Apparently the Linux console does not support ACS,
        // but it does support the PC ROM character set.
        if (info.name === 'linux') {
            return true;
        }

        // PC alternate charset
        // if (acsc.indexOf('+\x10,\x11-\x18.\x190') === 0) {
        return this.detectPCRomSet(info);
    }

// If enter_pc_charset is the same as enter_alt_charset,
// the terminal does not support SCLD as ACS.
// See: ~/ncurses/ncurses/tinfo/lib_acs.c
    static detectPCRomSet(info: Terminfo) {
        let s = info.strings;
        return s.enter_pc_charset_mode && s.enter_alt_charset_mode
            && s.enter_pc_charset_mode === s.enter_alt_charset_mode
            && s.exit_pc_charset_mode === s.exit_alt_charset_mode;

    }

    static detectMagicCookie() {
        return process.env.NCURSES_NO_MAGIC_COOKIE == null;
    }

    static detectSetbuf() {
        return process.env.NCURSES_NO_SETBUF == null;
    }

    static parseACS(info: Terminfo): TermACS {
        let data: TermACS = {};

        data.acsc = {};
        data.acscr = {};

        // Possibly just return an empty object, as done here, instead of
        // specifically saying ACS is "broken" above. This would be more
        // accurate to ncurses logic. But it doesn't really matter.
        if (this.detectPCRomSet(info)) {
            return data;
        }

        // See: ~/ncurses/ncurses/tinfo/lib_acs.c: L208
        Object.keys(characters.acsc).forEach(function(ch) {
            let acs_chars = info.strings.acs_chars || ''
                , i = acs_chars.indexOf(ch)
                , next = acs_chars[i + 1];

            if (!next || i === -1 || !characters.acsc[next]) {
                return;
            }

            data.acsc[ch] = characters.acsc[next];
            data.acscr[characters.acsc[next]] = ch;
        });

        return data;
    }

    static GetConsoleCP() {
        let ccp;

        if (process.platform !== 'win32') {
            return -1;
        }

        // Allow unicode on all windows consoles for now:
        if (+process.env.NCURSES_NO_WINDOWS_UNICODE !== 1) {
            return 65001;
        }

        // cp.execSync('chcp 65001', { stdio: 'ignore', timeout: 1500 });

        try {
            // Produces something like: 'Active code page: 437\n\n'
            ccp = cp.execFileSync(process.env.WINDIR + '\\system32\\chcp.com', [], {
                stdio: ['ignore', 'pipe', 'ignore'],
                encoding: 'ascii',
                timeout: 1500
            });
            // ccp = cp.execSync('chcp', {
            //   stdio: ['ignore', 'pipe', 'ignore'],
            //   encoding: 'ascii',
            //   timeout: 1500
            // });
        } catch (e) {}

        ccp = /\d+/.exec(ccp);

        if (!ccp) {
            return -1;
        }

        ccp = +ccp[0];

        return ccp;
    }

    /**
     * Compiler - terminfo cap->javascript
     */

    static compile(info: Terminfo, options: TputConfig) {
        let self = this;

        if (!info) {
            throw new Error('Terminal not found.');
        }

        this.detectFeatures(info);

        info.all = {};
        info.methods = {};

        Object.keys(info.bools).forEach(function(key) {
            info.all[key] = info.bools[key];
            info.methods[key] = self._compile(info, key, info.all[key], options);
        });

        Object.keys(info.strings).forEach(function(key) {
            info.all[key] = info.strings[key];
            info.methods[key] = self._compile(info, key, info.all[key], options);
        });

        Object.keys(info.numbers).forEach(function(key) {
            info.all[key] = info.numbers[key];
            info.methods[key] = self._compile(info, key, info.all[key], options);
        });

        for (const key of capabilities.bools) {
            if (info.methods[key] == null) info.methods[key] = false;
        }

        for (const key of capabilities.numbers) {
            if (info.methods[key] == null) info.methods[key] = -1;
        }

        for (const key of capabilities.strings) {
            if (!info.methods[key]) info.methods[key] = TerminfoCompiler.noop;
        }

        Object.keys(info.methods).forEach(function(key) {
            if (!aliases[key]) return;
            aliases[key].forEach(function(alias) {
                info.methods[alias] = info.methods[key];
            });
        });

        return info;
    }

    static _compile(info: Terminfo, key: string, str: any, options: TputConfig): any {
        let func = TerminfoCompiler.compile({
            info: info,
            key: key,
            str: str,
            tputOptions: options
        })

        return function() {
            return func.call(null, arguments);
        }
    }
}