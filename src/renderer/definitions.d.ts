/// <reference path="./../shared/definitions.d.ts"/>

/*
this is where you put things like interfaces,
that should only be used by the renderer process.
*/

/**
 * Module for `.png` files
 */
declare module '*.ico' {
    const fileName: string;
    export default fileName;
}

/**
 * Module for `.png` files
 */
declare module '*.png' {
    const fileName: string;
    export default fileName;
}

/**
 * Module for `.jpg` files
 */
declare module '*.jpg' {
    const fileName: string;
    export default fileName;
}

/**
 * Module for `.svg` files
 */
declare module '*.svg' {
    const fileName: string;
    export default fileName;
}

declare module 'react-notifications' {
    export const NotificationContainer: any
    export const NotificationManager: any
}

declare module 'url' {
    interface UrlObjectCommon {
        auth?: string;
        hash?: string;
        host?: string;
        hostname?: string;
        href?: string;
        path?: string;
        pathname?: string;
        protocol?: string;
        search?: string;
        slashes?: boolean;
    }
    interface UrlObject extends UrlObjectCommon {
        port?: string | number;
        query?: string | null | { [key: string]: any };
    }

    export const parse:() => URL
    export const format:(params:UrlObject) => string
}

interface JQuery<TElement = HTMLElement> extends Iterable<TElement> {
    foundation():JQuery<TElement>
}
