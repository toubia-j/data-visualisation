// Global variables
let csvData = [];
let displayPercentage = false;
let colorsUsed = [];
const svg = d3.select("#bubbleChart");  // On sélectionne l'élément svg pour le bubble chart
const width = svg.attr("width");
const height = svg.attr("height");
let csvData2 = [];

// Load CSV data
function loadCSVData() {
    d3.csv('heart_2022_no_nans.csv')
        .then(data => {
            csvData2 = data;

            csvData = data;
            console.log("ok")

        })
        .catch(error => {
            console.error('Error loading data:', error);
        });
}

// Initialize the dashboard
function initDashboard() {
    loadCSVData();
    
    // Add event listeners
    document.getElementById("applyFiltersBtn").addEventListener("click", function() {
        // Appeler la première fonction
        filterAndDraw();
        filterAndDraw2();
        logFilteredValues(csvData2);
        filterAndDrawVisu4();
        drawUSMap();

    });    document.querySelector('.percentage-toggle-btn').addEventListener('click', togglePercentage);
    document.querySelector('.color-change-btn').addEventListener('click', showColorPicker);

const physicalActivityFilter = document.getElementById('physicalActivityFilter');
const physicalActivityValue = document.getElementById('physicalActivityValue');



  // Ajouter un événement pour mettre à jour le texte du span en fonction de la valeur du range
  physicalActivityFilter.addEventListener('input', function() {
    physicalActivityValue.textContent = `${physicalActivityFilter.value} jours`;

});

const sleepHoursFilter = document.getElementById('sleepHoursFilter');
const sleepHoursValue = document.getElementById('sleepHoursValue');

// Ajouter un événement pour mettre à jour le texte du span en fonction de la valeur du range
sleepHoursFilter.addEventListener('input', function() {
    // Mettre à jour le texte dans le span en fonction de la valeur du range
    sleepHoursValue.textContent = `${sleepHoursFilter.value} heures`;
});




}

// Filter data and update visualization
function filterAndDraw() {
    const ageFilter = parseInt(document.getElementById("ageFilter").value);
    const sexFilter = document.getElementById("sexFilter").value.trim();

    if (isNaN(ageFilter)) {
        alert("Please enter a valid age.");
        return;
    }

    // Filter data based on age and sex
    const filteredData = csvData.filter(row => {
        const ageMatch = new RegExp(`.*${ageFilter}.*`).test(row.AgeCategory);
        const matchesSex = (sexFilter === "" || row.Sex === sexFilter);
        return ageMatch && matchesSex;
    });

    if (filteredData.length === 0) {
        alert(`No data found for age "${ageFilter}" and sex "${sexFilter}".`);
        return;
    }

    // Calculate heart attack counts
    const counts = {
        'HeartAttack - Yes': filteredData.filter(row => row.HadHeartAttack === "Yes").length,
        'HeartAttack - No': filteredData.filter(row => row.HadHeartAttack === "No").length
    };

    drawPieChart(counts);
}

// Draw Pie chart
function drawPieChart(data) {
    const container = d3.select("#visualization1");
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;

    // Adjust the radius for proportional size
    const radius = Math.min(width, height) / 3;

    // Clear previous content
    container.selectAll("svg").remove();
    container.selectAll(".legend").remove();

    // Create SVG with viewBox for responsiveness
    const svg = container.append("svg")
        .attr("width", "150%")  // Using 100% instead of fixed value
        .attr("height", "150%") // Using 100% instead of fixed value
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet") // Maintain proportions
        .append("g")
        .attr("transform", `translate(${(width / 2) - 50}, ${(height / 2) - 25})`);

    // Set up pie chart
    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().outerRadius(radius).innerRadius(0);

    const color = d3.scaleOrdinal(["#4CAF50", "#F44336"]);
    const pieData = pie(Object.entries(data));

    // Draw arcs
    const arcs = svg.selectAll(".arc")
        .data(pieData)
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("d", arc)
        .attr("fill", d => color(d.data[0]));

    // Add percentage labels if enabled
    if (displayPercentage) {
        const total = d3.sum(Object.values(data));
        svg.selectAll(".percentage-label")
            .data(pieData)
            .enter()
            .append("text")
            .attr("class", "percentage-label")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .style("fill", "#fff")
            .style("font-size", "14px")
            .text(d => `${((d.data[1] / total) * 100).toFixed(1)}%`);
    }

    // Create legend with adjusted position
    const legend = container.append("div")
        .attr("class", "legend")
        .style("position", "absolute")
        .style("bottom", "20px")
        .style("right", "20px")
        .style("display", "flex")
        .style("flex-direction", "column");

    const legendItems = legend.selectAll(".legend-item")
        .data(Object.keys(data))
        .enter()
        .append("div")
        .attr("class", "legend-item")
        .style("display", "flex")
        .style("align-items", "center")
        .style("margin", "5px");

    legendItems.append("div")
        .style("width", "20px")
        .style("height", "20px")
        .style("background-color", d => color(d))
        .style("margin-right", "8px");

    legendItems.append("span")
        .text(d => d);

    colorsUsed = Object.keys(data).map(key => color(key));
}

