import { Unite } from "../interface/Unite";

export class UniteModel implements Unite {
    id_cgu: string;
    id_type_qte_act: string;
    libelle: string;

    constructor(id_cgu: string = '', id_type_qte_act: string = '', libelle: string = '') {
        this.id_cgu = id_cgu;
        this.id_type_qte_act = id_type_qte_act;
        this.libelle = libelle;
    }
}