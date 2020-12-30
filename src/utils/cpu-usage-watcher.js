
class CpuUsageWatcher {
    constructor() {
        this.updateSeconds = 10
        this.usageBufferLength = 96

        this.previousUsage = null

        this.interval = setInterval(() => this.updateUsage(), this.updateSeconds * 1000)
        this.lastUsageIndex = -1
        this.usages = Array(this.usageBufferLength).fill(-1)
    }

    updateUsage() {
        this.previousUsage = process.cpuUsage(this.previousUsage)

        this.lastUsageIndex++
        if(this.lastUsageIndex >= this.usageBufferLength) this.lastUsageIndex = 0

        this.usages[this.lastUsageIndex] = this.previousUsage.user + this.previousUsage.system

    }

    getCpuUsage(seconds) {
        if(seconds % this.updateSeconds !== 0) {
            throw new Error(`Cannot count CPU usage for last ${seconds}s since update interval of the watcher is ${this.updateSeconds}s`)
        }
        seconds /= this.updateSeconds
        if(seconds > this.usageBufferLength) {
            throw new Error(`Cannot count CPU usage for last ${seconds}s since this watcher only stores last ${this.usageBufferLength * this.updateSeconds}s of CPU usage history`)
        }

        let result = 0;
        for(let i = 0, pointer = this.lastUsageIndex; i < seconds; i++, pointer--) {
            if(pointer < 0) pointer = this.usageBufferLength - 1;

            if(this.usages[pointer] < 0) return -1;

            result += this.usages[pointer];
        }

        return result;
    }

    destroy() {
        clearInterval(this.interval)
    }
}

module.exports = CpuUsageWatcher