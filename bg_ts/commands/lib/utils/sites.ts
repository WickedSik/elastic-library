export interface Site {
  aliases:string[]
  nsfw:boolean
  api:string
  postView:string
  random:boolean | string
  tagQuery?:string
  xml?:boolean
  https?:boolean
}

export interface SiteMap {
  [key: string]:Site
}

const sites: SiteMap = {
    'e621.net': {
        aliases: ['e6', 'e621'],
        nsfw: true,
        api: '/post/index.json?',
        postView: '/post/show/',
        random: true
    },
    'e926.net': {
        aliases: ['e9', 'e926'],
        nsfw: false,
        api: '/post/index.json?',
        postView: '/post/show/',
        random: true
    },
    'hypnohub.net': {
        aliases: ['hh', 'hypo', 'hypohub'],
        nsfw: true,
        api: '/post/index.json?',
        postView: '/post/show/',
        random: true
    },
    'danbooru.donmai.us': {
        aliases: ['db', 'dan', 'danbooru'],
        nsfw: true,
        api: '/posts.json?',
        postView: '/posts/',
        random: true
    },
    'konachan.com': {
        aliases: ['kc', 'konac', 'kcom'],
        nsfw: true,
        api: '/post.json?',
        postView: '/post/show/',
        random: true
    },
    'konachan.net': {
        aliases: ['kn', 'konan', 'knet'],
        nsfw: false,
        api: '/post.json?',
        postView: '/post/show/',
        random: true
    },
    'yande.re': {
        aliases: ['yd', 'yand', 'yandere'],
        nsfw: true,
        api: '/post.json?',
        postView: '/post/show/',
        random: true
    },
    'gelbooru.com': {
        aliases: ['gb', 'gel', 'gelbooru'],
        nsfw: true,
        api: '/index.php?page=dapi&s=post&q=index&',
        postView: '/index.php?page=post&s=view&id=',
        random: false
    },
    'rule34.xxx': {
        aliases: ['r34', 'rule34'],
        nsfw: true,
        api: '/index.php?page=dapi&s=post&q=index&',
        postView: '/index.php?page=post&s=view&id=',
        random: false,
        xml: true,
        https: true
    },
    'safebooru.org': {
        aliases: ['sb', 'safe', 'safebooru'],
        nsfw: false,
        api: '/index.php?page=dapi&s=post&q=index&',
        postView: '/index.php?page=post&s=view&id=',
        random: false
    },
    'tbib.org': {
        aliases: ['tb', 'tbib', 'big'],
        nsfw: false,
        api: '/index.php?page=dapi&s=post&q=index&',
        postView: '/index.php?page=post&s=view&id=',
        random: false
    },
    'xbooru.com': {
        aliases: ['xb', 'xbooru'],
        nsfw: true,
        api: '/index.php?page=dapi&s=post&q=index&',
        postView: '/index.php?page=post&s=view&id=',
        random: false
    },
    'youhate.us': {
        aliases: ['yh', 'you', 'youhate'],
        nsfw: true,
        api: '/index.php?page=dapi&s=post&q=index&',
        postView: '/index.php?page=post&s=view&id=',
        random: false
    },
    'dollbooru.org': {
        aliases: ['do', 'doll', 'dollbooru'],
        nsfw: false,
        api: '/api/danbooru/find_posts/index.xml?',
        postView: '/post/view/',
        random: false
    },
    'rule34.paheal.net': {
        aliases: ['pa', 'paheal'],
        nsfw: true,
        api: '/api/danbooru/find_posts/index.xml?',
        postView: '/post/view/',
        random: false,
        xml: true,
        https: true
    },
    'lolibooru.moe': {
        aliases: ['lb', 'lol', 'loli', 'lolibooru'],
        nsfw: true,
        api: '/post/index.json?',
        postView: '/post/show/',
        random: true
    },
    'derpibooru.org': {
        aliases: ['dp', 'derp', 'derpi', 'derpibooru'],
        nsfw: true,
        api: '/search.json?',
        tagQuery: 'q',
        postView: '/images/',
        random: 'sf=random%'
    }
}

export default sites
