
export const Commands = {
    // Entity tree commands
    PASS_BLOCK_TO_CHILD:      0xF000,
    ENTITY_CREATE_COMMAND:    0xF001,
    ENTITY_REMOVE_COMMAND:    0xF002,

    // Component commands
    PLAYER_TANK_SET:          0x0F09,
    GAME_MAP_CONTENT_COMMAND: 0x0F0A,
    BLOCK_UPDATE_COMMAND:     0x0F0B,
    HEALTH_UPDATE_COMMAND:    0x0F0C,
    POSITION_UPDATE_COMMAND:  0x0F0D,
    EFFECT_CREATE_COMMAND:    0x0F0E,
    EFFECT_REMOVE_COMMAND:    0x0F0F,
}