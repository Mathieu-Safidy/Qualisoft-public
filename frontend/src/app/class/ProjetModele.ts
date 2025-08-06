import { Projet } from "../interface/Projet";
import { VueGlobal } from "../interface/VueGlobal";

export class ProjetModele implements Projet {
    id_cgu: string;
    id_plan: string;
    libelle: string;
    date_susp?: Date | null;


    constructor(id_cgu: string = '', id_plan: string = '', libelle: string = '', date_susp: Date = new Date()) {
        this.id_cgu = id_cgu;
        this.id_plan = id_plan;
        this.libelle = libelle;
        this.date_susp = date_susp;
    }

    cast(vue: VueGlobal[]): Projet[] {
        const uniques = new Map<string, Projet>();
        vue.forEach(item => {
            const key = `${item.id_plan}`;
            if (!uniques.has(key)) {
                uniques.set(key, {
                    id_cgu: item.id_cgu ?? '',
                    id_plan: item.id_plan ?? '',
                    libelle: item.lib_plan ?? '',
                } as Projet);
            }
        });
        return Array.from(uniques.values());
    }
}