
export function passwordScore(pass: string) {
    let score = 0;

    let letters = new Map();
    for (let i = 0; i < pass.length; i++) {
        letters.set(pass[i], (letters.get(pass[i]) || 0) + 1);
        score += 5.0 / letters.get(pass[i]);
    }

    let variations = [
        /\d/.test(pass), // digits
        /[a-z]/.test(pass), // lower
        /[A-Z]/.test(pass), // upper
        /\W/.test(pass), // nonWords
    ]

    let variationCount = 0;

    for (let check of variations) {
        variationCount += check ? 1 : 0;
    }

    score += (variationCount - 1) * 10;

    return score
}

export function passwordIsValid(pass: string) {
    return passwordScore(pass) >= passwordScoreThreshold
}

export const passwordScoreThreshold = 35.0