export interface ConfigJSON {
    search: {
        host: string
    }
    index: string
    media: {
        directories: string[]
    }
    handlers: string[]
    parsers: {
        [parser:string]: any | null
    }
}