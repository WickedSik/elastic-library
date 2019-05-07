import DeviantArtParser from './deviantart'
import VideoParser from './video'
import VideoThumbParser from './video-thumb'
import TitleParser from './title'
import StatsParser from './stats'
import PathParser from './path'
import NumberParser from './number'
import HentaiFoundryParser from './hentaifoundry'
import FurAffinityParser from './furaffinity'
import ExifParser from './exif'
import ImageParser from './image'

const map = {
    'deviant-art': DeviantArtParser,
    'video': VideoParser,
    'video-thumb': VideoThumbParser,
    'title': TitleParser,
    'stats': StatsParser,
    'path': PathParser,
    'number': NumberParser,
    'hentai-foundry': HentaiFoundryParser,
    'fur-affinity': FurAffinityParser,
    'exif': ExifParser,
    'image': ImageParser
}

export default map