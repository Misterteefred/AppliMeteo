const elContainerListeJour = document.querySelector('.containerListeJour')
const elTitresGraphiques = document.querySelectorAll(".titreGraphique");
const elVille = document.querySelector(".ville");
const elBody = document.querySelector('body')
const elCalqueTransition = document.querySelector('.calqueTransition');
const tousLesLiens = document.querySelectorAll('a');

const tableauMois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
let compteur = 1

document.addEventListener("DOMContentLoaded", affichageDonnees);
elContainerListeJour.addEventListener('click', fonctionEcoute)
tousLesLiens.forEach(lien => {lien.addEventListener('click', retourTransition)});

window.onload = () => {    
    setTimeout(() => {
        elCalqueTransition.classList.remove('is-active');
    }, 400);
  
}

function retourTransition(e){
    e.preventDefault();
    let target = e.currentTarget.href; // attention : "currentTarget" pour récupérer l'adresse du lien. (Pas e.target)
    console.log(target)         
    elCalqueTransition.classList.add('is-active');
    setTimeout(() => {
        window.location.href = target;
    }, 400)
    
}


function affichageDonnees(){
   
    let donneesLocalStorage = [];
    donneesLocalStorage = JSON.parse(localStorage.getItem("donneesVille"));
    console.log(donneesLocalStorage)
    const tabJour = donneesLocalStorage[3]
    const donneesParHeure = donneesLocalStorage[2]
    const tabHeure = donneesParHeure.time
    const tabTemp = donneesParHeure.temperature_2m
    const tabCodeIcone = donneesParHeure.weathercode
    const tabVent = donneesParHeure.windspeed_10m
    const tabRafale = donneesParHeure.windgusts_10m
    const tabHumidite = donneesParHeure.relativehumidity_2m
    const tabCouvetureNuageuse = donneesParHeure.cloudcover
    const prefixeLeverSoleil = donneesLocalStorage[1].leverSoleil.slice(0, 2)
    const prefixeCoucherSoleil = donneesLocalStorage[1].coucherSoleil.slice(0, 2)
    const nomVille = donneesLocalStorage[0].ville
    const codeFondEcran = donneesLocalStorage[1].iconeMeteo
    elBody.style.backgroundImage = `linear-gradient(rgba(25, 28, 44, 0.5),rgba(19, 13, 46, 0.5)), url('./ressources/iconesMeteo/fond/${codeFondEcran}.jpg')`;
    elVille.textContent = nomVille

    let indexJour = 0
    for (let i = 24; i<=167; i = i+24){ //cette boucle itère toute les 24 heures
        const jour = tabJour[indexJour]
        indexJour++
        const numJour = tabHeure[i].slice(8,10)
        const indexMois = tabHeure[i].slice(5,7)
        
        const mois = tableauMois[indexMois-1]

        //DOM
        const elDate = document.createElement('div')
        elDate.classList.add('date')
        elDate.textContent = `${jour} ${numJour} ${mois}`
        elContainerListeJour.append(elDate)

        for (let j=i; j<=i+23; j++){ //cette boucle itère toute les heures à partir de la boucle précédente
            const heure = Number(tabHeure[j].slice(11,13))
            const temperature = Math.round(tabTemp[j])
            
            let icone = tabCodeIcone[j]
            switch (icone){
                case 0 :
                //Dans le cas où le ciel est parfaitement dégagé mais qu'il fait nuit alors on prendra l'icone avec la lune. Et même chose avec les deux autres cas.
                if (heure > prefixeCoucherSoleil || heure <= prefixeLeverSoleil){
                    icone = '0n'
                }
                break
                case 1 :
                if (heure > prefixeCoucherSoleil || heure < prefixeLeverSoleil){
                    icone = '1n'
                }
                break
                case 2 :
                if (heure > prefixeCoucherSoleil || heure < prefixeLeverSoleil){
                    icone = '2n'
                }
                break
                default:  icone = tabCodeIcone[j]
            }
            const vent = Math.round(tabVent[j])
            const rafale = Math.round(tabRafale[j])
            const humidite = Math.round(tabHumidite[j])
            
            //Ecriture dans le DOM
            
            const divHeure = document.createElement('div')
            divHeure.classList.add('heure')
            divHeure.textContent = heure + 'h'

            const divTemp = document.createElement('div')
            divTemp.classList.add('temperature')
            divTemp.textContent = temperature + '°'

            const elImg = document.createElement('img')
            elImg.classList.add('icone')
            elImg.setAttribute('src', `./ressources/iconesMeteo/${icone}.svg`)
            elImg.setAttribute('alt', 'iconeMeteo')
            const elBlocIcone = document.createElement('div')
            elBlocIcone.classList.add('blocIcone')
            elBlocIcone.append(elImg)

            const divVent = document.createElement('div')
            divVent.classList.add('vent')
            divVent.textContent = vent + 'km/h'

            const divRafale = document.createElement('div')
            divRafale.classList.add('rafale')
            divRafale.textContent = rafale + 'km/h'

            const divVents = document.createElement('div')
            divVents.classList.add('vents')
            divVents.append(divVent,divRafale)

            const divHumidite = document.createElement('div')
            divHumidite.classList.add('humidite')
            divHumidite.textContent = humidite + '%'

            const divLigne = document.createElement('div')
            divLigne.classList.add('ligne')
            divLigne.append(divHeure,divTemp, elBlocIcone, divVents, divHumidite)

            elContainerListeJour.append(divLigne)        
            
        }
        
        const tableauHeure = ['0h','','2h','','4h','','6h','','8h','','10h','','12h','','14h','','16h','','18h','','20h','','22h','']
            
        const tabTempJournee = tabTemp.slice(i,i+24)
        const tabVentJournee = tabVent.slice(i,i+24)
        const tabRafalesJournee = tabRafale.slice(i,i+24)
        const tabHumiditeJournee = tabHumidite.slice(i,i+24)
        const tabCouvetureNuageuseJournee = tabCouvetureNuageuse.slice(i,i+24)

        //chaque graphique du DOM doit avoir une classe différente
        //Le compteur est incrémenté plus bas
        let classGraphTemp = 'graphTemp'+ compteur
        let classGraphVent = 'graphVent'+ compteur
        let classGraphRafales = 'graphRafales'+ compteur
        let classGraphCloudsCover = 'graphCloudsCover'+ compteur
        let classGraphHumidite = 'graphHumidite'+ compteur
        
        elContainerListeJour.append(creationGraphique(classGraphTemp, 'Graphique des températures'))
        elContainerListeJour.append(creationGraphique(classGraphVent, 'Graphique des vents'))
        elContainerListeJour.append(creationGraphique(classGraphRafales, 'Graphique des rafales'))
        elContainerListeJour.append(creationGraphique(classGraphCloudsCover, 'Graphique de la couverture nuageuse'))
        elContainerListeJour.append(creationGraphique(classGraphHumidite, "Graphique du taux d'humidité"))
        


        function creationGraphique(variableGraphique, titre){
            const elDivChart = document.createElement('div')
            elDivChart.classList.add('ct-chart')
            elDivChart.classList.add('ct-perfect-fourth')
            elDivChart.classList.add(variableGraphique)
    
            const elGraphique = document.createElement('div')
            elGraphique.classList.add('graphique')
            elGraphique.append(elDivChart)
    
            const elTitreGraphique = document.createElement('div')
            elTitreGraphique.classList.add('titreGraphique')
            elTitreGraphique.textContent = titre
    
            const elContainerGraphique = document.createElement('div')
            elContainerGraphique.classList.add('containerGraphique')
            elContainerGraphique.append(elTitreGraphique, elGraphique)

            return elContainerGraphique
        }
        let graphTemp = {
            labels: tableauHeure,        
            series: [tabTempJournee]
        };
        let graphVent = {
            labels: tableauHeure,        
            series: [tabVentJournee]
        };
        let graphRafales = {
            labels: tableauHeure,        
            series: [tabRafalesJournee]
        };
        let graphCloudsCover = {
            labels: tableauHeure,        
            series: [tabCouvetureNuageuseJournee]
        };
        let graphHumidite = {
            labels: tableauHeure,        
            series: [tabHumiditeJournee]
        };


        //j'ajoute un "point" devant pour respecter la syntaxe ('.nomClasse')
        new Chartist.Line('.'+classGraphTemp, graphTemp);
        new Chartist.Line('.'+classGraphVent, graphVent);
        new Chartist.Line('.'+classGraphRafales, graphRafales);
        new Chartist.Line('.'+classGraphCloudsCover, graphCloudsCover);
        new Chartist.Line('.'+classGraphHumidite, graphHumidite);
        
        compteur++

    }

    

}

function fonctionEcoute(e){
    if (e.target.classList.contains("titreGraphique")){

        if (e.target.classList.contains("is-open")) {
            e.target.classList.remove("is-open");
        }else {
            const elTitresGraphiquesWithIsOpen = document.querySelectorAll(".is-open");
            elTitresGraphiquesWithIsOpen.forEach((titreGraphiqueWithIsOpen) => {
                titreGraphiqueWithIsOpen.classList.remove("is-open");
            });
            e.target.classList.add("is-open");
        }
    }
}
