import chalk from 'chalk'
import { sprintf } from 'sprintf-js'
import Logger from './logger'

export function timestamp():string {
    const now = new Date()

    return sprintf(`%02d:%02d:%02d.%04d`, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
}

export default function visualize(logger:Logger, key: string, obj:(any|any[]), indent:string = '\t'):void {
    const MAX_LENGTH = 50
    const keyAsIndent:string = ' '.repeat(key.length)

    if(typeof(obj) === 'undefined' || (typeof(obj) === 'object' && obj === null)) {
        logger.info(chalk`%s{bold %s}: {cyan undefined}`, indent, key)
    }

    if(Array.isArray(obj)) {
        if(obj.length === 0) {
            logger.info(chalk`%s{bold %s}: []`, indent, key)
        } else {
            logger.info(chalk`%s{bold %s}: [`, indent, key)
            
            Array.from(obj).forEach((element, index) => {
                visualize(logger, index.toString(), element, `${indent}${keyAsIndent}  \t`)
            })

            logger.info(chalk`%s%s  ]`, indent, keyAsIndent)
        }
        return
    }

    if(typeof(obj) === 'object') {
        if(!obj) {
            logger.info(chalk`%s{bold %s}: {cyan undefined}`, indent, key)
        } else if(obj instanceof Date) {
            logger.info(chalk`%s{bold %s}: {green %s}`, indent, key, obj.toLocaleString())
        } else if(Object.keys(obj).length === 0) {
            logger.info(chalk`%s{bold %s}: %s`, indent, key, '{}')
        } else {
            logger.info(chalk`%s{bold %s}: {`, indent, key)
            
            const keys = Object.keys(obj)
            for(let k of keys) {
                const element = obj[k]
                visualize(logger, k, element, `${indent}${keyAsIndent}  \t`)
            }

            logger.info(chalk`%s%s  %s`, indent, keyAsIndent, '}')
        }
        return
    }

    switch(typeof(obj)) {
        case 'function':
        logger.info(chalk`%s%s: {blueBright %s() => function}`, indent, key, obj.name)
            break
        case 'number':
            logger.info(chalk`%s{bold %s}: {yellow %s}`, indent, key, obj.valueOf())
            break
        case 'string':
            if(obj.length > MAX_LENGTH) {
                logger.info(chalk`%s{bold %s}: {magenta %s...} ({yellow %d})`, indent, key, obj.substr(0, MAX_LENGTH - 3), obj.length)
            } else {
                logger.info(chalk`%s{bold %s}: {magenta %s}`, indent, key, obj)
            }
            break
        case 'boolean':
            if(obj) {
                logger.info(chalk`%s{bold %s}: {greenBright yes}`, indent, key)
            } else {
                logger.info(chalk`%s{bold %s}: {redBright no}`, indent, key)
            }
            break
        case 'symbol':
            logger.info(chalk`%s{bold %s}: {white %s} ({blue symbol})`, indent, key, obj.toString())
            break
    }
}