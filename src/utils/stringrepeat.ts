
export default (str, num) => {
    if (num < 1) return '';
    let result = '';
    while (num > 0) {
        if ((num & 1) === 1) result += str;
        num >>= 1;
        str += str;
    }
    return result;
};