<style>
    html, body {
        height: 100vh;
        overflow: hidden;
    }
    
    /* Styles pour le globe animé */
    .globe-shadow {
        box-shadow: 0 4px 15px rgba(34, 211, 238, 0.3), 0 0 25px rgba(34, 211, 238, 0.2);
    }

    .globe-glow {
        background: linear-gradient(135deg, #0891b2, #22d3ee);
        position: relative;
    }

    .globe-glow::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.4), rgba(8, 145, 178, 0.4));
        filter: blur(3px);
        z-index: -1;
    }

    .rotating-globe {
        animation: rotate-globe 8s linear infinite;
        transform-origin: center;
    }

    @keyframes rotate-globe {
        from {
            transform: rotateY(0deg);
        }
        to {
            transform: rotateY(360deg);
        }
    }

    /* Avion simple qui se déplace horizontalement */
    .transport-plane {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 120px;
        overflow: hidden;
        z-index: 15;
    }

    .realistic-plane {
        position: absolute;
        top: 40px;
        left: -120px;
        font-size: 42px;
        color: #22d3ee;
        text-shadow: 
            0 0 20px rgba(34, 211, 238, 0.8),
            2px 2px 8px rgba(0, 0, 0, 0.3),
            0 0 40px rgba(34, 211, 238, 0.6);
        animation: realistic-flight 15s linear infinite;
        transform: rotate(0deg);
    }

    /* Effet de traînée de neige derrière l'avion */
    .snow-trail {
        position: absolute;
        top: 45px;
        left: -100px;
        width: 150px;
        height: 8px;
        animation: snow-trail-move 15s linear infinite;
    }

    .snow-particle {
        position: absolute;
        width: 3px;
        height: 3px;
        background: rgba(248, 250, 252, 0.9);
        border-radius: 50%;
        box-shadow: 0 0 6px rgba(248, 250, 252, 0.6);
        animation: snow-drift 2s ease-in-out infinite;
    }

    .snow-particle:nth-child(1) { left: 10%; animation-delay: 0s; }
    .snow-particle:nth-child(2) { left: 25%; animation-delay: 0.3s; }
    .snow-particle:nth-child(3) { left: 45%; animation-delay: 0.6s; }
    .snow-particle:nth-child(4) { left: 65%; animation-delay: 0.9s; }
    .snow-particle:nth-child(5) { left: 85%; animation-delay: 1.2s; }

    @keyframes realistic-flight {
        0% {
            left: -120px;
            transform: translateY(0px);
        }
        100% {
            left: calc(100vw + 120px);
            transform: translateY(0px);
        }
    }

    @keyframes snow-trail-move {
        0% {
            left: -100px;
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            left: calc(100vw + 100px);
            opacity: 0;
        }
    }

    @keyframes snow-drift {
        0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 1;
        }
        25% {
            transform: translateY(-3px) translateX(-2px) scale(1.2);
            opacity: 0.8;
        }
        50% {
            transform: translateY(2px) translateX(1px) scale(0.9);
            opacity: 0.6;
        }
        75% {
            transform: translateY(-1px) translateX(-1px) scale(1.1);
            opacity: 0.9;
        }
    }

    /* Flocons de neige ambiants */
    .ambient-snow {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 5;
    }

    .snowflake {
        position: absolute;
        color: rgba(248, 250, 252, 0.7);
        font-size: 14px;
        animation: snowfall 15s linear infinite;
        text-shadow: 0 0 8px rgba(248, 250, 252, 0.5);
    }

    .snowflake:nth-child(1) { left: 5%; animation-delay: 0s; font-size: 12px; }
    .snowflake:nth-child(2) { left: 25%; animation-delay: 3s; font-size: 16px; }
    .snowflake:nth-child(3) { left: 45%; animation-delay: 6s; font-size: 10px; }
    .snowflake:nth-child(4) { left: 65%; animation-delay: 9s; font-size: 14px; }
    .snowflake:nth-child(5) { left: 85%; animation-delay: 12s; font-size: 12px; }

    @keyframes snowfall {
        0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }

    /* Effets hover améliorés pour les cartes */
    .card-hover {
        transform: translateY(0);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .card-hover:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 50px rgba(34, 211, 238, 0.15);
    }

    /* Gradient animé en arrière-plan */
    .animated-bg {
        background: linear-gradient(-45deg, #0f172a, #1e293b, #0f172a, #334155);
        background-size: 400% 400%;
        animation: gradient-shift 15s ease infinite;
    }

    @keyframes gradient-shift {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }

    /* Effet de lueur froide pour l'ambiance hivernale */
    .winter-glow {
        background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1), transparent 70%);
    }

    /* Classe pour faire tourner le spinner seulement quand nécessaire */
    .spinner-active {
        animation: fa-spin 2s infinite linear;
    }

    @keyframes fa-spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>

