
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const visualizationsContainer = document.getElementById('visualizationsContainer');
const Text = document.getElementById("centerMessage");


// Lorsque les filtres sont appliqués, cacher le menu de filtres et afficher les visualisations
applyFiltersBtn.addEventListener('click', function() {
    visualizationsContainer.style.display = 'grid';  // Afficher les visualisations
});

document.addEventListener('DOMContentLoaded', () => {
    const projectDescriptionBtn = document.getElementById('projectDescriptionBtn');
    const projectModal = document.getElementById('projectModal');
    const closeProjectModal = document.getElementById('closeProjectModal');

    // Affiche la modale lorsque le bouton est cliqué
    projectDescriptionBtn.addEventListener('click', () => {
        projectModal.style.display = 'flex';
    });

    // Ferme la modale lorsque le bouton de fermeture est cliqué
    closeProjectModal.addEventListener('click', () => {
        projectModal.style.display = 'none';
    });

    // Ferme la modale si l'utilisateur clique en dehors du contenu
    window.addEventListener('click', (event) => {
        if (event.target === projectModal) {
            projectModal.style.display = 'none';
        }
    });
});

