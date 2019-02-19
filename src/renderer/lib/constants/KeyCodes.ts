// Meta keys
export const ALT = 18
export const BACKSPACE = 8
export const BREAK = 19
export const CAPS_LOCK = 20
export const CTRL = 17
export const DELETE = 46
export const END = 35
export const ENTER = 13
export const ESC = 27
export const ESCAPE = 27
export const HOME = 36
export const INSERT = 45
export const META = 91
export const META_LEFT = META // alias
export const META_RIGHT = 93
export const PAGE_DOWN = 34
export const PAGE_UP = 33
export const PAUSE = 19
export const SHIFT = 16
export const SPACE = 32
export const TAB = 9

// Arrows
export const ARROW_LEFT = 37
export const ARROW_UP = 38
export const ARROW_RIGHT = 39
export const ARROW_DOWN = 40

export function isCharacterKey(keycode:number) {
    return (keycode >= 65 && keycode <= 90)
}

export function isFunctionKey(keycode:number) {
    return keycode >= 112 && keycode <= 124
}

export function isNumberKey(keycode:number) {
    return keycode >= 48 && keycode <= 57
}

export function getCharacterFromCode(keycode:number) {
    if (isCharacterKey(keycode)) {
        return String.fromCharCode(keycode + 32)
    }
    if (isNumberKey(keycode)) {
        return keycode - 48
    }
    if (isFunctionKey(keycode)) {
        return `F${keycode - 111}`
    }
    return false
}

export default {
    ALT,
    ARROW_DOWN,
    ARROW_LEFT,
    ARROW_RIGHT,
    ARROW_UP,
    BACKSPACE,
    BREAK,
    CAPS_LOCK,
    CTRL,
    DELETE,
    END,
    ENTER,
    HOME,
    INSERT,
    META,
    META_LEFT,
    META_RIGHT,
    PAGE_DOWN,
    PAGE_UP,
    PAUSE,
    SHIFT,
    SPACE,
    TAB,
    ESCAPE,
    // functions
    isCharacterKey,
    isFunctionKey,
    isNumberKey,
    getCharacterFromCode
}
