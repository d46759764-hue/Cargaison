import { ColisManager } from "./services/ColisManager";

interface ColisData {
    type: string;
    poids: number;
    libelle: string;
}

interface CargaisonSelection {
    id: string;
    type: string;
}

class EnregistrementColis {
    private colisManager: ColisManager;
    private selectedCargaisonData: CargaisonSelection | null = null;
    private currentColisData: ColisData | null = null;
    private modal: HTMLElement | null = null;
    private confirmButton: HTMLButtonElement | null = null;

    constructor() {
        this.colisManager = new ColisManager();
        this.initializeEventListeners();
        this.initializeModals();
    }

    private initializeEventListeners(): void {
        // Écouter le changement de type de colis
        const typeColisSelect = document.getElementById('package-product-type') as HTMLSelectElement;
        if (typeColisSelect) {
            typeColisSelect.addEventListener('change', async (e: Event) => {
                const select = e.target as HTMLSelectElement;
                const typeColis = select.value;
                
                if (!typeColis) return;
                
                const poids = (document.getElementById('package-weight') as HTMLInputElement)?.value;
                const libelle = (document.getElementById('libelle-produit') as HTMLInputElement)?.value;

                // Si le poids ou le libellé n'est pas renseigné, on ne fait rien
                if (!poids || !libelle) {
                    return;
                }

                const colisData: ColisData = {
                    type: typeColis,
                    poids: Number(poids),
                    libelle: libelle
                };

                // On n'appelle plus validateColisData ici
                await this.showCargaisonModal(colisData);
            });
        }

        // Supprimer l'événement submit du formulaire puisqu'on gère tout via le select
        const form = document.getElementById('register-package-form');
        if (form) {
            form.addEventListener('submit', (e: Event) => {
                e.preventDefault();
                // La validation et l'envoi seront gérés par handleCargaisonSelection
            });
        }
    }

    private initializeModals(): void {
        this.modal = document.getElementById('select-cargaison-modal');
        this.confirmButton = document.getElementById('confirm-selection') as HTMLButtonElement;

        if (!this.modal) {
            console.error('Modal non trouvé avec ID: select-cargaison-modal');
            return;
        }

        // Écouteur pour fermer le modal
        const closeButton = document.getElementById('close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Écouteur pour le bouton annuler
        const cancelButton = document.getElementById('cancel-selection');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Écouteur pour le bouton confirmer
        if (this.confirmButton) {
            this.confirmButton.addEventListener('click', () => {
                this.handleCargaisonSelection();
            });
        }

        console.log('Modals initialisés');
    }

    private closeModal(): void {
        if (this.modal) {
            this.modal.classList.add('opacity-0', 'pointer-events-none');
        }
        this.selectedCargaisonData = null;
        if (this.confirmButton) {
            this.confirmButton.disabled = true;
        }
        console.log('Modal fermé');
    }

    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault();
        console.log('Soumission du formulaire');
        
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const colisData: ColisData = {
            type: formData.get('package-product-type') as string,
            poids: Number(formData.get('package-weight')),
            libelle: formData.get('libelle-produit') as string
        };

        console.log('Données du colis:', colisData);

        // Validation des données
        if (!this.validateColisData(colisData)) {
            console.log('Validation échouée');
            return;
        }

        console.log('Validation réussie, ouverture du modal');
        await this.showCargaisonModal(colisData);
    }

    private validateColisData(data: ColisData): boolean {
        const validTypes = ['alimentaire', 'chimique', 'materiel-fragile', 'materiel-incassable'];
        
        console.log('Validation des données:', data);

        if (!data.type || !validTypes.includes(data.type)) {
            this.showError("Type de colis invalide ou non sélectionné");
            return false;
        }

        if (!data.libelle || data.libelle.trim() === '') {
            this.showError("Libellé du produit requis");
            return false;
        }

        if (!data.poids || data.poids <= 0) {
            this.showError("Le poids doit être supérieur à 0");
            return false;
        }

        console.log('Validation réussie');
        return true;
    }

