import { dispatchAction } from '../index'
import {
    TOGGLE_FULLSCREEN_REQUEST, TOGGLE_SCREENLOCK_REQUEST
} from './actiontypes'

export const toggleFullscreen = () => dispatchAction(TOGGLE_FULLSCREEN_REQUEST)
export const toggleScreenlock = (lock) => dispatchAction(TOGGLE_SCREENLOCK_REQUEST, lock)
