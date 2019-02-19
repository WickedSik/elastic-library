import { dispatchAction } from '../index'
import { TOGGLE_MUTE_REQUEST } from './actiontypes'
import { action } from 'typesafe-actions'

export const toggleMute = () => action(TOGGLE_MUTE_REQUEST)
