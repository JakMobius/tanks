
const Box2D = require("/src/library/box2d")
const GameMap = require("/src/utils/map/gamemap")
const EventEmitter = require("/src/utils/eventemitter")
const WorldExplodeEffectModelPool = require("/src/effects/world/explode/worldexplodeeffectmodelpool")

class GameWorld extends EventEmitter {

    /**
     * @type {Map<number, GameWorld>}
     */
    world
    /**
     * @type {GameMap}
     */
    map
    /**
     * @type {Map<number, Player>}
     */
    players = new Map()
    /**
     * @type {Map<number, AbstractEntity>}
     */
    entities = new Map()
    /**
     * @type {Map<number, AbstractEffect>}
     */
    effects = new Map()

    /**
     * @type WorldExplodeEffectModelPool
     */
    explosionEffectPool

    constructor(options) {
        super()

        options = Object.assign({
            physicsTick: 0.002,
            maxTicks: 10,
            positionSteps: 1,
            velocitySteps: 1
        }, options)

        this.world = new Box2D.b2World(new Box2D.b2Vec2(), true)
        this.map = options.map

        this.physicsTick = options.physicsTick
        this.maxTicks = options.maxTicks
        this.positionSteps = options.positionSteps
        this.velocitySteps = options.velocitySteps
        this.createExplosionPool()
    }

    createExplosionPool() {
        this.explosionEffectPool = new WorldExplodeEffectModelPool({
            world: this
        })
    }

    // TODO: Вынести в отдельный класс

    rebuildBlockPhysics() {

        for (let player of this.players.values()) {
            if(!player.tank) continue
            let position = player.tank.model.body.GetPosition()

            const x = Math.floor(position.x / GameMap.BLOCK_SIZE)
            const y = Math.floor(position.y / GameMap.BLOCK_SIZE)

            const tx = x + 2
            const ty = y + 2

            let n = 0

            for (let i = x - 2; i <= tx; i++) {
                for (let j = y - 2; j <= ty; j++, n++) {
                    if (i === x && j === y) continue
                    let block = player.blockMap[n]
                    let mapBlock = this.map.getBlock(i, j)

                    if ((mapBlock && mapBlock.constructor.isSolid) || (i < 0) || (j < 0) || (i >= this.map.width) || (j >= this.map.height)) {
                        let pos = block.GetPosition()

                        pos.x = (i + 0.5) * GameMap.BLOCK_SIZE
                        pos.y = (j + 0.5) * GameMap.BLOCK_SIZE

                        block.SetPosition(pos)

                        block.m_fixtureList.m_filter.maskBits = 0xFFFF
                    } else {
                        if (block.m_fixtureList.m_filter.maskBits) {
                            let pos = block.GetPosition()
                            pos.Set(-1000, -1000)
                            block.SetPosition(pos)
                        }
                        block.m_fixtureList.m_filter.maskBits = 0
                    }
                }
            }
        }
    }

    processPhysics(dt) {

        this.explosionEffectPool.tick(dt)

        let steps = Math.floor(dt / this.physicsTick);
        if (steps > this.maxTicks) steps = this.maxTicks;
        for (let i = 0; i < steps; i++) this.world.Step(this.physicsTick, 1, 1);

        this.rebuildBlockPhysics()
        this.world.ClearForces()

        for (let player of this.players.values()) {
            if(player.tank) player.tank.tick(dt)
        }
    }

    processEntities(dt) {
        for (let entity of this.entities.values()) {
            entity.tick(dt)
            if (entity.model.dead)
                this.removeEntity(entity)
        }
    }

    processEffects(dt) {
        for(let effect of this.effects.values()) {
            effect.tick(dt)
            if(effect.dead) {
                this.removeEffect(effect)
            }
        }
    }

    tick(dt) {
        // Processing entities first because
        // otherwise processPhysics method
        // does an excessive initial tick
        // to new bullets

        this.processEntities(dt)
        this.processPhysics(dt)
        this.processEffects(dt)
    }

    createEntity(entity) {
        entity.game = this
        this.entities.set(entity.model.id, entity)
        this.emit("entity-create", entity)
    }

    removeEntity(entity) {
        this.entities.delete(entity.model.id)
        this.emit("entity-remove", entity)
    }

    createPlayer(player) {
        if(this.players.has(player.id)) {
            this.players.get(player.id).destroy()
        }
        player.world = this
        this.players.set(player.id, player)
        player.setupPhysics()
        this.emit("player-create", player)
    }

    removePlayer(player) {
        player.destroy()
        //player.team.remove(player);
        this.players.delete(player.id)
        this.emit("player-remove", player)
    }

    addTankEffect(effect, tank) {
        this.emit("effect-create", effect, tank)
    }

    removeTankEffect(effect, tank) {
        this.emit("effect-remove", effect, tank)
    }

    addEffect(effect) {
        if(this.effects.has(effect.model.id)) return

        this.effects.set(effect.model.id, effect)
        this.emit("effect-create", effect)
    }

    removeEffect(effect) {
        if(this.effects.delete(effect.model.id)) {
            this.emit("effect-remove", effect)
        }
    }
}

module.exports = GameWorld