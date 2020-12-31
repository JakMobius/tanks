
import crypto from 'crypto';

class ClusterHandshake {
	public handshakeBytes: any;
    static handshakeBytes = 32

    static generateSalt() {
        return crypto.randomBytes(this.handshakeBytes)
    }

    static checkKey(password, salt, key, callback) {
        this.createKey(password, salt, (error, expectedKey) => {
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

    static createKey(password, salt, callback) {
        crypto.scrypt(password, salt, this.handshakeBytes, callback)
    }
}

export default ClusterHandshake;