// Add resize event listener for responsiveness
window.addEventListener('resize', () => {
    if (csvData.length > 0) {
        filterAndDraw();
    }
});

// Toggle percentage display
function togglePercentage() {
    displayPercentage = !displayPercentage;
    filterAndDraw();
}

// Show color picker
function showColorPicker() {
    const visualization = document.getElementById('visualization1');
    const colorPairs = [
        ["#FF5733", "#33FF57"],
        ["#3357FF", "#F733FF"],
        ["#57FF33", "#5733FF"]
    ];

    const picker = document.createElement('div');
    picker.className = 'color-picker';
    picker.style.cssText = `
        position: absolute;
        top: 40px;
        left: 10px;
        background-color: #333;
        padding: 10px;
        border-radius: 5px;
        z-index: 1000;
    `;

    colorPairs.forEach(pair => {
        const option = document.createElement('div');
        option.style.cssText = `
            display: flex;
            margin-bottom: 5px;
            cursor: pointer;
        `;

        pair.forEach(color => {
            const colorBox = document.createElement('div');
            colorBox.style.cssText = `
                width: 20px;
                height: 20px;
                background-color: ${color};
                margin-right: 5px;
            `;
            option.appendChild(colorBox);
        });

        option.onclick = () => {
            updateColors(pair);
           if (picker) {
    picker.remove();
} else {
    console.error("Le picker n'existe pas dans le DOM.");
}
        };


        picker.appendChild(option);
    });

    visualization.appendChild(picker);
}

// Update chart colors
function updateColors(colorPair) {
    d3.select("#visualization1")
        .selectAll(".arc")
        .attr("fill", (d, i) => colorPair[i % colorPair.length]);

    d3.select("#visualization1")
        .selectAll(".legend-item div")
        .style("background-color", (d, i) => colorPair[i % colorPair.length]);

    colorsUsed = colorPair;
}




// Sélectionner le bouton qui va déclencher l'affichage de la modale
const messageBtn = document.querySelector('.message-btn');

// Sélectionner la modale et le bouton de fermeture
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close-btn');

// Ajouter un événement de clic sur le bouton pour afficher la modale
messageBtn.addEventListener('click', () => {
    modal.style.display = 'flex'; // Afficher la modale
});


// Optionnel : Fermer la modale si l'utilisateur clique en dehors de la boîte modale
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none'; // Masquer la modale
    }
});



///////////////////////////////////////////////////////////////////////////////////////////////////




