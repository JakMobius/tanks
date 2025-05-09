export const physicsCategories = {
    mine:       0b00001,
    wall:       0b00010,
    bullet:     0b00100,
    tank:       0b01000,
    checkpoint: 0b10000
}

export const physicsMasks = {
    mine:
        physicsCategories.tank |
        physicsCategories.wall,
    wall:
        physicsCategories.tank |
        physicsCategories.bullet |
        physicsCategories.mine,
    bullet:
        physicsCategories.tank |
        physicsCategories.wall,
    tank:
        physicsCategories.tank |
        physicsCategories.wall |
        physicsCategories.mine |
        physicsCategories.checkpoint |
        physicsCategories.bullet,
    checkpoint:
        physicsCategories.tank |
        physicsCategories.checkpoint
}

export const physicsFilters = {
    mine: {
        categoryBits: physicsCategories.mine,
        maskBits: physicsMasks.mine
    },
    wall: {
        categoryBits: physicsCategories.wall,
        maskBits: physicsMasks.wall
    },
    bullet: {
        categoryBits: physicsCategories.bullet,
        maskBits: physicsMasks.bullet
    },
    tank: {
        categoryBits: physicsCategories.tank,
        maskBits: physicsMasks.tank
    },
    checkpoint: {
        categoryBits: physicsCategories.checkpoint,
        maskBits: physicsMasks.checkpoint
    }
}