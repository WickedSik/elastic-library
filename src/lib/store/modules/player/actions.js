import { dispatchAction } from '../index'
import {
    TOGGLE_MUTE_REQUEST
} from './actiontypes'

export const toggleMute = () => dispatchAction(TOGGLE_MUTE_REQUEST)
