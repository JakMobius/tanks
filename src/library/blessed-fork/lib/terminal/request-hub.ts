import {TTYEvent} from "../widgets/screen";


interface DeviceAttributes {
    romCartridgeRegistrationNumber?: string;
    advancedVideo?: boolean;
    firmwareVersion?: string;
    term?: string;
    cols132?: boolean
    printer?: boolean
    selectiveErase?: boolean
    userDefinedKeys?: boolean
    nationalReplacementCharsets?: boolean
    technicalCharacters?: boolean
    userWindows?: boolean
    horizontalScrolling?: boolean
    ansiColor?: boolean
    ansiTextLocator?: boolean
}

interface DeviceAttributesEvent extends TTYEvent {
    deviceAttributes?: DeviceAttributes
}

interface DeviceStatusEvent extends TTYEvent{
    text?: string
    status?: string
    error?: string
}

interface CursorPositionStatusEvent extends DeviceStatusEvent {
    page?: number;
    x?: number;
    y?: number;
}

interface WindowPositionEvent extends DeviceStatusEvent {
    x?: number;
    y?: number;
}

interface WindowSizeEvent extends DeviceStatusEvent {
    width?: number;
    height?: number;
}

interface TextareaSizeEvent extends DeviceStatusEvent {
    width?: number;
    height?: number;
}

interface ScreenSizeEvent extends DeviceStatusEvent {
    width?: number;
    height?: number;
}

interface WindowStateEvent extends DeviceStatusEvent {
    isIconified?: boolean;
}

interface WindowIconLabelEvent extends DeviceStatusEvent {
    iconLabel?: string
}

interface WindowTitleEvent extends DeviceStatusEvent {
    windowTitle?: string
}

interface LocatorPositionEvent extends DeviceStatusEvent {
    page?: number;
    col?: number;
    row?: number;
    mask?: number;
}

interface TextParametersEvent extends DeviceStatusEvent {
    pt?: string;
    ps?: number;
}

export class RequestHub {
    static parseResponse(s: string) {
        let out: DeviceStatusEvent | null

        if((out = this.parseDeviceAttributes(s))) return out;
        if((out = this.parseDeviceStatusReport(s))) return out;
        if((out = this.parseReportCursorPosition(s))) return out;
        if((out = this.parseWindowManipulationEvent(s))) return out;
        if((out = this.parseLocatorPositionEvent(s))) return out;
        if((out = this.parseTextParametersEvent(s))) return out;

        return null
    }

    private static parseTextParametersEvent(s: string) {
        let parts = /^\x1b](\d+);([^\x07\x1b]+)(?:\x07|\x1b\\)/.exec(s)
        if(!parts) return null

        let out: TextParametersEvent = {}

        // OSC Ps ; Pt BEL
        // OSC Ps ; Pt ST
        // Set Text Parameters

        out.event = 'text-params';
        out.code = 'Set Text Parameters';
        out.ps = +s[1];
        out.pt = s[2];

