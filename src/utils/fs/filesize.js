
const metricUnits = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
const binaryUnits = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param format True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param precision Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize(bytes, format = true, precision=1) {
    const thresh = format ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = format ? metricUnits : binaryUnits;
    let u = -1;
    const r = 10 ** precision;

    do {
        bytes /= thresh;
        u++;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(precision) + ' ' + units[u];
}

module.exports = humanFileSize