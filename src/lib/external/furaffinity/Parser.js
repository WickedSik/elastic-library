import cheerio from 'cheerio'
import { shuffleArray, figure } from './Util'

export const recents = (data, type, limit = 100) => {
    return new Promise((resolve, reject) => {
        var $ = cheerio.load(data)
        var parsed = {0: [], 1: [], 2: [], 3: []}
        var sections = $('section')
        for (var i = 0; i < sections.length; i++) {
            var $$ = cheerio.load(sections.eq(i).html())
            var figures = $$('figure')
            for (var y = 0; y < figures.length; y++) {
                parsed[i].push(figure(figures.eq(y)))
            }
        }
        var ret = []
        if (type < 4) ret = parsed[type]
        else ret = ret.concat(parsed[0], parsed[1], parsed[2], parsed[3])
        resolve(shuffleArray(ret).slice(0, limit))
    })
}

export const search = (data, limit = 100) => {
    return new Promise((resolve, reject) => {
        var $ = cheerio.load(data)
        var figures = $('figure')
        var ret = []
        for (var i = 0; i < figures.length; i++) {
            ret.push(figure(figures.eq(i)))
        }
        resolve(shuffleArray(ret).slice(0, limit))
    })
}
