import { Initiator } from "./Initiator";
import { VueGlobal } from "./VueGlobal";

export interface Fonction extends Initiator<Fonction> {
    id_cgu : string,
    id_fonction :  string,
    libelle : string,
    date_susp : Date,
    taux_h : number

    
    cast(vue: VueGlobal[]): Fonction[];
}