
export default function hashToString(hash: number) {
    let result = "";

    for(let i = 7; i >= 0; i--) {
        result += Math.abs(hash % 16).toString(16);
        hash >>= 4;
        if((i % 4 == 0) && i > 0) result += '-';
    }

    return result;
}