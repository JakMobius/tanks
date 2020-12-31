
import Command from '../command';

class TPSCommand extends Command {

	onPerform(args) {
	    // let logger = this.console.logger
		// let ticks = Number(args[0]) || 20
        //
        // if(ticks > 100) {
        //     ticks = 100
        // }
        // if(ticks < 1) {
        //     ticks = 1
        // }
        // ticks = Math.round(ticks)
        //
        // logger.log(`Подсчет среднего времени выполнения ${ticks} тика(ов)`)
        // this.console.observingRoom.profile(ticks, function(time) {
        //     logger.log(`Среднее время выполнения ${ticks} тика(ов): ${Math.round(time)}ms`)
        // })
	}

	getName() {
        return "tps";
    }

    getDescription() {
        return "Посчитать среднее количество миллисекунд, затраченное на один тик";
    }

    getUsage() {
		return "tps [ticks]"
	}

	requiresRoom() {
        return true
    }
}

export default TPSCommand;