function filterAndDraw2() {
    // Récupérer les valeurs des filtres
    const sexFilter = document.getElementById("sexFilter").value.trim();
    const hadCovidFilter = document.querySelector('input[name="hadCovid"]:checked')?.value;
    const smokingStatusFilter = document.getElementById("smokingStatusFilter").value;

    console.log("Filtres appliqués : ", sexFilter, hadCovidFilter, smokingStatusFilter);

    // Filtrer les données si nécessaire, sinon utiliser csvData2 directement
    const data = csvData2;

    // Créer les groupes possibles en combinant les valeurs de Sex, CovidPos, SmokerStatus
    const groups = Array.from(new Set(data.map(d => `${d.Sex}-${d.CovidPos}-${d.SmokerStatus}`)));

    // Compter le nombre de lignes pour chaque groupe
    const groupCounts = groups.map(group => {
        const groupData = data.filter(d => `${d.Sex}-${d.CovidPos}-${d.SmokerStatus}` === group);
        return { group, count: groupData.length };
    });

    // Afficher les résultats dans la console
    console.log("Nombre de lignes pour chaque groupe :");
    groupCounts.forEach(group => {
        console.log(`${group.group}: ${group.count}`);
    });

    // Filtrer le groupe correspondant aux filtres appliqués
    const filteredGroup = groupCounts.filter(group => {
        const [sex, covid, smoking] = group.group.split('-');
        const matchesSex = (sexFilter === "" || sex === sexFilter);
        const matchesCovid = (hadCovidFilter === "" || covid === hadCovidFilter);
        const matchesSmoking = (smokingStatusFilter === "" || smoking === smokingStatusFilter);
        return matchesSex && matchesCovid && matchesSmoking;
    });

    // Vérifier s'il existe des groupes filtrés et passer les données à drawBubbleChart
    if (filteredGroup.length > 0) {
        console.log("Groupe correspondant aux filtres appliqués :");
        console.log(filteredGroup);
        drawBubbleChart(groupCounts, filteredGroup); // Passer les groupes filtrés à drawBubbleChart
    } else {
        console.log("Aucun groupe ne correspond aux filtres appliqués.");
    }
}

function drawBubbleChart(groupCounts, filteredGroups) {
    const width = 500; // Largeur du conteneur
    const height = 400; // Hauteur du conteneur

    // Sélectionner l'élément SVG
    const svg = d3.select("#bubbleChart")
                  .attr("width", width)
                  .attr("height", height);

    // Définir l'échelle horizontale pour répartir les bulles uniformément
    const xScale = d3.scaleBand()
        .domain(d3.range(groupCounts.length))
        .range([100, width - 100])
        .padding(0.2);

    // Définir l'échelle du rayon des bulles
    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(groupCounts.map(d => d.count))]) // Valeur max des données
        .range([0, 50]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const bubbles = svg.selectAll(".bubble")
        .data(groupCounts)
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .attr("r", d => radiusScale(d.count))
        .style("fill", (d) => {
            
            if (d.group === filteredGroups[0].group) {
                return "red";
            } else {
                return colorScale(d.group); 
            }
        })
        .style("opacity", 0.7)
        .style("stroke", "black")
        .style("stroke-width", 2);



 
    const simulation = d3.forceSimulation(groupCounts)
        .force("x", d3.forceX(d => xScale(groupCounts.indexOf(d))).strength(0.5))
        .force("y", d3.forceY(height / 4).strength(0.5))  // Centré verticalement
        .force("collide", d3.forceCollide(d => radiusScale(d.count) + 2)) // Force de repulsion
        .on("tick", ticked);

    function ticked() {
        bubbles
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "lightgrey")
        .style("padding", "5px")
        .style("border-radius", "5px");

    bubbles.on("mouseover", function(event, d) {
            tooltip.text(`Groupe: ${d.group} Count: ${d.count}`)
                .style("visibility", "visible");
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY + 5) + "px")
                .style("left", (event.pageX + 5) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });
}


document.addEventListener('DOMContentLoaded', initDashboard);



const messageBtn2 = document.querySelector('.message-btn2');

// Sélectionner la modale et le bouton de fermeture
const modal2 = document.getElementById('modal2');
const closeBtn2 = document.querySelector('.close-btn2');

// Ajouter un événement de clic sur le bouton pour afficher la modale
messageBtn2.addEventListener('click', () => {
    modal2.style.display = 'flex'; // Afficher la modale
});


window.addEventListener('click', (event) => {
    if (event.target === modal2) {
        modal2.style.display = 'none'; // Masquer la modale
    }
});

////////////////////////////////////////////////////////////////////////////////////////






