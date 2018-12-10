declare global {
    interface Promise<T> {
        /**
         * Attaches callbacks for the resolution and/or rejection of the Promise.
         * @param onfulfilled The callback to execute when the Promise is resolved.
         * @param onrejected The callback to execute when the Promise is rejected.
         * @returns A Promise for the completion of which ever callback is executed.
         */
        finally<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    }

    interface Array<T> {
        compare(otherArray: Array<T>): boolean;
        remove(...value): void;
    }

    class Metadata {
        static addParser(parser): void;
        read(): void;
        has(key:String): boolean;
        set(key:String, value:any): void;
        add(key:String, value:any): void;
        get(key:String): any;
        getFilePath(): String;
        check(): void;
        isDirty(): boolean;
    }
}

export interface Parser {
    parse(metadata: Metadata): Promise<Metadata>;
    mapping(): Object;
}