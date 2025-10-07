import { Initiator } from "./Initiator";
import { VueGlobal } from "./VueGlobal";

export interface Projet extends Initiator<Projet> {
    id_cgu: string;
    id_plan: string;
    libelle: string;
    date_susp?: Date | null;

    
    cast(vue: VueGlobal[]): Projet[];
}