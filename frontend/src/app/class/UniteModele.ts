import { Unite } from "../interface/Unite";
import { VueGlobal } from "../interface/VueGlobal";

export class UniteModel implements Unite {
    id_cgu: string;
    id_type_qte_act: number;
    libelle: string;

    constructor(id_cgu: string = '', id_type_qte_act: number = 0, libelle: string = '') {
        this.id_cgu = id_cgu;
        this.id_type_qte_act = id_type_qte_act;
        this.libelle = libelle;
    }

    cast(model: VueGlobal[]) : Unite[] {
        const uniques = new Map<string, Unite>();
        model.forEach(item => {
            const key = `${item.id_operation}`;
            if (!uniques.has(key)) {
                uniques.set(key, {
                    id_cgu: item.id_cgu,
                    id_type_qte_act: item.id_type_qte_act,
                    libelle: ''
                } as Unite);
            }
        });
        return Array.from(uniques.values());
    }
}