<section class="h-screen animated-bg flex flex-col items-center justify-center relative overflow-hidden">
    <div class="transport-plane">
        <div class="realistic-plane">
            <i class="fas fa-plane"></i>
        </div>
    </div>

    <div class="absolute inset-0">
        <div class="absolute top-10 left-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse winter-glow"></div>
        <div class="absolute bottom-10 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse winter-glow" style="animation-delay: 1s;"></div>
        <div class="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-400/8 rounded-full blur-3xl animate-pulse winter-glow" style="animation-delay: 2s;"></div>
        <div class="absolute bottom-1/3 right-1/4 w-80 h-80 bg-sky-400/8 rounded-full blur-3xl animate-pulse winter-glow" style="animation-delay: 3s;"></div>
    </div>
    
    <div class="container mx-auto px-8 relative z-20 flex flex-col items-center justify-center h-full">
        <!-- Header avec logo globe animé officiel -->
        <div class="text-center mb-16">
            <div class="inline-flex items-center justify-center w-28 h-28 bg-cyan-500 rounded-3xl mb-8 globe-shadow globe-glow transform hover:scale-110 transition-transform duration-300">
                <i class="fas fa-globe-americas text-4xl text-white rotating-globe"></i>
            </div>
            <h1 class="text-6xl font-bold mb-4 text-white bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">GPduMonde</h1>
            <p class="text-xl text-gray-300 mb-4 font-medium">Entreprise de Transport de Colis Mondial</p>
            <div class="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
        </div>

        <!-- Cartes principales - Style moderne et attractif -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto w-full">
            <!-- Carte Suivi de Colis -->
            <div class="group h-full">
                <div class="bg-slate-800/80 backdrop-blur-lg rounded-3xl p-10 border border-slate-600/50 hover:border-cyan-400/70 card-hover text-center h-full flex flex-col relative overflow-hidden">
                    <!-- Effet de brillance au survol -->
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div class="w-24 h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-cyan-400/40 transform group-hover:rotate-12 transition-transform duration-300">
                        <i class="fas fa-search text-3xl text-white"></i>
                    </div>
                    <h2 class="text-3xl font-bold text-white mb-6 group-hover:text-cyan-300 transition-colors">Suivi de Colis</h2>
                    <p class="text-gray-300 mb-10 leading-relaxed flex-grow flex items-center justify-center text-lg">
                        Suivez l'état d'avancement de votre colis en temps réel avec notre système de tracking avancé
                    </p>
                    <button onclick="redirectWithSpinner('index.php?page=landing', this)" class="inline-flex items-center px-10 py-5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 rounded-2xl text-white font-bold transition-all duration-300 shadow-xl shadow-cyan-500/25 w-full justify-center mt-auto text-lg transform hover:scale-105">
                        <span class="mr-4 button-text">Accéder au suivi</span>
                        <i class="fas fa-arrow-right button-icon text-xl"></i>
                        <i class="fas fa-spinner button-spinner text-xl" style="display: none;"></i>
                    </button>
                </div>
            </div>

            <!-- Carte Espace Gestionnaire -->
            <div class="group h-full">
                <div class="bg-slate-800/80 backdrop-blur-lg rounded-3xl p-10 border border-slate-600/50 hover:border-cyan-400/70 card-hover text-center h-full flex flex-col relative overflow-hidden">
                    <!-- Effet de brillance au survol -->
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div class="w-24 h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-cyan-400/40 transform group-hover:rotate-12 transition-transform duration-300">
                        <i class="fas fa-user-cog text-3xl text-white"></i>
                    </div>
                    <h2 class="text-3xl font-bold text-white mb-6 group-hover:text-cyan-300 transition-colors">Espace Gestionnaire</h2>
                    <p class="text-gray-300 mb-10 leading-relaxed flex-grow flex items-center justify-center text-lg">
                        Gérez vos cargaisons, clients et opérations avec notre interface de gestion complète
                    </p>
                    <button onclick="redirectWithSpinner('/login', this)" class="inline-flex items-center px-10 py-5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 rounded-2xl text-white font-bold transition-all duration-300 shadow-xl shadow-cyan-500/25 w-full justify-center mt-auto text-lg transform hover:scale-105">
                        <span class="mr-4 button-text">Se connecter</span>
                        <i class="fas fa-arrow-right button-icon text-xl"></i>
                        <i class="fas fa-spinner button-spinner text-xl" style="display: none;"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Footer moderne -->
        <div class="mt-16">
            <p class="text-gray-400 text-base font-medium">&copy; 2025 GP du Monde. Tous droits réservés.</p>
        </div>
    </div>
</section>

<!-- FontAwesome pour les icônes -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

<script>
function redirectWithSpinner(url, button) {
    // Cacher le texte et l'icône, montrer le spinner
    const text = button.querySelector('.button-text');
    const icon = button.querySelector('.button-icon');
    const spinner = button.querySelector('.button-spinner');
    
    text.style.opacity = '0.7';
    icon.classList.add('hidden');
    spinner.style.display = 'inline-block'; // Afficher le spinner
    spinner.classList.add('spinner-active'); // Ajouter l'animation de rotation
    
    // Désactiver le bouton
    button.disabled = true;
    button.style.opacity = '0.8';
    
    // Rediriger après un court délai pour montrer le spinner
    setTimeout(() => {
        window.location.href = url;
    }, 800);
}
</script>