    private async handleCargaisonSelection(): Promise<void> {
        if (!this.selectedCargaisonData || !this.currentColisData) {
            console.log('Données manquantes pour la sélection');
            return;
        }

        console.log('Ajout du colis à la cargaison:', this.selectedCargaisonData, this.currentColisData);

        try {
            const result = await this.colisManager.ajouterColisACargaison(
                this.selectedCargaisonData.id, 
                this.currentColisData
            );

            if (result) {
                this.showSuccessModal(
                    "Colis ajouté avec succès", 
                    `Le colis a été ajouté à la cargaison ${this.selectedCargaisonData.id}`
                );
                this.closeModal();
                
                // Réinitialiser le formulaire
                const form = document.getElementById('register-package-form') as HTMLFormElement;
                form?.reset();
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout:', error);
            this.showError(error instanceof Error ? error.message : "Erreur lors de l'ajout du colis");
        }
    }

    private async showCargaisonModal(colisData: ColisData): Promise<void> {
        console.log('Ouverture du modal pour:', colisData);
        
        if (!this.modal) {
            console.error('Modal non trouvé dans le DOM');
            return;
        }

        try {
            const cargaisons = await this.colisManager.getCargaisonsDisponibles(colisData.type);
            console.log('Cargaisons récupérées:', cargaisons);

            if (cargaisons.length === 0) {
                this.showError("Aucune cargaison disponible pour ce type de colis");
                return;
            }

            // Mettre à jour l'affichage des détails du colis
            const typeDisplay = document.getElementById('colis-type-display');
            const poidsDisplay = document.getElementById('colis-poids-display');
            
            if (typeDisplay) typeDisplay.textContent = colisData.type;
            if (poidsDisplay) poidsDisplay.textContent = `${colisData.poids} kg`;

            // Afficher la liste des cargaisons
            this.renderCargaisons(cargaisons);
            
            // Afficher le modal
            this.modal.classList.remove('opacity-0', 'pointer-events-none');
            console.log('Modal affiché');

        } catch (error) {
            console.error('Erreur lors du chargement des cargaisons:', error);
            this.showError("Erreur lors du chargement des cargaisons");
        }
    }

    private renderCargaisons(cargaisons: any[]): void {
        const list = document.getElementById('cargaisons-list');
        if (!list) {
            console.error('Liste des cargaisons non trouvée');
            return;
        }

        list.innerHTML = cargaisons.map(cargaison => `
            <div class="cargaison-item bg-gray-600/30 p-3 rounded-lg hover:bg-gray-600/50 transition-colors cursor-pointer border border-transparent hover:border-cyan-400/50"
                 data-id="${cargaison.numero}" data-type="${cargaison.type}">
                <div class="flex items-center justify-between">
                    <span class="text-cyan-400 font-semibold">${cargaison.numero}</span>
                    <span class="text-sm text-gray-400">${cargaison.type}</span>
                </div>
                <div class="text-sm text-gray-300 mt-1">
                    ${cargaison.lieuDepart.pays} → ${cargaison.lieuArrivee.pays}
                </div>
                <div class="text-xs text-gray-400 mt-1">
                    ${cargaison.colis.length}/10 colis - ${cargaison.poidsMax}kg max
                </div>
            </div>
        `).join('');

        // Ajouter les écouteurs d'événements
        list.querySelectorAll('.cargaison-item').forEach(item => {
            item.addEventListener('click', () => this.selectCargaison(item as HTMLElement));
        });

        console.log('Cargaisons rendues:', cargaisons.length);
    }

    private selectCargaison(item: HTMLElement): void {
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

    private showSuccessModal(title: string, message: string): void {
        // Chercher d'abord le modal de statut
        let modal = document.getElementById('status-modal');
        
        // Si le modal n'existe pas, le créer
        if (!modal) {
            modal = this.createStatusModal();
        }

        const titleEl = modal.querySelector('#status-message');
        const messageEl = modal.querySelector('#status-details');
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;

        modal.classList.remove('opacity-0', 'pointer-events-none');
        
        setTimeout(() => {
            modal.classList.add('opacity-0', 'pointer-events-none');
        }, 3000);

        console.log('Modal de succès affiché');
    }

    private createStatusModal(): HTMLElement {
        const modal = document.createElement('div');
        modal.id = 'status-modal';
        modal.className = 'fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 opacity-0 pointer-events-none transition-opacity duration-300';
        modal.innerHTML = `
            <div class="bg-gray-800/95 rounded-2xl p-6 max-w-md w-full mx-4 border border-green-500/30">
                <div class="text-center">
                    <div class="mb-4">
                        <i class="fas fa-check-circle text-4xl text-green-400"></i>
                    </div>
                    <h3 id="status-message" class="text-xl font-bold text-white mb-2"></h3>
                    <p id="status-details" class="text-gray-300"></p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    private showError(message: string): void {
        console.error('Erreur:', message);
        
        // Créer un toast d'erreur
        const toastContainer = document.getElementById('toast-root') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = 'bg-red-600 border-l-4 border-red-800 text-white p-4 rounded-lg shadow-lg max-w-sm animate-slide-in';
        toast.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <i class="fas fa-exclamation-triangle text-red-200"></i>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-bold">Erreur</h3>
                    <p class="text-sm mt-1">${message}</p>
                </div>
                <button onclick="this.parentElement?.parentElement?.remove()" class="ml-auto text-red-200 hover:text-white">
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

    private createToastContainer(): HTMLElement {
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