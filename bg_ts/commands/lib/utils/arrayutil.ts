export class ArrayUtil {
    static async filter<T>(array:T[], predicate:(e:T, i?:number, a?:T[]) => Promise<boolean>):Promise<T[]> {
        return Promise.all(array.map((element:T, index:number, array:T[]) => predicate(element, index, array)))
            .then((result:boolean[]) => {
                return array.filter((element:T, index:number) => result[index])
            })
    }
}