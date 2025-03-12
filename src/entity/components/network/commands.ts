
export const Commands = {
    // Entity tree commands
    PASS_BLOCK_TO_CHILD:             0x1000,
    ENTITY_CREATE_COMMAND:           0x1001,
    ENTITY_REMOVE_COMMAND:           0x1002,

    // Editor commands:
    EDITOR_EVENT_COMMAND:            0x2003,

    // Component commands
    WORLD_PLAYER_STATISTICS_COMMAND: 0x3000,
    WORLD_MAP_NAME_COMMAND:          0x3001,
    WORLD_MATCH_TIMER_COMMAND:       0x3002,
    COLLISION_IGNORE_LIST_ADD:       0x3003,
    COLLISION_IGNORE_LIST_REMOVE:    0x3004,
    COLLISION_DISABLE_COMMAND:       0x3005,
    PLAYER_TANK_SET:                 0x3006,
    GAME_MAP_CONTENT_COMMAND:        0x3007,
    BLOCK_UPDATE_COMMAND:            0x3008,
    HEALTH_UPDATE_COMMAND:           0x3009,
    POSITION_UPDATE_COMMAND:         0x3010,
    EXPLODE_COMMAND:                 0x3011,
    SET_FIRING_COMMAND:              0x3012,
    PELLETS_TRIGGER_COMMAND:         0x3013,
    SOUND_COMMAND:                   0x3014,
    GAME_STATE_COMMAND:              0x3015,
    GAME_EVENT_COMMAND:              0x3016,
    ENTITY_PILOT_LIST_COMMAND:       0x3017,
    TIMER_VALUE_COMMAND:             0x3018,
    FLAG_DATA_COMMAND:               0x3019,
    USER_MESSAGE_COMMAND:            0x3020,
    MORTAR_BALL_HEIGHT_SET:          0x3021,
    WEAPON_STATE:                    0x3022,
    WEAPON_INFO:                     0x3023,
    CHAT_MESSAGE_COMMAND:            0x3024,
    SPAWNZONE_DATA_COMMAND:          0x3025,
    CHECKPOINT_DATA_COMMAND:         0x3026,
}

export function commandName(command: number) {
    for (let key in Commands) {
        if ((Commands as any)[key] === command) {
            return key
        }
    }
    return null
}