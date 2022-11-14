const elVille = document.querySelector('.ville')
const elDate = document.querySelector('.date')
const elContainerListe = document.querySelector('.containerListe')
const elTitresGraphiques = document.querySelectorAll(".titreGraphique");
const elBody = document.querySelector('body')
const elCalqueTransition = document.querySelector('.calqueTransition');
const tousLesLiens = document.querySelectorAll('a');

document.addEventListener("DOMContentLoaded", affichageDonnees);
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




function fonctionEcoute(e){
    console.log(e.target.textContent)

}
// function retourTransition(e){
//     e.preventDefault();
//     let target = e.currentTarget.href; // attention : "currentTarget" pour récupérer l'adresse du lien  
//     console.log(target)         
//     elCalqueTransition.classList.add('is-active');
//     setTimeout(() => {
//     console.log(lienHautpage)
//         // window.location.href = target;
//     }, 300)
    
// }

function affichageDonnees(){
    
   
    let donneesLocalStorage = [];
    donneesLocalStorage = JSON.parse(localStorage.getItem("donneesVille"));
    console.log(donneesLocalStorage)
    const codeFondEcran = donneesLocalStorage[1].iconeMeteo
    elBody.style.backgroundImage = `linear-gradient(rgba(25, 28, 44, 0.5),rgba(19, 13, 46, 0.5)), url('./ressources/iconesMeteo/fond/${codeFondEcran}.jpg')`;

    const nomVille = donneesLocalStorage[0].ville
    const date = donneesLocalStorage[1].date

    elVille.textContent = nomVille
    elDate.textContent = date

    const donneesParHeure = donneesLocalStorage[2]
    console.log(donneesParHeure)

    const tabHeure = donneesParHeure.time
    const tabTemp = donneesParHeure.temperature_2m
    const tabCodeIcone = donneesParHeure.weathercode
    const tabVent = donneesParHeure.windspeed_10m
    const tabRafale = donneesParHeure.windgusts_10m
    const tabHumidite = donneesParHeure.relativehumidity_2m
    const tabCouvetureNuageuse = donneesParHeure.cloudcover
    const prefixeLeverSoleil = donneesLocalStorage[1].leverSoleil.slice(0, 2)
    const prefixeCoucherSoleil = donneesLocalStorage[1].coucherSoleil.slice(0, 2)
    
    
    for (let i = 0; i<=23; i++){
        
        const heure = tabHeure[i].slice(11,13)
        const temperature = Math.round(tabTemp[i])
        let icone = tabCodeIcone[i]
        switch (icone){
            case 0 :
            //Dans le cas où le ciel est parfaitement dégagé mais qu'il fait nuit alors on prendra l'icone avec la lune. Et même chose avec les deux autres cas.
            if (heure > prefixeCoucherSoleil || heure < prefixeLeverSoleil){
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
            default:  icone = tabCodeIcone[i]
        }

        const vent = Math.round(tabVent[i])
        const rafale = Math.round(tabRafale[i])
        const humidite = Math.round(tabHumidite[i])

        //écriture dans le DOM
        
        
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

        elContainerListe.append(divLigne)        
    }
    const tableauHeure = ['0h','','2h','','4h','','6h','','8h','','10h','','12h','','14h','','16h','','18h','','20h','','22h','']
    
    const temp = tabTemp.slice(0,23)
    const vent = tabVent.slice(0,23)
    const rafales = tabRafale.slice(0,23)
    const humidite = tabHumidite.slice(0,23)
    const couvetureNuageuse = tabCouvetureNuageuse.slice(0,23)

    let graphTemp = {
        labels: tableauHeure,        
        series: [temp]
    };
    let graphVent = {
        labels: tableauHeure,        
        series: [vent]
    };
    let graphRafales = {
        labels: tableauHeure,        
        series: [rafales]
    };
    let graphCloudsCover = {
        labels: tableauHeure,        
        series: [couvetureNuageuse]
    };
    let graphHumidite = {
        labels: tableauHeure,        
        series: [humidite]
    };
    
    new Chartist.Line('.graphTemp', graphTemp);
    new Chartist.Line('.graphVent', graphVent);
    new Chartist.Line('.graphRafales', graphRafales);
    new Chartist.Line('.graphHumidite', graphHumidite);
    new Chartist.Line('.graphCloudsCover', graphCloudsCover);


}



elTitresGraphiques.forEach((titreGraphique) => {
  titreGraphique.addEventListener("click", () => {
    if (titreGraphique.classList.contains("is-open")) {
        titreGraphique.classList.remove("is-open");
    } else {
        const elTitresGraphiquesWithIsOpen = document.querySelectorAll(".is-open");
        elTitresGraphiquesWithIsOpen.forEach((titreGraphiqueWithIsOpen) => {
            titreGraphiqueWithIsOpen.classList.remove("is-open");
        });
        titreGraphique.classList.add("is-open");
    }
    
  });
});



