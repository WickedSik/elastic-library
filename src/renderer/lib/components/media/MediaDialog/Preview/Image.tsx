import React from 'react'
import { PreviewProps } from './index'

export default class ImagePreview extends React.Component<PreviewProps> {
    private previewImage?: HTMLImageElement

    render() {
        const { item, onRequestOverlay } = this.props

        return (
            <div className={'image'}>
                <img onClick={onRequestOverlay}
                    className={'img'}
                    alt={item.title}
                    src={item.url}
                    ref={this._ref}
                    onError={() => { this.previewImage && (this.previewImage.src = item.thumb) }} />
            </div>
        )
    }

    _ref = (reference:HTMLImageElement) => {
        this.previewImage = reference
    }
}
