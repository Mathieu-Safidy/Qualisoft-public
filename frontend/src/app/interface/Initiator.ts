import { VueGlobal } from "./VueGlobal";

export interface Initiator<T> {
    cast(vueGlobal: VueGlobal[]) : T[] ;
}