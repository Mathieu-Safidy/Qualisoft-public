import { VueGlobal } from "./VueGlobal";

export interface Fonction {
    id_cgu : string,
    id_fonction :  string,
    libelle : string,
    date_susp : Date,
    taux_h : number

    
        cast(vue: VueGlobal[]): Fonction[];
}