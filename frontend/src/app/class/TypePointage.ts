export class TypePointage {
    id_type_pointage!: number;
    libelle!: string;

    constructor(id_type_pointage: number = 0, libelle: string = '') {
        this.id_type_pointage = id_type_pointage;
        this.libelle = libelle;
    }
}