function logFilteredValues(data) {
    const sleepHoursFilter = document.getElementById('sleepHoursFilter');
    const physicalActivity = document.getElementById('physicalActivityFilter').value;
    const sexFilter = document.getElementById('sexFilter');
    const selectedSex = sexFilter.value.trim();
    const selectedSleepHours = sleepHoursFilter.value;

    let sameSexCountYes = 0;
    let sameSleepHoursCountYes = 0;
    let samePhysicalActivityCountYes = 0;
    let sameSexCountNo = 0;
    let sameSleepHoursCountNo = 0;
    let samePhysicalActivityCountNo = 0;

    data.forEach(d => {
        if (d.Sex === selectedSex) {
            if (d.HadHeartAttack === "Yes") {
                sameSexCountYes++;
            } else {
                sameSexCountNo++;
            }
        }

        if (parseInt(d.SleepHours, 10) === parseInt(selectedSleepHours, 10)) {
            if (d.HadHeartAttack === "Yes") {
                sameSleepHoursCountYes++;
            } else {
                sameSleepHoursCountNo++;
            }
        }

        if (parseInt(d.PhysicalHealthDays, 10) === parseInt(physicalActivity, 10)) {
            if (d.HadHeartAttack === "Yes") {
                samePhysicalActivityCountYes++;
            } else {
                samePhysicalActivityCountNo++;
            }
        }
    });

    // Préparer les données pour le graphique radar
    const radarDataYes = [
        { axis: "Même Sexe", value: sameSexCountYes },
        { axis: "Même Heures de Sommeil", value: sameSleepHoursCountYes },
        { axis: "Même Activité Physique", value: samePhysicalActivityCountYes }
    ];

    const radarDataNo = [
        { axis: "Même Sexe", value: sameSexCountNo },
        { axis: "Même Heures de Sommeil", value: sameSleepHoursCountNo },
        { axis: "Même Activité Physique", value: samePhysicalActivityCountNo }
    ];

    // Appeler la fonction pour dessiner le graphique radar avec les deux jeux de données
    drawRadarChart("#radarChart", radarDataYes, radarDataNo);
}
function drawRadarChart(containerId, radarDataYes, radarDataNo) {
    const width = 450;
    const height = 270;
    const radius = Math.min(width, height) / 2 - 20;
    const angleSlice = (2 * Math.PI) / radarDataYes.length;

    // Supprimer le graphique précédent
    d3.select(containerId).selectAll("*").remove();

    // Configurer le conteneur SVG
    const svg = d3.select(containerId)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Créer les axes du radar
    radarDataYes.forEach((d, i) => {
        const angle = angleSlice * i;
        svg.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", radius * Math.cos(angle - Math.PI / 2))
            .attr("y2", radius * Math.sin(angle - Math.PI / 2))
            .attr("stroke", "black")
            .attr("stroke-width", 3);
    });

    // Relier les axes entre eux pour créer la toile d'araignée
    for (let j = 0; j < radarDataYes.length; j++) {
        const levelFactor = radius;
        svg.append("line")
            .attr("x1", levelFactor * Math.cos(j * angleSlice - Math.PI / 2))
            .attr("y1", levelFactor * Math.sin(j * angleSlice - Math.PI / 2))
            .attr("x2", levelFactor * Math.cos((j + 1) % radarDataYes.length * angleSlice - Math.PI / 2))
            .attr("y2", levelFactor * Math.sin((j + 1) % radarDataYes.length * angleSlice - Math.PI / 2))
            .attr("stroke", "black")
            .attr("stroke-width", 1);
    }
      // Créer une échelle logarithmique pour certains axes
      const radiusScales = radarDataYes.map((d, i) => {
        const maxValYes = Math.max(...radarDataYes.map(d => d.value)); 
        const maxValNo = Math.max(...radarDataNo.map(d => d.value));

        // Si la valeur maximale est supérieure à un certain seuil (par exemple, 1000), on utilise l'échelle logarithmique
        if (maxValYes > 1000 || maxValNo > 1000) {
            return d3.scaleLog().domain([1, Math.max(maxValYes, maxValNo)]).range([0, radius]);
        } else {
            return d3.scaleLinear().domain([0, Math.max(maxValYes, maxValNo)]).range([0, radius]);
        }
    });

    // Créer les polygones pour "Yes" et "No"
    const line = d3.lineRadial()
        .radius((d, i) => radiusScales[i](d.value)) // Utilisation de l'échelle spécifique à chaque axe
        .angle((d, i) => i * angleSlice)
        .curve(d3.curveLinearClosed);

    const line2 = d3.lineRadial()
        .radius((d, i) => radiusScales[i](d.value)) // Utilisation de l'échelle spécifique à chaque axe
        .angle((d, i) => i * angleSlice)
        .curve(d3.curveLinearClosed);
        
    // Polygone pour "Yes" (HadHeartAttack = "Yes")
    const yes=svg.append("path")
        .datum(radarDataYes)
        .attr("d", line)
        .attr("fill", "rgb(11, 248, 3)") // Couleur du polygone "Yes"
        .attr("stroke", "#4c6f91")
        .attr("stroke-width", 1);

        yes.on("mouseover", function (event, d) {
            tooltip.text("Heart Attack Yes: " + d.map(e => `${e.axis}: ${e.value}`).join(", "))
                .style("visibility", "visible")
                .style("top", (event.pageY + 5) + "px")
                .style("left", (event.pageX + 5) + "px");
        })
        .on("mouseout", function() {
            d3.select("#tooltip")
                .style("visibility", "hidden");
        });
        const sumYes = radarDataYes.reduce((acc, item) => acc + item.value, 0);
        const sumNo = radarDataNo.reduce((acc, item) => acc + item.value, 0);
    // Polygone pour "No" (HadHeartAttack = "No")
    svg.append("path")
        .datum(radarDataNo)
        .attr("d", line2)
        .attr("fill", "rgba(249, 0, 0, 0.62)") // Couleur du polygone "No"
        .attr("stroke", "#4c6f91")
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
            const mousePos = d3.pointer(event);
            d3.select("#tooltip")
                .style("visibility", "visible")
                .style("left", (mousePos[0] ) + "px")
                .style("top", (mousePos[1] ) + "px")
                .text(`Had Heart Attack Yes: ${sumYes}, No: ${sumNo}`);
            })
        .on("mouseout", function() {
            d3.select("#tooltip")
                .style("visibility", "hidden");
        });

        

    // Ajouter des cercles concentriques pour chaque niveau (grille)
    const levels = 5;
    for (let i = 0; i < levels; i++) {
        const levelRadius = radius * (i + 1) / levels;
        svg.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", levelRadius)
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 1);
    }

    // Ajouter les labels pour chaque axe
    radarDataYes.forEach((d, i) => {
        const angle = angleSlice * i;
        svg.append("text")
            .attr("x", (radius + 15) * Math.cos(angle - Math.PI / 2))
            .attr("y", (radius + 15) * Math.sin(angle - Math.PI / 2))
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(d.axis);
    });
    
}


