import { TypeColis } from "../enums/TypeColis";
import { EtatAvancement } from "../enumsCargaison/EtatAvancement";
import { EtatColis } from "../enumsColis/EtatColis";
export class ColisManager {
    constructor() {
        this.endpoint = 'http://localhost:3000/cargaisons';
    }
    async getCargaisonsDisponibles(typeColis) {
        try {
            console.log('Recherche de cargaisons pour le type:', typeColis);
            const response = await fetch(this.endpoint);
            if (!response.ok) {
                throw new Error(`Erreur serveur: ${response.status}. Vérifiez que json-server est démarré.`);
            }
            const cargaisons = await response.json();
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
                // Vérifier la compatibilité du type de colis avec le type de cargaison
                if (!this.verifierCompatibilite(typeColis, cargaison.type)) {
                    console.log(`Cargaison ${cargaison.numero} incompatible avec le type ${typeColis}`);
                    return false;
                }
                return true;
            });
            console.log('Cargaisons disponibles:', cargaisonsDisponibles);
            return cargaisonsDisponibles;
        }
        catch (error) {
            console.error("Erreur:", error);
            throw error;
        }
    }
    async ajouterColisACargaison(cargaisonId, colisData) {
        try {
            console.log('Ajout colis à la cargaison:', cargaisonId, colisData);
            const response = await fetch(`${this.endpoint}/${cargaisonId}`);
            if (!response.ok) {
                throw new Error(`Cargaison non trouvée: ${response.status}`);
            }
            const cargaison = await response.json();
            console.log('Cargaison récupérée:', cargaison);
            if (cargaison.colis.length >= 10) {
                throw new Error('La cargaison est pleine (maximum 10 colis)');
            }
            if (cargaison.etatGlobal !== 'OUVERT') {
                throw new Error('La cargaison est fermée');
            }
            const nouveauColis = {
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
        }
        catch (error) {
            console.error("Erreur lors de l'ajout du colis:", error);
            throw error;
        }
    }
    mapperTypeColis(typeString) {
        const mapping = {
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
    genererCodeSuivi() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `COL-${timestamp.slice(-6)}-${random}`;
    }
    verifierCompatibilite(typeColis, typeCargaison) {
        console.log('Vérification compatibilité:', typeColis, typeCargaison);
        // Règles de compatibilité
        // Les colis fragiles ne peuvent pas aller en maritime
        if (typeColis === 'MATERIEL_FRAGILE' && typeCargaison === 'MARITIME') {
            return false;
        }
        // Les colis chimiques ne peuvent aller qu'en maritime
        if (typeColis === 'CHIMIQUE' && typeCargaison !== 'MARITIME') {
            return false;
        }
        // Les autres types sont compatibles avec tous les modes de transport
        return true;
    }
}
