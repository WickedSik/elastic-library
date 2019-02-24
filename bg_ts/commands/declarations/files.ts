export interface Checksum {
    id:string
    checksum:string
}

export interface StoredFile {
    directory:string
    filename:string
    checksum?:string
}

export interface StoredFileExtra extends StoredFile {
    titleSum?:string
}