const messageBtn3 = document.querySelector('.message-btn3');

// Sélectionner la modale et le bouton de fermeture
const modal3 = document.getElementById('modal3');
const closeBtn3 = document.querySelector('.close-btn3');

// Ajouter un événement de clic sur le bouton pour afficher la modale
messageBtn3.addEventListener('click', () => {
    modal3.style.display = 'flex'; // Afficher la modale
});


// Optionnel : Fermer la modale si l'utilisateur clique en dehors de la boîte modale
window.addEventListener('click', (event) => {
    if (event.target === modal3) {
        modal3.style.display = 'none'; // Masquer la modale
    }
});

///////////////////////////////////////////////////




function filterAndDrawVisu4() {
    const healthStatusFilter = document.getElementById("healthStatusFilter").value;
    const physicalActivityFilter = parseInt(document.getElementById("physicalActivityFilter").value);
    const sleepHoursFilter = parseInt(document.getElementById("sleepHoursFilter").value);
    const smokingStatusFilter = document.getElementById("smokingStatusFilter").value;
    const hadCovidFilter = document.querySelector('input[name="hadCovid"]:checked')?.value;
    const selectedConditions = Array.from(document.querySelectorAll('input[name="healthCondition"]:checked')).map(input => input.value);

    console.log("Filtres sélectionnés :");
    console.log("État de santé général :", healthStatusFilter);
    console.log("Activité physique (jours) :", physicalActivityFilter);
    console.log("Heures de sommeil :", sleepHoursFilter);
    console.log("Statut de fumeur :", smokingStatusFilter);
    console.log("A eu le Covid :", hadCovidFilter);
    console.log("Conditions spécifiques :", selectedConditions);

    const filteredData = csvData.filter(row => {
        const matchesHealthStatus = (healthStatusFilter === "" || row.GeneralHealth === healthStatusFilter);
        const matchesSmokingStatus = (smokingStatusFilter === "" || row.SmokerStatus === smokingStatusFilter);
        const matchesPhysicalActivity = (!isNaN(physicalActivityFilter) && row.PhysicalHealthDays >= physicalActivityFilter);
       const matchesSleepHours = (!isNaN(sleepHoursFilter) && row.SleepHours >= sleepHoursFilter);
        const matchesHadCovid = (!hadCovidFilter || row.CovidPos === hadCovidFilter);
       const matchesConditions = selectedConditions.every(condition => row[condition] === "Yes");

        return matchesHealthStatus && matchesSmokingStatus  && matchesSleepHours &&
            matchesPhysicalActivity && matchesHadCovid && matchesConditions;
    });


    console.log("Données filtrées :", filteredData);

    // Vérification si aucune donnée ne correspond
    if (filteredData.length === 0) {
        alert("Aucune donnée ne correspond aux filtres appliqués.");
        return;
    }

 // Liste des catégories d'âge pré-définies
 const allAgeCategories = Array.from(new Set(csvData.map(row => row.AgeCategory)));
 console.log("allAgeCategories:", allAgeCategories);

// Initialiser les données avec toutes les catégories d'âge possibles
const counts = {};
allAgeCategories.forEach(ageCategory => {
    counts[ageCategory] = { HeartAttackYes: 0, HeartAttackNo: 0 };
});

// Remplir les données en fonction de filteredData
filteredData.forEach(row => {
    const ageCategory = row.AgeCategory;
    if (counts[ageCategory]) {
        if (row.HadHeartAttack === "Yes") counts[ageCategory].HeartAttackYes++;
        else counts[ageCategory].HeartAttackNo++;
    }
});

console.log("Données calculées pour les graphiques :", counts);

// Appeler la fonction pour dessiner le graphique
drawBarChart(counts);

}


