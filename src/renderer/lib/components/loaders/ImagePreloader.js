export default class ImagePreloader {
    constructor() {
        this.__urls = []
        this.__loaded = []

        setTimeout(() => {
            this.__token = window.requestAnimationFrame(() => this.load)
        }, 1)
    }

    destroy() {
        window.cancelAnimationFrame(this.__token)
        this.__token = null
    }

    add(url) {
        if (this.__urls.indexOf(url) === -1 && this.__loaded.indexOf(url) === -1) {
            this.__urls.push(url)
            this.load()
        }
    }

    load() {
        if (this.__urls.length > 0) {
            const img = new Image()
            img.src = this.__urls.shift()
            img.onload = () => {
                this.__loaded.push(img.src)
                // console.info('-- loaded', img.src)
            }
        }

        this.__token = window.requestAnimationFrame(() => this.load)
    }
}
