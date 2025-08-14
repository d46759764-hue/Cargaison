import { ColisManager } from "./services/ColisManager";
class EnregistrementColis {
    constructor() {
        this.selectedCargaisonData = null;
        this.currentColisData = null;
        this.modal = null;
        this.confirmButton = null;
        this.colisManager = new ColisManager();
        this.initializeEventListeners();
        this.initializeModals();
    }
    initializeEventListeners() {
        // Écouter le changement de type de colis - DÉCLENCHEMENT IMMÉDIAT
        const typeColisSelect = document.getElementById('package-product-type');
        if (typeColisSelect) {
            typeColisSelect.addEventListener('change', async (e) => {
                const select = e.target;
                const typeColis = select.value;
                if (!typeColis) {
                    this.showInfo("Veuillez sélectionner un type de colis");
                    return;
                }
                // Ouvrir immédiatement le modal avec le type sélectionné
                await this.ouvrirModalCargaisons(typeColis);
            });
        }
        // Gestion du formulaire principal
        const form = document.getElementById('register-package-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.validerEtEnregistrerColis();
            });
        }
    }
    async ouvrirModalCargaisons(typeColis) {
        console.log('Ouverture du modal pour le type:', typeColis);
        if (!this.modal) {
            this.showError('Interface non disponible. Veuillez recharger la page.');
            return;
        }
        try {
            // Afficher un indicateur de chargement
            this.afficherChargement(true);
            // Récupérer les cargaisons compatibles
            const cargaisons = await this.colisManager.getCargaisonsDisponibles(typeColis);
            console.log('Cargaisons récupérées:', cargaisons);
            this.afficherChargement(false);
            if (cargaisons.length === 0) {
                this.showWarning("Aucune cargaison disponible", `Aucune cargaison ouverte n'est disponible pour les colis de type "${typeColis}". Créez d'abord une cargaison ou vérifiez les cargaisons existantes.`);
                return;
            }
            // Mettre à jour l'affichage du type sélectionné
            const typeDisplay = document.getElementById('colis-type-display');
            if (typeDisplay) {
                typeDisplay.textContent = this.formatTypeAffichage(typeColis);
            }
            // Afficher la liste des cargaisons
            this.renderCargaisons(cargaisons);
            // Ouvrir le modal
            this.modal.classList.remove('opacity-0', 'pointer-events-none');
            console.log('Modal ouvert avec succès');
        }
        catch (error) {
            this.afficherChargement(false);
            console.error('Erreur lors du chargement des cargaisons:', error);
            this.showError("Erreur de connexion. Vérifiez que le serveur JSON est démarré (npm run json).");
        }
    }
    formatTypeAffichage(type) {
        const types = {
            'ALIMENTAIRE': 'Alimentaire',
            'CHIMIQUE': 'Chimique',
            'MATERIEL_FRAGILE': 'Matériel Fragile',
            'MATERIEL_INCASSABLE': 'Matériel Incassable'
        };
        return types[type] || type;
    }
    afficherChargement(afficher) {
        const loadingEl = document.getElementById('cargaisons-loading');
        const listEl = document.getElementById('cargaisons-list');
        if (afficher) {
            if (loadingEl)
                loadingEl.classList.remove('hidden');
            if (listEl)
                listEl.innerHTML = '<div class="text-center py-8 text-gray-400"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><br>Chargement des cargaisons...</div>';
        }
        else {
            if (loadingEl)
                loadingEl.classList.add('hidden');
        }
    }
    async validerEtEnregistrerColis() {
        // Récupérer les données du formulaire
        const typeSelect = document.getElementById('package-product-type');
        const poidsInput = document.getElementById('package-weight');
        const libelleInput = document.getElementById('libelle-produit');
        const colisData = {
            type: typeSelect?.value || '',
            poids: Number(poidsInput?.value) || 0,
            libelle: libelleInput?.value?.trim() || ''
        };
        // Validation des données
        if (!this.validerDonneesColis(colisData)) {
            return;
        }
        // Vérifier qu'une cargaison est sélectionnée
        if (!this.selectedCargaisonData) {
            this.showError("Veuillez d'abord sélectionner une cargaison en choisissant un type de colis.");
            return;
        }
        try {
            console.log('Enregistrement du colis:', colisData, 'dans la cargaison:', this.selectedCargaisonData);
            const result = await this.colisManager.ajouterColisACargaison(this.selectedCargaisonData.id, colisData);
            if (result) {
                this.showSuccessModal("Colis enregistré avec succès !", `Le colis "${colisData.libelle}" (${colisData.poids}kg) a été ajouté à la cargaison ${this.selectedCargaisonData.id}`);
                // Réinitialiser le formulaire
                this.reinitialiserFormulaire();
                this.fermerModal();
            }
        }
        catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            this.showError(error instanceof Error ? error.message : "Erreur lors de l'enregistrement du colis");
        }
    }
    validerDonneesColis(data) {
        if (!data.type) {
            this.showError("Veuillez sélectionner un type de colis");
            return false;
        }
        if (!data.libelle || data.libelle.length < 2) {
            this.showError("Veuillez saisir un libellé valide (minimum 2 caractères)");
            return false;
        }
        if (!data.poids || data.poids <= 0) {
            this.showError("Veuillez saisir un poids valide (supérieur à 0)");
            return false;
        }
        if (data.poids > 1000) {
            this.showWarning("Poids important", "Le poids saisi est très élevé. Veuillez vérifier.");
        }
        return true;
    }
    reinitialiserFormulaire() {
        const form = document.getElementById('register-package-form');
        if (form) {
            form.reset();
        }
        this.selectedCargaisonData = null;
        this.currentColisData = null;
    }
    initializeModals() {
        this.modal = document.getElementById('select-cargaison-modal');
        this.confirmButton = document.getElementById('confirm-selection');
        if (!this.modal) {
            console.error('Modal non trouvé avec ID: select-cargaison-modal');
            return;
        }
        // Écouteur pour fermer le modal
        const closeButton = document.getElementById('close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.fermerModal();
            });
        }
        // Écouteur pour le bouton annuler
        const cancelButton = document.getElementById('cancel-selection');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                this.fermerModal();
            });
        }
        // Écouteur pour le bouton confirmer
        if (this.confirmButton) {
            this.confirmButton.addEventListener('click', () => {
                this.confirmerSelectionCargaison();
            });
        }
        console.log('Modals initialisés avec succès');
    }
    fermerModal() {
        if (this.modal) {
            this.modal.classList.add('opacity-0', 'pointer-events-none');
        }
        this.selectedCargaisonData = null;
        if (this.confirmButton) {
            this.confirmButton.disabled = true;
        }
        console.log('Modal fermé');
    }
    confirmerSelectionCargaison() {
        if (!this.selectedCargaisonData) {
            this.showError("Aucune cargaison sélectionnée");
            return;
        }
        // Fermer le modal et permettre à l'utilisateur de compléter le formulaire
        this.fermerModal();
        // Afficher un message de confirmation
        this.showSuccess(`Cargaison ${this.selectedCargaisonData.id} sélectionnée. Complétez maintenant les informations du colis.`);
        // Mettre le focus sur le champ poids si vide
        const poidsInput = document.getElementById('package-weight');
        if (poidsInput && !poidsInput.value) {
            poidsInput.focus();
        }
    }
    renderCargaisons(cargaisons) {
        const list = document.getElementById('cargaisons-list');
        if (!list) {
            console.error('Liste des cargaisons non trouvée');
            return;
        }
        if (cargaisons.length === 0) {
            list.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <i class="fas fa-inbox text-3xl mb-4"></i>
                    <p>Aucune cargaison disponible pour ce type de colis</p>
                </div>
            `;
            return;
        }
        list.innerHTML = cargaisons.map(cargaison => `
            <div class="cargaison-item bg-gray-600/30 p-4 rounded-lg hover:bg-gray-600/50 transition-colors cursor-pointer border border-transparent hover:border-cyan-400/50"
                 data-id="${cargaison.numero}" data-type="${cargaison.type}">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-cyan-400 font-semibold text-lg">${cargaison.numero}</span>
                    <span class="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">${cargaison.type}</span>
                </div>
                <div class="text-sm text-gray-300 mb-2">
                    <i class="fas fa-route mr-2"></i>${cargaison.lieuDepart.pays} → ${cargaison.lieuArrivee.pays}
                </div>
                <div class="flex items-center justify-between text-xs text-gray-400">
                    <span><i class="fas fa-boxes mr-1"></i>${cargaison.colis?.length || 0}/10 colis</span>
                    <span><i class="fas fa-weight mr-1"></i>${cargaison.poidsMax}kg max</span>
                    <span class="text-green-400"><i class="fas fa-unlock mr-1"></i>OUVERT</span>
                </div>
            </div>
        `).join('');
        // Ajouter les écouteurs d'événements
        list.querySelectorAll('.cargaison-item').forEach(item => {
            item.addEventListener('click', () => this.selectionnerCargaison(item));
        });
        console.log('Cargaisons rendues:', cargaisons.length);
    }
    selectionnerCargaison(item) {
        const id = item.dataset.id;
        const type = item.dataset.type;
        if (!id || !type) {
            console.error('Données de cargaison manquantes');
            return;
        }
        console.log('Cargaison sélectionnée:', { id, type });
        // Désélectionner tous les autres éléments
        document.querySelectorAll('.cargaison-item').forEach(el => {
            el.classList.remove('bg-cyan-500/20', 'border-cyan-400');
        });
        // Sélectionner l'élément actuel
        item.classList.add('bg-cyan-500/20', 'border-cyan-400');
        this.selectedCargaisonData = { id, type };
        if (this.confirmButton) {
            this.confirmButton.disabled = false;
        }
    }
    showSuccessModal(title, message) {
        this.creerToast('success', title, message);
    }
    showError(message) {
        this.creerToast('error', 'Erreur', message);
    }
    showWarning(title, message) {
        this.creerToast('warning', title, message);
    }
    showSuccess(message) {
        this.creerToast('success', 'Succès', message);
    }
    showInfo(message) {
        this.creerToast('info', 'Information', message);
    }
    creerToast(type, title, message) {
        const toastContainer = document.getElementById('toast-root') || this.creerContainerToast();
        const couleurs = {
            success: 'bg-green-600 border-green-500',
            error: 'bg-red-600 border-red-500',
            warning: 'bg-yellow-600 border-yellow-500',
            info: 'bg-blue-600 border-blue-500'
        };
        const icones = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        const toast = document.createElement('div');
        toast.className = `${couleurs[type]} border-l-4 text-white p-4 rounded-lg shadow-lg max-w-sm animate-slide-in mb-3`;
        toast.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <i class="fas ${icones[type]} text-white"></i>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-bold">${title}</h3>
                    <p class="text-sm mt-1">${message}</p>
                </div>
                <button onclick="this.parentElement?.parentElement?.remove()" class="ml-auto text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
    creerContainerToast() {
        let container = document.getElementById('toast-root');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-root';
            container.className = 'fixed top-4 right-4 z-50 space-y-3';
            document.body.appendChild(container);
        }
        return container;
    }
}
// Initialiser la classe quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation de EnregistrementColis');
    new EnregistrementColis();
});
