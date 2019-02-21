import React from 'react'
import Document from '../../../Document'
import { PreviewProps } from './index'

export default class VideoPreview extends React.Component<PreviewProps> {
    render() {
        const { item, onRequestOverlay } = this.props

        return (
            <div className={'video'}>
                <video muted loop autoPlay playsInline onClick={onRequestOverlay}>
                    <source src={item.url} type={`video/${item.attributes.file.extension.substring(1)}`} />
                </video>
            </div>
        )
    }
}
