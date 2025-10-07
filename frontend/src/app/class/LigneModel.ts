import { Ligne } from "../interface/Ligne";
import { VueGlobal } from "../interface/VueGlobal";

export class LigneModel implements Ligne {
    id_cgu: string;
    id_ligne: string;
    libelle: string;
    date_susp: Date;
    lig_typ: string;
    lig_tof: string;

    constructor(
        id_cgu: string = '',
        id_ligne: string = '',
        libelle: string = '',
        date_susp: Date = new Date(),
        lig_typ: string = '',
        lig_tof: string = ''
    ) {
        this.id_cgu = id_cgu;
        this.id_ligne = id_ligne;
        this.libelle = libelle;
        this.date_susp = date_susp;
        this.lig_typ = lig_typ;
        this.lig_tof = lig_tof;
    }

    cast(vue: VueGlobal[]): Ligne[] {
        const uniques = new Map<string, Ligne>();

        vue.forEach(item => {
            const key = `${item.id_ligne}`;
            if (!uniques.has(key)) {
                uniques.set(key, {
                    id_cgu: item.id_cgu ?? '',
                    id_ligne: item.id_ligne ?? '',
                    libelle: item.lib_ligne ?? ''
                } as Ligne);
            }
        });

        return Array.from(uniques.values());
    }

}