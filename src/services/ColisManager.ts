import { TypeCargaison } from "../enumsCargaison/TypeCargaison";
import { TypeColis } from "../enums/TypeColis";
import { EtatAvancement } from "../enumsCargaison/EtatAvancement";
import { EtatColis } from "../enumsColis/EtatColis";
import { IColis } from "../models/IColis";


interface ICargaison {
    id: string;
    numero: string;
    etatGlobal: string;
    type: string;
    colis: IColis[];
    poidsMax: number;
    lieuDepart: {
        pays: string;
    };
    lieuArrivee: {
        pays: string;
    };
}

export class ColisManager {
    private endpoint = 'http://localhost:3000/cargaisons';

    async getCargaisonsDisponibles(typeColis: string): Promise<ICargaison[]> {
        try {
            const response = await fetch(this.endpoint);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des cargaisons');
            }

            const cargaisons: ICargaison[] = await response.json();
            console.log('Toutes les cargaisons:', cargaisons);
            
            const cargaisonsDisponibles = cargaisons.filter(cargaison => {
                // Une cargaison doit être OUVERTE pour recevoir des colis
                if (cargaison.etatGlobal !== 'OUVERT') {
                    console.log(`Cargaison ${cargaison.numero} fermée`);
                    return false;
                }

                // Vérifier la limite de 10 colis
                if (cargaison.colis && cargaison.colis.length >= 10) {
                    console.log(`Cargaison ${cargaison.numero} pleine`);
                    return false;
                }

                return true;
            });

            console.log('Cargaisons disponibles:', cargaisonsDisponibles);
            return cargaisonsDisponibles;

        } catch (error) {
            console.error("Erreur:", error);
            throw error;
        }
    }

    async ajouterColisACargaison(cargaisonId: string, colisData: any): Promise<boolean> {
        try {
            console.log('Ajout colis à la cargaison:', cargaisonId, colisData);
            
            const response = await fetch(`${this.endpoint}/${cargaisonId}`);
            if (!response.ok) {
                throw new Error(`Cargaison non trouvée: ${response.status}`);
            }

            const cargaison: ICargaison = await response.json();
            console.log('Cargaison récupérée:', cargaison);

            if (cargaison.colis.length >= 10) {
                throw new Error('La cargaison est pleine (maximum 10 colis)');
            }

            if (cargaison.etatGlobal !== 'OUVERT') {
                throw new Error('La cargaison est fermée');
            }

            const nouveauColis: IColis = {
                id: this.genererCodeSuivi(),
                libelle: colisData.libelle,
                poids: colisData.poids,
                type: this.mapperTypeColis(colisData.type),
                codeDeSuivi: this.genererCodeSuivi(),
                etatAvancement: EtatAvancement.EN_ATTENTE,
                etatColis: EtatColis.ARCHIVE,
                dateCreation: new Date()
            };

            console.log('Nouveau colis créé:', nouveauColis);

            cargaison.colis.push(nouveauColis);

            const updateResponse = await fetch(`${this.endpoint}/${cargaisonId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cargaison)
            });

            if (!updateResponse.ok) {
                throw new Error(`Erreur lors de la mise à jour: ${updateResponse.status}`);
            }

            console.log('Colis ajouté avec succès');
            return true;
            
        } catch (error) {
            console.error("Erreur lors de l'ajout du colis:", error);
            throw error;
        }
    }

    private mapperTypeColis(typeString: string): TypeColis {
        const mapping: { [key: string]: TypeColis } = {
            'alimentaire': TypeColis.ALIMENTAIRE,
            'chimique': TypeColis.CHIMIQUE,
            'materiel-fragile': TypeColis.MATERIEL_FRAGILE,
            'materiel-incassable': TypeColis.MATERIEL_INCASSABLE
        };
        
        const type = mapping[typeString.toLowerCase()];
        if (!type) {
            console.warn('Type de colis non reconnu:', typeString, 'Utilisation du type ALIMENTAIRE par défaut');
            return TypeColis.ALIMENTAIRE;
        }
        
        return type;
    }

    private genererCodeSuivi(): string {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `COL-${timestamp.slice(-6)}-${random}`;
    }

    private verifierCompatibilite(typeColis: string, typeCargaison: string): boolean {
        console.log('Vérification compatibilité:', typeColis, typeCargaison);
        
        // Pour les colis fragiles
        if (typeColis === 'MATERIEL_FRAGILE' && typeCargaison === 'MARITIME') {
            return false;
        }
        
        // Pour les colis incassables
        if (typeColis === 'MATERIEL_INCASSABLE' && typeCargaison !== 'MARITIME') {
            return false;
        }
        
        // Pour les colis chimiques
        if (typeColis === 'CHIMIQUE' && typeCargaison !== 'MARITIME') {
            return false;
        }
        
        return true;
    }
}