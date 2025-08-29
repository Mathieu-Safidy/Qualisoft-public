import { Operation } from "../interface/Operation"
import { VueGlobal } from "../interface/VueGlobal";

export class Operations implements Operation {
    id_cgu: string;
    id_operation: string;
    libelle: string;
    id_type_operation: string;
    date_susp: Date;
    id_type_qte_act: number = 0;


    constructor(
        id_cgu: string = '',
        id_operation: string = '',
        libelle: string = '',
        id_type_operation: string = '',
        date_susp: Date = new Date()
    ) {
        this.id_cgu = id_cgu;
        this.id_operation = id_operation;
        this.libelle = libelle;
        this.id_type_operation = id_type_operation;
        this.date_susp = date_susp;
    }

    cast(vue: VueGlobal[]): Operation[] {
        const uniques = new Map<string, Operation>();
        vue.forEach(item => {
        const key = `${item.id_operation}`;
            if (!uniques.has(key)) {
                uniques.set(key, {
                    id_cgu: item.id_cgu ?? '',
                    id_operation: item.id_operation ?? '',
                    libelle: item.lib_operation ?? '',
                    id_type_operation: item.id_type_operation ?? '',
                    id_type_qte_act: item.id_type_qte_act ?? 0,
                } as Operation);
            }
        });
        return Array.from(uniques.values());
    }
}