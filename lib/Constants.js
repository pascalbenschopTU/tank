module.exports = {
    PORT: 5000, //25565,

    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 700,

    DRAWING_BULLET_PATH: 'client/images/bullet3.0.png',
    DRAWING_ENEMY_COLOUR: '#00FF00',
    DRAWING_BOT_COLOUR: '#FF0000',
    DRAWING_SELF_COLOUR: '#FFFF00',
  
    SOCKET_UPDATE: 'update',
    SOCKET_MAP_UPDATE: 'map-update',
    SOCKET_NEW_PLAYER: 'new-player',
    SOCKET_PLAYER_ACTION: 'player-action',
    SOCKET_DEBUG_INFO: 'debug-info',
    SOCKET_MESSAGE: 'message',
    SOCKET_DISCONNECT: 'disconnect',
  
    PLAYER_TURN_RATE: 0.005,
    PLAYER_DEFAULT_SPEED: 0.2,
    PLAYER_SHOT_COOLDOWN: 200,
    PLAYER_DEFAULT_HITBOX_SIZE: 20,
    PLAYER_SHIELD_HITBOX_SIZE: 45,
    PLAYER_MAX_HEALTH: 10,
    PLAYER_NAME: 'player',
    Player_UPDATE_RATE: 1/60,

    BOT_SHOT_COOLDOWN: 400,
    BOT_DEFAULT_SPEED: 0.1,
    BOT_NAME: 'bot',
    BOT_UPDATE_RATE: 1/20,

    BOT_ACTION_FORWARD: 0,
    BOT_ACTION_BACKWARD: 1,
    BOT_ACTION_TURNLEFT: 2,
    BOT_ACTION_TURNRIGHT: 3,
  
    BULLET_DEFAULT_DAMAGE: 1,
    BULLET_SPEED: 0.4,
    BULLET_HITBOX_SIZE: 5,
  }