        return out
    }

    private static parseLocatorPositionEvent(s: string) {

        let parts = /^\x1b\[(\d+(?:;\d+){4})&w/.exec(s)
        if(!parts) return null

        let out: LocatorPositionEvent = {}

        out.event = 'locator-position';
        out.code = 'DECRQLP';

        // CSI Ps ' |
        //   Request Locator Position (DECRQLP).
        //     -> CSI Pe ; Pb ; Pr ; Pc ; Pp &  w
        //   Parameters are [event;button;row;column;page].
        //   Valid values for the event:
        //     Pe = 0  -> locator unavailable - no other parameters sent.
        //     Pe = 1  -> request - xterm received a DECRQLP.
        //     Pe = 2  -> left button down.
        //     Pe = 3  -> left button up.
        //     Pe = 4  -> middle button down.
        //     Pe = 5  -> middle button up.
        //     Pe = 6  -> right button down.
        //     Pe = 7  -> right button up.
        //     Pe = 8  -> M4 button down.
        //     Pe = 9  -> M4 button up.
        //     Pe = 1 0  -> locator outside filter rectangle.
        //   ``button'' parameter is a bitmask indicating which buttons are
        //     pressed:
        //     Pb = 0  <- no buttons down.
        //     Pb & 1  <- right button down.
        //     Pb & 2  <- middle button down.
        //     Pb & 4  <- left button down.
        //     Pb & 8  <- M4 button down.
        //   ``row'' and ``column'' parameters are the coordinates of the
        //     locator position in the xterm window, encoded as ASCII deci-
        //     mal.
        //   The ``page'' parameter is not used by xterm, and will be omit-
        //   ted.
        // NOTE:
        // This is already implemented in the _bindMouse
        // method, but it might make more sense here.
        // The xterm mouse documentation says there is a
        // `<` prefix, the DECRQLP says there is no prefix.

        let data = parts[1].split(';').map(function(ch) {
            return +ch;
        });

        switch (data[0]) {
            case 0:
                out.status = 'locator-unavailable';
                break;
            case 1:
                out.status = 'request';
                break;
            case 2:
                out.status = 'left-button-down';
                break;
            case 3:
                out.status = 'left-button-up';
                break;
            case 4:
                out.status = 'middle-button-down';
                break;
            case 5:
                out.status = 'middle-button-up';
                break;
            case 6:
                out.status = 'right-button-down';
                break;
            case 7:
                out.status = 'right-button-up';
                break;
            case 8:
                out.status = 'm4-button-down';
                break;
            case 9:
                out.status = 'm4-button-up';
                break;
            case 10:
                out.status = 'locator-outside';
                break;
        }

        out.mask = data[1];
        out.row = data[2];
        out.col = data[3];
        out.page = data[4];

        return out
    }

    private static parseWindowManipulationEvent(s: string) {
        let parts = /^\x1b\[(\d+)(?:;(\d+);(\d+))?t/.exec(s)
        let out: DeviceStatusEvent = {}
        out.event = 'window-manipulation';
        out.code = '';

        if(parts) {

            // CSI Ps ; Ps ; Ps t
            //   Window manipulation (from dtterm, as well as extensions).
            //   These controls may be disabled using the allowWindowOps
            //   resource.  Valid values for the first (and any additional
            //   parameters) are:
            //     Ps = 1 1  -> Report xterm window state.  If the xterm window
            //     is open (non-iconified), it returns CSI 1 t .  If the xterm
            //     window is iconified, it returns CSI 2 t .
            //     Ps = 1 3  -> Report xterm window position.  Result is CSI 3
            //     ; x ; y t
            //     Ps = 1 4  -> Report xterm window in pixels.  Result is CSI
            //     4  ;  height ;  width t
            //     Ps = 1 8  -> Report the size of the text area in characters.
            //     Result is CSI  8  ;  height ;  width t
            //     Ps = 1 9  -> Report the size of the screen in characters.
            //     Result is CSI  9  ;  height ;  width t

            if ((parts[1] === '1' || parts[1] === '2') && !parts[2]) return this.parseWindowStateEvent(parts, out)
            if (parts[1] === '3' && parts[2]) return this.parseWindowPositionEvent(parts, out)
            if (parts[1] === '4' && parts[2]) return this.parseWindowSizeEvent(parts, out)
            if (parts[1] === '8' && parts[2]) return this.parseTextareaSizeEvent(parts, out)
            if (parts[1] === '9' && parts[2]) return this.parseScreenSizeEvent(parts, out)
        }

        // rxvt-unicode does not support window manipulation
        //   Result Normal: OSC l/L 0xEF 0xBF 0xBD
        //   Result ASCII: OSC l/L 0x1c (file separator)
        //   Result UTF8->ASCII: OSC l/L 0xFD
        // Test with:
        //   echo -ne '\ePtmux;\e\e[>3t\e\\'
        //   sleep 2 && echo -ne '\ePtmux;\e\e[21t\e\\' & cat -v
        //   -
        //   echo -ne '\e[>3t'
        //   sleep 2 && echo -ne '\e[21t' & cat -v

        parts = /^\x1b]([lL])([^\x07\x1b]*)$/.exec(s)
        if (parts) {
            parts[2] = 'rxvt';
            s = '\x1b]' + parts[1] + parts[2] + '\x1b\\';
        }

        // CSI Ps ; Ps ; Ps t
        //   Window manipulation (from dtterm, as well as extensions).
        //   These controls may be disabled using the allowWindowOps
        //   resource.  Valid values for the first (and any additional
        //   parameters) are:
        //     Ps = 2 0  -> Report xterm window's icon label.  Result is
        //     OSC  L  label ST
        //     Ps = 2 1  -> Report xterm window's title.  Result is OSC  l
        //     label ST
        parts = /^\x1b]([lL])([^\x07\x1b]*)(?:\x07|\x1b\\)/.exec(s)

        if (parts[1] === 'L') return this.parseWindowIconLabelEvent(parts, out)
        if (parts[1] === 'l') return this.parseWindowTitleEvent(parts, out)

        return this.errorEvent(parts, out)
    }

    private static parseWindowTitleEvent(parts: string[], out: WindowTitleEvent) {
        out.type = 'window-title';
        out.windowTitle = parts[2];

        return out
    }

    private static parseWindowIconLabelEvent(parts: string[], out: WindowIconLabelEvent) {
        out.type = 'window-icon-label';
        out.iconLabel = parts[2];

        return out
    }

    private static parseWindowStateEvent(parts: string[], out: WindowStateEvent) {
        out.type = 'window-state';
        out.isIconified = parts[1] !== '1'

        return out
    }

    private static parseScreenSizeEvent(parts: string[], out: ScreenSizeEvent) {
        out.type = 'screen-size';

        out.width = +parts[3]
        out.height = +parts[2]

        return out
    }

    private static parseWindowSizeEvent(parts: string[], out: WindowSizeEvent) {
        out.type = 'window-size-pixels';

        out.width = +parts[3]
        out.height = +parts[2]

        return out
    }

    private static parseWindowPositionEvent(parts: string[], out: WindowPositionEvent) {
        out.type = 'window-position';

        out.x = +parts[2]
        out.y = +parts[3]

        return out
    }

    private static parseTextareaSizeEvent(parts: string[], out: TextareaSizeEvent) {
        out.type = 'textarea-size';

        out.width = +parts[3]
        out.height = +parts[2]

        return out
    }

    private static parseReportCursorPosition(s: string) {

        let parts = /^\x1b\[(\?)?(\d+);(\d+)R/.exec(s)
        if (!parts) return null

        // CSI Ps n  Device Status Report (DSR).
        //     Ps = 6  -> Report Cursor Position (CPR) [row;column].
        //   Result is
        //   CSI r ; c R
        // CSI ? Ps n
        //   Device Status Report (DSR, DEC-specific).
        //     Ps = 6  -> Report Cursor Position (CPR) [row;column] as CSI
        //     ? r ; c R (assumes page is zero).

        let out: CursorPositionStatusEvent = {}

        out.event = 'device-status';
        out.code = 'DSR';
        out.type = 'cursor-status';

        out.x = +parts[3]
        out.y = +parts[2]
        out.page = parts[1] ? 0 : undefined

        return out
    }

    private static parseDeviceStatusReport(s: string) {

        let parts = /^\x1b\[(\?)?(\d+)(?:;(\d+);(\d+);(\d+))?n/.exec(s)
        if(!parts) return null

        let out: DeviceStatusEvent = {}

        // CSI Ps n  Device Status Report (DSR).
        //     Ps = 5  -> Status Report.  Result (``OK'') is
        //   CSI 0 n
        // CSI ? Ps n
        //   Device Status Report (DSR, DEC-specific).
        //     Ps = 1 5  -> Report Printer status as CSI ? 1 0  n  (ready).
        //     or CSI ? 1 1  n  (not ready).
        //     Ps = 2 5  -> Report UDK status as CSI ? 2 0  n  (unlocked)
        //     or CSI ? 2 1  n  (locked).
        //     Ps = 2 6  -> Report Keyboard status as
        //   CSI ? 2 7  ;  1  ;  0  ;  0  n  (North American).
        //   The last two parameters apply to VT400 & up, and denote key-
        //   board ready and LK01 respectively.
        //     Ps = 5 3  -> Report Locator status as
        //   CSI ? 5 3  n  Locator available, if compiled-in, or
        //   CSI ? 5 0  n  No Locator, if not.

        out.event = 'device-status';
        out.code = 'DSR';

        if (!parts[1] && parts[2] === '0' && !parts[3]) {
            out.type = 'device-status';
            out.status = 'OK';

            return out
        }

        if (parts[1] && (parts[2] === '10' || parts[2] === '11') && !parts[3]) {
            out.type = 'printer-status';
            if (parts[2] === '10') {
                out.status = 'ready';
            } else {
                out.status = 'not ready';
            }

            return out
        }

        if (parts[1] && (parts[2] === '20' || parts[2] === '21') && !parts[3]) {
            out.type = 'udk-status';
            if (parts[2] === '20') {
                out.status = 'unlocked';
            } else {
                out.status = 'locked';
            }

            return out
        }

        if (parts[1]
            && parts[2] === '27'
            && parts[3] === '1'
            && parts[4] === '0'
            && parts[5] === '0') {
            out.type = 'keyboard-status';
            out.status = 'OK';

            return out
        }

        if (parts[1] && (parts[2] === '53' || parts[2] === '50') && !parts[3]) {
            out.type = 'locator-status';
            if (parts[2] === '53') {
                out.status = 'available';
            } else {
                out.status = 'unavailable';
            }

            return out
        }

        return this.errorEvent(parts, out)
    }

    private static parseDeviceAttributes(s: string) {
        let input_parts = /^\x1b\[([?>])(\d*(?:;\d*)*)c/.exec(s)
        if(!input_parts) return null
        // CSI P s c
        // Send Device Attributes (Primary DA).
        // CSI > P s c
        // Send Device Attributes (Secondary DA).

        let parts = input_parts[2].split(';').map(function(ch: string): string | number {
            return +ch || 0;
        });

        let out: DeviceAttributesEvent = {}
        let deviceAttributes: DeviceAttributes = {}

        out.event = 'device-attributes';
        out.code = 'DA';

        if (parts[1] === '?') {
            out.type = 'primary-attribute';
            // VT100-style params:
            if (parts[0] === 1 && parts[2] === 2) {
                deviceAttributes.term = 'vt100';
                deviceAttributes.advancedVideo = true;
            } else if (parts[0] === 1 && parts[2] === 0) {
                deviceAttributes.term = 'vt101';
            } else if (parts[0] === 6) {
                deviceAttributes.term = 'vt102';
            } else if (parts[0] === 60
                && parts[1] === 1 && parts[2] === 2
                && parts[3] === 6 && parts[4] === 8
                && parts[5] === 9 && parts[6] === 15) {
                deviceAttributes.term = 'vt220';
            } else {
                // VT200-style params:
                parts.forEach(function(attr) {
                    switch (attr) {
                        case 1:
                            deviceAttributes.cols132 = true;
                            break;
                        case 2:
                            deviceAttributes.printer = true;
                            break;
                        case 6:
                            deviceAttributes.selectiveErase = true;
                            break;
                        case 8:
                            deviceAttributes.userDefinedKeys = true;
                            break;
                        case 9:
                            deviceAttributes.nationalReplacementCharsets = true;
                            break;
                        case 15:
                            deviceAttributes.technicalCharacters = true;
                            break;
                        case 18:
                            deviceAttributes.userWindows = true;
                            break;
                        case 21:
                            deviceAttributes.horizontalScrolling = true;
                            break;
                        case 22:
                            deviceAttributes.ansiColor = true;
                            break;
                        case 29:
                            deviceAttributes.ansiTextLocator = true;
                            break;
                    }
                });
            }
        } else {
            out.type = 'secondary-attribute';
            switch (parts[0]) {
                case 0:
                    deviceAttributes.term = 'vt100';
                    break;
                case 1:
                    deviceAttributes.term = 'vt220';
                    break;
                case 2:
                    deviceAttributes.term = 'vt240';
                    break;
                case 18:
                    deviceAttributes.term = 'vt330';
                    break;
                case 19:
                    deviceAttributes.term = 'vt340';
                    break;
                case 24:
                    deviceAttributes.term = 'vt320';
                    break;
                case 41:
                    deviceAttributes.term = 'vt420';
                    break;
                case 61:
                    deviceAttributes.term = 'vt510';
                    break;
                case 64:
                    deviceAttributes.term = 'vt520';
                    break;
                case 65:
                    deviceAttributes.term = 'vt525';
                    break;
            }
            deviceAttributes.firmwareVersion = String(parts[1]);
            deviceAttributes.romCartridgeRegistrationNumber = String(parts[2]);
        }

        // LEGACY
        out.deviceAttributes = deviceAttributes;

        return out
    }

    private static errorEvent(parts: string[], out: DeviceStatusEvent) {
        out.type = 'error';
        out.error = 'Unhandled: ' + JSON.stringify(parts);

        return out
    }
}