import { VueGlobal } from "./VueGlobal";

export interface Ligne {
    id_cgu : string,
    id_ligne : string,
    libelle : string,
    date_susp : Date,
    lig_typ : string,
    lig_tof : string

    cast(vue: VueGlobal[]): Ligne[];
}