function drawBarChart(counts) {
    const container = d3.select("#visualization4");
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;

    // Nettoyer le conteneur
    container.selectAll("svg").remove();

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(70, 15)");

    // Définir l'échelle pour l'axe X (les catégories d'âge)
    const xScale = d3.scaleBand()
        .domain(Object.keys(counts)) // Catégories d'âge
        .range([0, width - 100])
        .padding(0.2);

    // Définir l'échelle pour l'axe Y (les nombres de personnes)
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(Object.values(counts), d => Math.max(d.HeartAttackYes, d.HeartAttackNo))]) // La plage des valeurs
        .range([height - 50, 0]);

    // Axes
    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - 50})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Ajouter les labels des axes
    svg.append("text")

        .attr("transform", `translate(${width -85}, ${height -35 })`)  // Position du label X
        .style("text-anchor", "middle")

        .text("Age");


    svg.append("text")

        .attr("y", 11)
        .attr("x", -height +300)  // Position du label Y
        .style("text-anchor", "top")
        .text("Count");

    // Appliquer la rotation à l'axe X après sa création
    xAxis.selectAll("text")
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-20)")  // Rotation des labels de l'axe des X
        .attr("dx", "-4em")
        .attr("dy", "-0.5em");

    // Préparer les données pour les lignes
    const heartAttackYesData = Object.entries(counts).map(([ageCategory, counts]) => ({
        ageCategory,
        value: counts.HeartAttackYes
    }));

    const heartAttackNoData = Object.entries(counts).map(([ageCategory, counts]) => ({
        ageCategory,
        value: counts.HeartAttackNo
    }));

    // Créer les lignes
    const lineHeartAttackYes = d3.line()
        .x(d => xScale(d.ageCategory) + xScale.bandwidth() / 2) // Position X
        .y(d => yScale(d.value)); // Position Y

    const lineHeartAttackNo = d3.line()
        .x(d => xScale(d.ageCategory) + xScale.bandwidth() / 2) // Position X
        .y(d => yScale(d.value)); // Position Y

    // Dessiner les lignes
    svg.append("path")
        .data([heartAttackYesData])
        .attr("class", "line-heart-yes")
        .attr("d", lineHeartAttackYes)
        .attr("fill", "none")
        .attr("stroke", "#4CAF50")
        .attr("stroke-width", 2);

    svg.append("path")
        .data([heartAttackNoData])
        .attr("class", "line-heart-no")
        .attr("d", lineHeartAttackNo)
        .attr("fill", "none")
        .attr("stroke", "#F44336")
        .attr("stroke-width", 2);

    // Ajouter des points sur la ligne pour chaque catégorie
    const dotsHeartYes =svg.selectAll(".dot-heart-yes")
        .data(heartAttackYesData)
        .enter()
        .append("circle")
        .attr("class", "dot-heart-yes")
        .attr("cx", d => xScale(d.ageCategory) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.value))
        .attr("r", 2)
        .attr("fill", "#4CAF50");

        const dotsHeartNo =svg.selectAll(".dot-heart-no")
        .data(heartAttackNoData)
        .enter()
        .append("circle")
        .attr("class", "dot-heart-no")
        .attr("cx", d => xScale(d.ageCategory) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.value))
        .attr("r", 2)
        .attr("fill", "#F44336");


        const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "rgba(0, 0, 0, 0.6)")
        .style("color", "white")
        .style("padding", "5px")
        .style("border-radius", "5px");

    
  
