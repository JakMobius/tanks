/**
 * More reliable for serializing long-lasting or
 * large and scalable data structures.
 */

class BinaryOptions {

    constructor() {

        /**
         * Flag handler map
         * @type Map<number, BinaryOptions.FlagHandler>
         */

        this.flags = new Map()
        this.trimFlagIdentifier = false
    }

    addFlagHandler(handler) {
        this.flags.set(handler.id, handler)
    }

    convertBinary(decoder, options) {
        let flags

        if(this.trimFlagIdentifier) flags = decoder.readUint8()
        else flags = decoder.readUint16()

        options = options || {}

        while(flags--) {
            let flag
            if(this.trimFlagIdentifier) flag = decoder.readUint8()
            else flag = decoder.readUint16()

            if(this.flags.has(flag)) {
                let handler = this.flags.get(flag)
                handler.unpacker(decoder, options)
            }
        }

        return options
    }

    convertOptions(encoder, options, flags) {

        if(!options) options = {}

        let count = 0

        for(let [flag, handler] of this.flags.entries()) {
            if (flags && flags.indexOf(flag) === -1) continue
            if (handler.decision && !handler.decision(options)) continue

            count++
        }

        if(this.trimFlagIdentifier) encoder.writeUint8(count)
        else encoder.writeUint16(count)

        for(let [flag, handler] of this.flags.entries()) {
            if(flags && flags.indexOf(flag) === -1) continue
            if(handler.decision && !handler.decision(options)) continue

            if(this.trimFlagIdentifier) encoder.writeUint8(flag)
            else encoder.writeUint16(flag)

            handler.packer(encoder, options)
        }

        return options
    }
}

BinaryOptions.FlagHandler = class {
    constructor(id) {
        this.id = id
        this.unpacker = null
        this.packer = null
        this.decision = null
    }

    setUnpacker(handler) {
        this.unpacker = handler
        return this
    }

    setPacker(packer) {
        this.packer = packer
        return this
    }

    packDecision(decision) {
        this.decision = decision
        return this
    }

}

module.exports = BinaryOptions