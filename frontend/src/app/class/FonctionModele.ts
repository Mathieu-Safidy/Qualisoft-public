import { Fonction } from "../interface/Fonction";
import { VueGlobal } from "../interface/VueGlobal";

export class FonctionModele implements Fonction {
    id_cgu: string;
    id_fonction: string;
    libelle: string;
    date_susp: Date;
    taux_h: number;

    constructor(id_cgu: string = '', id_fonction: string = '', libelle: string = '', date_susp: Date = new Date(), taux_h: number = 0) {
        this.id_cgu = id_cgu;
        this.id_fonction = id_fonction;
        this.libelle = libelle;
        this.date_susp = date_susp;
        this.taux_h = taux_h;
    }
    
    cast(vue: VueGlobal[]): Fonction[] {
        const uniques = new Map<string, Fonction>();
        vue.forEach(item => {
            const key = `${item.id_fonction}`;
            if (!uniques.has(key)) {
                uniques.set(key, {
                    id_cgu: item.id_cgu ?? '',
                    id_fonction: item.id_fonction ?? '',
                    libelle: item.lib_fonction ?? ''
                } as Fonction);
            }
        });
        return Array.from(uniques.values());
    }

}