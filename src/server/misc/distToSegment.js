

function dist2(vx, vy, wx, wy) {
    return (vx - wx) ** 2 + (vy - wy) ** 2
}

function distToSegmentSquared(px, py, vx, vy, wx, wy) {
    const l2 = dist2(vx, vy, wx, wy);
    if (l2 === 0) return dist2(px, py, vx, vy);
    let t = ((px - vx) * (wx - vx) + (py - vy) * (wy - vy)) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist2(px, py, vx + t * (wx - vx), vy + t * (wy - vy));
}

function distToSegment(px, py, vx, vy, wx, wy) {
    return Math.sqrt(distToSegmentSquared(px, py, vx, vy, wx, wy));
}

module.exports = distToSegment