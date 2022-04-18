import crypto from 'crypto';

export default class ClusterHandshake {
    static handshakeBytes = 32

    static generateSalt() {
        return crypto.randomBytes(this.handshakeBytes)
    }

    static checkKey(password: string, salt: Uint8Array, key: Uint8Array, callback: (result: boolean) => void) {
        this.createKey(password, salt, (error: Error | null, expectedKey: Buffer) => {
            if (key) {
                let expectedKeyBytes = new Uint8Array(expectedKey)

                for (let i = 0; i < this.handshakeBytes; i++) {
                    if (expectedKeyBytes[i] !== key[i]) {
                        callback(false)
                        return
                    }
                }

                callback(true)
                return
            }

            callback(false)
        })
    }

    static createKey(password: string, salt: Uint8Array, callback: (error: Error | null, expectedKey: Buffer) => void) {
        crypto.scrypt(password, salt, this.handshakeBytes, callback)
    }
}