import { set as _set } from 'lodash'

import ParserMap from './parsers'
import { StoredFile } from '../declarations/files'
import { Metadata } from '../declarations/search'
import { ConfigJSON } from '../declarations/config'
export { Metadata } from '../declarations/search'

export interface ParserModule {
    name: string
    run(file: StoredFile): Promise<Metadata>
    accepts(file: StoredFile): boolean
}

export default class Parser implements ParserModule {
    name: 'Parser'
    modules: ParserModule[]

    constructor(modules: ParserModule[] = []) {
        this.modules = modules
    }

    async run(file: StoredFile): Promise<Metadata> {
        return Promise.all(this.modules.map(async module => {
            try {
                return module.accepts(file) ? await module.run(file) : new Metadata()
            } catch (error) {
                return new Metadata()
            }
        })).then((allData: Metadata[]) => {
            return allData.reduce((prev: Metadata, value: Metadata) => {
                return prev.setAll(value.getAll())
            })
        }).catch((error: Error) => {
            console.error('failed while running parser', error)
            console.error(error.stack)

            throw error
        })
    }

    accepts(file: StoredFile): boolean {
        return true
    }

    static generateFromConfig(config: ConfigJSON): Parser {
        const parsermodules: string[] = Object.keys(config.parsers)

        const modules: ParserModule[] = parsermodules.map(moduleKey => {
            if (!(moduleKey in ParserMap)) {
                throw `${moduleKey} is not a valid parser`
            }

            const parserModuleConfig: any = config.parsers[moduleKey]
            const ParserModuleClass = ParserMap[moduleKey]
            return new ParserModuleClass(parserModuleConfig)
        })

        // console.info('-- completed parser list', modules)
        // process.exit(3)

        return new Parser(modules)
    }
}
