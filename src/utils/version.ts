
export default class Version {
    major = 0;
    minor = 0;
    patch = 0;

    constructor(str: string) {
        const parts = str.split(".");
        this.major = parseInt(parts[0]);
        if(parts.length > 1) this.minor = parseInt(parts[1]);
        if(parts.length > 2) this.patch = parseInt(parts[2]);
    }

    toString() {
        return `${this.major}.${this.minor}.${this.patch}`;
    }

    compare(other: Version) {
        if(this.major > other.major) return 1;
        if(this.major < other.major) return -1;
        if(this.minor > other.minor) return 1;
        if(this.minor < other.minor) return -1;
        if(this.patch > other.patch) return 1;
        if(this.patch < other.patch) return -1;
        return 0;
    }
}