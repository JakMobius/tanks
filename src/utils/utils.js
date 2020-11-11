
class Utils {
    static checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {

        let denominator, a, b, numerator1, numerator2;
        const result = {
            k: null,
            onLine1: false,
            onLine2: false
        };
        denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
        if (denominator === 0) {
            return result;
        }
        a = line1StartY - line2StartY;
        b = line1StartX - line2StartX;
        numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
        numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
        a = numerator1 / denominator;
        b = numerator2 / denominator;

        result.k = a

        if (a > 0 && a < 1) {
            result.onLine1 = true;
        }
        if (b > 0 && b < 1) {
            result.onLine2 = true;
        }

        return result;
    }

    static trimFileExtension(name) {
        let parts = name.split(".")
        if(parts.length > 1) parts.pop()
        return parts.join(".")
    }

    static dist2(vx, vy, wx, wy) {
        return (vx - wx) ** 2 + (vy - wy) ** 2
    }

    static distToSegmentSquared(px, py, vx, vy, wx, wy) {
        const l2 = this.dist2(vx, vy, wx, wy);
        if (l2 === 0) return this.dist2(px, py, vx, vy);
        let t = ((px - vx) * (wx - vx) + (py - vy) * (wy - vy)) / l2;
        t = Math.max(0, Math.min(1, t));
        return this.dist2(px, py, vx + t * (wx - vx), vy + t * (wy - vy));
    }

    static distToSegment(px, py, vx, vy, wx, wy) {
        return Math.sqrt(this.distToSegmentSquared(px, py, vx, vy, wx, wy));
    }

    static random(min, max) {
        return Math.random() * (max - min) + min
    }
}

module.exports = Utils