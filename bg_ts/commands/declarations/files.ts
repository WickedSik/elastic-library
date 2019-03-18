export interface Checksum {
    id:string
    checksum:string
    filepath?:string
    exists?:boolean
}

export interface StoredFile {
    directory:string
    filename:string
    checksum?:string
    realpath:string
}

export interface StoredFileExtra extends StoredFile {
    titleSum?:string
}