dotsHeartYes.on("mouseover", function(event, d) {
    tooltip.text(`Age: ${d.ageCategory}, Heart Attack Yes: ${d.value}`)
        .style("visibility", "visible")
        .style("top", (event.pageY + 5) + "px")
        .style("left", (event.pageX + 5) + "px");
})
.on("mousemove", function(event) {
    tooltip.style("top", (event.pageY + 5) + "px")
        .style("left", (event.pageX + 5) + "px");
})
.on("mouseout", function() {
    tooltip.style("visibility", "hidden");
});

// Ajouter des tooltips aux points (HeartAttackNo)
dotsHeartNo.on("mouseover", function(event, d) {
    tooltip.text(`Age: ${d.ageCategory}, Heart Attack No: ${d.value}`)
        .style("visibility", "visible")
        .style("top", (event.pageY + 5) + "px")
        .style("left", (event.pageX + 5) + "px");
})
.on("mousemove", function(event) {
    tooltip.style("top", (event.pageY + 5) + "px")
        .style("left", (event.pageX + 5) + "px");
})
.on("mouseout", function() {
    tooltip.style("visibility", "hidden");
});

}



const messageBtn4 = document.querySelector('.message-btn4');

// Sélectionner la modale et le bouton de fermeture
const modal4 = document.getElementById('modal4');
const closeBtn4 = document.querySelector('.close-btn4');

// Ajouter un événement de clic sur le bouton pour afficher la modale
messageBtn4.addEventListener('click', () => {
    modal4.style.display = 'flex'; // Afficher la modale
});


// Optionnel : Fermer la modale si l'utilisateur clique en dehors de la boîte modale
window.addEventListener('click', (event) => {
    if (event.target === modal4) {
        modal4.style.display = 'none'; // Masquer la modale
    }
});



////////////////////////////////////////

