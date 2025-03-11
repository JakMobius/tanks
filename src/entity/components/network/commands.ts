
export const Commands = {
    // Entity tree commands
    PASS_BLOCK_TO_CHILD:      0xF000,
    ENTITY_CREATE_COMMAND:    0xF001,
    ENTITY_REMOVE_COMMAND:    0xF002,

    // Component commands
    WORLD_PLAYER_STATISTICS_COMMAND: 0x0F00,
    WORLD_MAP_NAME_COMMAND:          0x0F01,
    WORLD_MATCH_TIMER_COMMAND:       0x0F02,
    COLLISION_IGNORE_LIST_ADD:       0x0F03,
    COLLISION_IGNORE_LIST_REMOVE:    0x0F04,
    COLLISION_DISABLE_COMMAND:       0x0F05,
    PLAYER_TANK_SET:                 0x0F06,
    GAME_MAP_CONTENT_COMMAND:        0x0F07,
    BLOCK_UPDATE_COMMAND:            0x0F08,
    HEALTH_UPDATE_COMMAND:           0x0F09,
    POSITION_UPDATE_COMMAND:         0x0F10,
    EXPLODE_COMMAND:                 0x0F11,
    SET_FIRING_COMMAND:              0x0F12,
    PELLETS_TRIGGER_COMMAND:         0x0F13,
    SOUND_COMMAND:                   0x0F14,
    GAME_STATE_COMMAND:              0x0F15,
    GAME_EVENT_COMMAND:              0x0F16,
    ENTITY_PILOT_LIST_COMMAND:       0x0F17,
    TIMER_VALUE_COMMAND:             0x0F18,
    FLAG_DATA_COMMAND:               0x0F19,
    USER_MESSAGE_COMMAND:            0x0F20,
    MORTAR_BALL_HEIGHT_SET:          0x0F21,
    WEAPON_STATE:                    0x0F22,
    WEAPON_INFO:                     0x0F23,
    CHAT_MESSAGE_COMMAND:            0x0F24,
    SPAWNZONE_DATA_COMMAND:          0x0F25,
    CHECKPOINT_DATA_COMMAND:         0x0F26,
}

export function commandName(command: number) {
    for (let key in Commands) {
        if ((Commands as any)[key] === command) {
            return key
        }
    }
    return null
}