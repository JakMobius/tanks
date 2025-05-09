import BlockState from "src/map/block-state/block-state";
import {TwoDimensionalMap} from "src/utils/two-dimensional-map";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import TilemapComponent from 'src/map/tilemap-component';

interface ExplodePoolWalker {
    // Walker x position
    x: number

    // Walker y position
    y: number

    // Walker x velocity
    vx: number

    // Walker y velocity
    vy: number
    
    // Count of velocity modifiers
    vn: number

    // Walker energy
    power: number
}

type ExplodePoolWalkerMap = TwoDimensionalMap<number, number,ExplodePoolWalker>

export interface ExplodeEffectPoolConfig {
    damageBlocks?: boolean
}

export default class ExplodeEffectPool extends EventHandlerComponent {
	public powerDamping = 0.01
	public stepsPerSecond = 30
	public stepsWaiting = 0
	public walkers: ExplodePoolWalkerMap = new TwoDimensionalMap<number, number,ExplodePoolWalker>();
	public gridSize = 1;
	public offsetMap = [
        1, 0,
        1, -1,
        0, -1,
        -1, -1,
        -1, 0,
        -1, 1,
        0, 1,
        1, 1
    ]
	public static roundOffsetMap = (() => {
        let array = []
        for(let i = 0; i < Math.PI * 2; i += Math.PI / 4) {
            array.push(Math.sin(i))
            array.push(Math.cos(i))
        }
        return array
    })()

    // Сколько единиц скорости соответствует
    // одной единице энергии ячейки
	public waveCoefficient = 1

    // 10% энергии взрыва уходит на урон блокам
    // Остальные 90% остаются у блока
	public damageEnergyFraction = 0.1;

    // Практика показала, что если смотреть на два блока,
    // а не на один, то при расчете разницы давления
    // сила отталкивания будет рассчитана более правильно.
	public pressureDifferentialDistance = this.gridSize * 2

    // Ну это сколько-то.
    // Домножь на damageEnergyFraction, чтобы прикинуть
    // урон блокам от взрыва
    public blockDamageCoefficient = 5000

    private damageBlocks = false

    constructor(config?: ExplodeEffectPoolConfig) {
        super()
        config = config || {}
        this.damageBlocks = config.damageBlocks ?? false

        this.eventHandler.on("tick", (dt: number) => this.tick(dt))
    }

    isBlock (x: number, y: number): boolean {
        return false
        // const map = this.entity.getComponent(TilemapComponent)
        // let block = map.getBlock(Math.floor(x / 1), Math.floor(y / 1))
        // if(!block) return true
        // return (block.constructor as typeof BlockState).isSolid
    }

    /**
     * Adds a high pressure zone to this pool (same as an explosion source). If
     * given coordinates does not match the pool grid, the pressure will
     * be distributed among the nearest grid cells according to the
     * linear interpolation algorithm
     */

    start(x: number, y: number, power: number): void {

        let shift = this.gridSize / 2

        power /= 4

        this.startParticular(x + shift, y + shift, power)
        this.startParticular(x - shift, y + shift, power)
        this.startParticular(x + shift, y - shift, power)
        this.startParticular(x - shift, y - shift, power)
    }

    private interpolateWalkers(x: number, y: number, power: number): ExplodePoolWalker[] {
        // Linear interpolation algorithm

        let gridX = x / this.gridSize
        let gridY = y / this.gridSize

        let dx = gridX - (gridX = Math.floor(gridX - 0.5) + 0.5)
        let dy = gridY - (gridY = Math.floor(gridY - 0.5) + 0.5)

        let walkers = [
            this.walker(gridX * this.gridSize, gridY * this.gridSize, 0, 0, power * (1 - dx))
        ]

        if(dx > 0) walkers.push(this.walker((gridX + 1) * this.gridSize, gridY * this.gridSize, 0, 0, power * dx))

        if(dy > 0) {
            if(dx > 0) {
                walkers.push(this.walker((gridX + 1) * this.gridSize, (gridY + 1) * this.gridSize, 0, 0, walkers[1].power * dy))
                walkers[1].power *= (1 - dy)
            }

            walkers.push(this.walker(gridX * this.gridSize, (gridY + 1) * this.gridSize, 0, 0, walkers[0].power * dy))
            walkers[0].power *= (1 - dy)
        }

        return walkers
    }

    private startParticular(x: number, y: number, power: number) {
        let walkers = this.interpolateWalkers(x, y, power)

        // Координаты ячейки, находящейся ближе всего к взрыву

        const sourceX = (Math.floor(x / this.gridSize) + 0.5) * this.gridSize
        const sourceY = (Math.floor(y / this.gridSize) + 0.5) * this.gridSize

        // Надоело строить из себя англичанина. Короче, эта функция говорит,
        // есть ли путь из точки, куда попал снаряд, в соседнюю точку. Сам по
        // себе взрыв в начале распространяется по четырем ячейкам, так
        // что здесь проверяются только углы (x, y), (x, y) А если
        // что-то из этого равно исходным координатам, достаточно проверить только
        // одну точку - ту, которая дается в параметр

        const possible = (x: number, y: number) => {
            if(this.isBlock(x, y)) return false
            return x === sourceX || y === sourceY || !this.isBlock(sourceX, y) || !this.isBlock(x, sourceY)
        }

        let powerToSpread = 0
        let succeededWalkers = []

        // Здесь мы ищем, на какие точки давление может быть
        // распределено, а на какие - нет.

        for(let walker of walkers) {
            if(possible(walker.x, walker.y)) {
                succeededWalkers.push(walker)
            } else {
                powerToSpread += walker.power
            }
        }

        powerToSpread /= succeededWalkers.length

        for(let walker of succeededWalkers) {
            let current = this.walkers.get(walker.x, walker.y)
            if(current) {
                current.power += powerToSpread + walker.power
            } else {
                walker.power += powerToSpread
                this.walkers.set(walker.x, walker.y, walker)
            }
        }
    }