// Fonction pour dessiner la carte US
function drawUSMap() {
    // On charge d’abord le JSON du tracé des états
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(us => {
        
        // Puis on charge les données CSV
        d3.csv("heart_2022_no_nans.csv").then(data => {
            
            // Sélection du conteneur (identique aux autres visualisations)
            const container = d3.select("#visualization5");
            
            // On récupère ses dimensions pour calibrer le SVG
            const containerRect = container.node().getBoundingClientRect();
            const margin = { top: 20, right: 80, bottom: 20, left: 20 };
            const width = containerRect.width - margin.left - margin.right;
            const height = containerRect.height - margin.top - margin.bottom;

            // Pour éviter de cumuler plusieurs SVG, on nettoie avant d’en créer un nouveau
            container.selectAll("svg").remove();

            // Création du SVG
            const svg = container
                .append("svg")
                .attr("width", containerRect.width)
                .attr("height", containerRect.height)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // On définit une projection adaptée à la largeur/hauteur calculées
            const projection = d3.geoAlbersUsa()
                .scale(width * 0.9)
                .translate([width / 2, height / 2]);

            const path = d3.geoPath().projection(projection);

            // On agrège les données : calcul du pourcentage de personnes ayant eu une crise cardiaque par État
            const stateData = d3.rollup(
                data,
                v => v.filter(d => d.HadHeartAttack === "Yes").length / v.length,
                d => d.State
            );

            // Échelle de couleurs (linéaire) pour représenter ce pourcentage
            const maxValue = d3.max(stateData.values());
            const colorScale = d3.scaleLinear()
                .domain([0, maxValue])
                .range(["#b8d8be", "#ff4c4c"]);  // vert pâle -> rouge

            // Dessin de la carte
            svg.append("g")
                .selectAll("path")
                .data(topojson.feature(us, us.objects.states).features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", d => {
                    const stateName = d.properties.name;
                    return stateData.has(stateName)
                        ? colorScale(stateData.get(stateName))
                        : "#ccc"; // pas de données => gris
                })
                .attr("stroke", "#333")
                .attr("stroke-width", 1.5)
                .append("title")
                .text(d => {
                    const stateName = d.properties.name;
                    if (stateData.has(stateName)) {
                        const pct = (stateData.get(stateName) * 100).toFixed(2);
                        return `${stateName} : ${pct}% ont eu une crise cardiaque.`;
                    }
                    return `${stateName} : Pas de données`;
                });

            // Légende (axe vertical à droite)
            // Position en x = width + un petit décalage, y = 20
            const legend = svg.append("g")
                .attr("transform", `translate(${width + 20}, 20)`);

            // On se base sur une échelle qui va de 0 à maxValue pour positionner la légende
            const legendScale = d3.scaleLinear()
                .domain([0, maxValue])
                .range([0, 200]);

            const legendAxis = d3.axisRight(legendScale)
                .ticks(5)
                .tickFormat(d3.format(".0%")); // format pourcentage (0-100%)

            // Dégradé pour la barre de couleurs
            const gradient = svg.append("defs")
                .append("linearGradient")
                .attr("id", "legendGradient")
                .attr("x1", "0%").attr("x2", "0%")
                .attr("y1", "100%").attr("y2", "0%");

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#b8d8be");
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#ff4c4c");

            // Rectangle avec le dégradé
            legend.append("rect")
                .attr("width", 15)
                .attr("height", 200)
                .style("fill", "url(#legendGradient)");

            // L’axe de la légende
            legend.append("g")
                .attr("transform", "translate(15,0)")
                .call(legendAxis);

            // Titre de la légende
            legend.append("text")
                .attr("x", 0)
                .attr("y", -10)
                .text("% Had Heart Attack")
                .attr("font-size", "12px")
                .attr("fill", "black");

        }); // fin du chargement CSV
    }).catch(error => {
        console.error("Error loading map data:", error);
    });
}

// Bouton et modale pour la 5ᵉ visualisation (carte US)
const messageBtn5 = document.querySelector('.message-btn5');
const modal5 = document.getElementById('modal5');
const closeBtn5 = document.querySelector('.close-btn5');

messageBtn5.addEventListener('click', () => {
    modal5.style.display = 'flex'; // Ouvre la popup
});

closeBtn5.addEventListener('click', () => {
    modal5.style.display = 'none'; // Ferme la popup
});

// Si l'utilisateur clique en dehors de la boîte, fermer la modale
window.addEventListener('click', (event) => {
    if (event.target === modal5) {
        modal5.style.display = 'none';
    }
});