    // Avoid wrapping this structure in a class, because it will slow down the code.

    private walker(x: number, y: number, vx: number, vy: number, power: number): ExplodePoolWalker {
        return {
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            vn: 1,
            power: power
        }
    }

    private step(dt: number): void {
        this.stepsWaiting -= 1

        let newWalkers = new TwoDimensionalMap<number, number, ExplodePoolWalker>();

        const walk = (walker: ExplodePoolWalker, dx: number, dy: number, power: number) => {
            let x = walker.x + dx * this.gridSize
            let y = walker.y + dy * this.gridSize

            if(this.isBlock(x, y)) return

            let vx = walker.vx + dx * power * this.waveCoefficient
            let vy = walker.vy + dy * power * this.waveCoefficient

            let current = newWalkers.get(x, y)
            if(current) {
                current.vx += vx
                current.vy += vy
                current.vn++
                current.power += power
            } else {
                newWalkers.set(x, y, this.walker(x, y, vx, vy, power))
            }
        }

        let sibling = new Array(8)

        for(let columns of this.walkers.rows.values()) {
            for(let walker of columns.values()) {

                let x = walker.x
                let y = walker.y
                let total = 1

                for (let j = 0, i = 0; j < 8; j++) {
                    let dx = this.offsetMap[i++]
                    let dy = this.offsetMap[i++]
                    if (this.isBlock(x + dx * this.gridSize, y + dy * this.gridSize)) {
                        sibling[j] = -this.damageEnergyFraction

                        // Reflection algorithm
                        // When sibling element is negative, it means that block is being damaged

                        if(dx && !dy && (dx > 0) === (walker.vx > 0)) walker.vx = -walker.vx
                        if(!dx && dy && (dy > 0) === (walker.vy > 0)) walker.vy = -walker.vy
                    } else sibling[j] = 1
                }

                for (let j = 0, i = 0; j < 8; j++) {
                    let dx = this.offsetMap[i++]
                    let dy = this.offsetMap[i++]
                    if(j % 2 === 1) continue
                    let power = ((dx * walker.vx) + (dy * walker.vy))
                    if(sibling[j] < 0) power /= this.waveCoefficient
                    power += 1

                    if(power > 0) {
                        sibling[j] *= power
                    } else {
                        sibling[j] = 0
                    }
                }

                for (let j = 1; j <= 7; j += 2) {
                    sibling[j] *= Math.max(0, sibling[j - 1]) + Math.max(0, sibling[(j + 1) % 8])
                }

                for (let j = 0; j < 8; j++) {
                    total += Math.abs(sibling[j])
                }

                walker.power = (walker.power - this.powerDamping) / total
                walker.vx /= total
                walker.vy /= total

                if (walker.power <= 0) continue

                walk(walker, 0, 0, walker.power)

                for (let j = 0, i = 0; j < 8; j++) {
                    let dx = this.offsetMap[i++]
                    let dy = this.offsetMap[i++]
                    if(sibling[j] > 0) {
                        walk(walker, dx, dy, walker.power * sibling[j])
                    } else if(sibling[j] < 0) {
                        this.damageBlock(walker.x + dx * this.gridSize, walker.y + dy * this.gridSize, -sibling[j] * walker.power)
                    }
                }
            }
        }

        for(let columns of this.walkers.rows.values()) {
            for(let walker of columns.values()) {
                walker.vx /= walker.vn
                walker.vy /= walker.vn
                walker.vn = 1
            }
        }

        this.walkers = newWalkers
        this.entity.emit("explode-pool-tick", dt)
    }

    protected damageBlock(x: number, y: number, damage: number): void {
        return
        // if(!this.damageBlocks) return
        // const map = this.entity.getComponent(TilemapComponent)
        // map.damageBlock(x / 1, y / 1, damage * this.blockDamageCoefficient)
    }

    public normalize(x: number): number {
        return (1 - 1 / (Math.abs(x) + 1)) * Math.sign(x)
    }

    poolPressureAt(x: number, y: number): number {

        const relX = (x / this.gridSize - 0.5)
        const relY = (y / this.gridSize - 0.5)

        const fromX = (Math.floor(relX) + 0.5) * this.gridSize
        const fromY = (Math.floor(relY) + 0.5) * this.gridSize
        const toX = (Math.ceil(relX) + 0.5) * this.gridSize
        const toY = (Math.ceil(relY) + 0.5) * this.gridSize

        let resultPower = 0

        for(let gridX = fromX; gridX <= toX; gridX += this.gridSize) {
            let row = this.walkers.rows.get(gridX)
            if(!row) continue
            for(let gridY = fromY; gridY <= toY; gridY += this.gridSize) {
                let walker = row.get(gridY)
                if(!walker) continue

                let dx = 1 - Math.abs(gridX - x) / this.gridSize
                let dy = 1 - Math.abs(gridY - y) / this.gridSize

                let fraction = dx * dy

                resultPower += walker.power * fraction
            }
        }

        return resultPower
    }

    tick(dt: number): void {
        if(this.walkers.rows.size === 0) return

        this.stepsWaiting += this.stepsPerSecond * dt

        let stepDt = 1 / this.stepsPerSecond

        while(this.stepsWaiting > 1) {
            this.step(stepDt)
        }
    }

    onDetach() {
        super.onDetach()
        this.walkers.clear()
    }
}