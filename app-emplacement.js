const elInput = document.querySelector('.input')
const elListeRecherche = document.querySelector('.listeRecherche')
const elBoutonCroix = document.querySelector('.boutonCroix')
const elUlListeRecherche = document.querySelector('.ullisteRecherche')
const elBlocChargement = document.querySelector('.blocChargement')
const elButtonLocalisation = document.querySelector('.buttonLocalisation')
const elListeFavoris = document.querySelector('.listeFavoris')
const elDivIconeInfo = document.querySelector('.divIconeInfo')
const elElementBlocInfo = document.querySelector('.blocInfo')
const elDivCroix = document.querySelector('.divCroix')
const elBody = document.querySelector('body')
const elCalqueTransition = document.querySelector('.calqueTransition');
const lienRetour = document.querySelector('.retour a');

elInput.addEventListener('keydown', recherche);
elBoutonCroix.addEventListener('click', effacerInput);
elUlListeRecherche.addEventListener('mousedown', selectionVille);
elButtonLocalisation.addEventListener('click', meLocaliser)
elListeFavoris.addEventListener('click', selectionVilleFavorite)
document.addEventListener('DOMContentLoaded', chargementPage);
elDivIconeInfo.addEventListener('click', infoVisible);
elDivCroix.addEventListener('click', infoHidden);

lienRetour.addEventListener('click', function(e){
    e.preventDefault();
    let target = e.currentTarget.href; // attention : "currentTarget" pour récupérer l'adresse du lien. (Pas e.target)         
    elCalqueTransition.classList.add('is-active');
    setTimeout(() => {
        window.location.href = target;
    }, 400)
})

window.onload = function(){
    setTimeout(() => {
        elCalqueTransition.classList.remove('is-active');
    }, 400);
    
}

let nomVille
let ObjetDonneesMeteo = {}

const APIhere = 'OUpVDZ-phafVgHUIu0MYAKqGB9NOXEAhoCifoHREwlI'
const CLEAPI_IPGEOLOCALISATION = 'a4f657fbead34108a66b870b04fdc67f'

function chargementPage(){
    elInput.focus();
    if (localStorage.getItem("donneesVille") !== null){
        const donnees = JSON.parse(localStorage.getItem("donneesVille"));
        const codeFondEcran = donnees[1].iconeMeteo
        elBody.style.backgroundImage = `linear-gradient(rgba(25, 28, 44, 0.5),rgba(19, 13, 46, 0.5)), url('./ressources/iconesMeteo/fond/${codeFondEcran}.jpg')`;
    }
    if (localStorage.getItem("villeFavorites") !== null) {
        const tableauVillesFavorites = JSON.parse(localStorage.getItem("villeFavorites")); 
        tableauVillesFavorites.forEach(objetVille => {
            const latitude = objetVille.latitudeVille
            const longitude = objetVille.longitudeVille
            const prefixeLeverSoleil = objetVille.leverSoleil.slice(0,2)
            const prefixeCoucherSoleil = objetVille.coucherSoleil.slice(0,2)
            //pour récupérer l'heure locale de la ville. (Si je l'avais enregistrée dans le local storage, elle ne se mettrait jamais à jour):
            fetch(`https://api.ipgeolocation.io/timezone?apiKey=${CLEAPI_IPGEOLOCALISATION}&lat=${latitude}&long=${longitude}&lang=fr`)
            .then(response => response.json())
            .then(result => {
               
                const prefixeHeureJournee = result.time_24.slice(0,2)
                

                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&&current_weather=true&timezone=Europe%2FBerlin`)
                .then(response => response.json())    
                .then(result => {

                    const nomVilleFavorite = objetVille.nomVille
                    const temperature = Math.round(result.current_weather.temperature)
                    let codeIcone = result.current_weather.weathercode
                    
                    switch (codeIcone){
                        case 0 :
                        //Dans le cas où le ciel est parfaitement dégagé mais qu'il fait nuit alors on prendra l'icone avec la lune. Et même chose avec les deux autres cas.
                        if (prefixeHeureJournee > prefixeCoucherSoleil || prefixeHeureJournee < prefixeLeverSoleil){
                            codeIcone = '0n'
                        }
                        break
                        case 1 :
                        if (prefixeHeureJournee > prefixeCoucherSoleil || prefixeHeureJournee < prefixeLeverSoleil){
                            codeIcone = '1n'
                        }
                        break
                        case 2 :
                        if (prefixeHeureJournee > prefixeCoucherSoleil || prefixeHeureJournee < prefixeLeverSoleil){
                            codeIcone = '2n'
                        }
                        break
                        default:  codeIcone = result.current_weather.weathercode
                    }
                    //bouton "poubelle"
                    const elBoutonPoubelle = document.createElement('button');
                    elBoutonPoubelle.classList.add('boutonPoubelle');
                    elBoutonPoubelle.innerHTML = '<i class="fa-solid fa-trash"></i>';

                    //l'icone: 
                    const divElementImg = document.createElement('div')
                    divElementImg.classList.add('villeFavorisIcone')
                    const elImg = document.createElement('img')
                    elImg.setAttribute('src', `./ressources/iconesMeteo/${codeIcone}.svg`)
                    elImg.setAttribute('alt', 'iconeMeteo')
                    divElementImg.append(elImg) 
                    
                    //température
                    const divVilleFavorisTemp = document.createElement('div')
                    divVilleFavorisTemp.classList.add('villeFavorisTemp')
                    divVilleFavorisTemp.textContent = temperature + '°'

                    //nom de la ville
                    const divFavorisLibele = document.createElement('div')
                    divFavorisLibele.classList.add('favorisLibele')
                    divFavorisLibele.textContent = nomVilleFavorite

                    //blocVilleFavoris
                    const divBlocVillefavoris = document.createElement('div')
                    divBlocVillefavoris.classList.add('blocVillefavoris')
                    divBlocVillefavoris.append(divFavorisLibele,divVilleFavorisTemp,divElementImg)

                    //div VilleFavoris
                    const divVilleFavoris = document.createElement('div')
                    divVilleFavoris.classList.add('VilleFavoris')
                    divVilleFavoris.classList.add('animate__animated')
                    divVilleFavoris.append(divBlocVillefavoris,elBoutonPoubelle)
                    
                    //écriture du DOM
                    elListeFavoris.append(divVilleFavoris)


                })//fin fetch api open meteo

            });//fin fetch api.ipgeolocation

        });
    }
}






function selectionVilleFavorite(e){
    const tableauVillesFavorites = JSON.parse(localStorage.getItem("villeFavorites"));
    if (e.target.classList.contains('VilleFavoris') ){ 
       
        let nomVille
        let donneesLatitude
        let donneesLongitude
        
        tableauVillesFavorites.forEach(objet => {
            if (objet.nomVille === e.target.firstElementChild.firstElementChild.textContent){
                nomVille = objet.nomVille
                donneesLatitude = objet.latitudeVille
                donneesLongitude = objet.longitudeVille
            }
        });

        const ObjetDonneesVille = {
            ville : nomVille,
            latitude : donneesLatitude,
            longitude : donneesLongitude,
        }
        updateLocalStorageEtRedirection(ObjetDonneesVille)
        
        
    }

    if (e.target.classList.contains('boutonPoubelle')){
        
        const indexNomVille = tableauVillesFavorites.findIndex( (element) => {
            // element.nomVille === e.target.previousElementSibling.textContent
            element.nomVille === e.target.parentNode.textContent
        });
        // console.log(indexNomVille)
        tableauVillesFavorites.splice(indexNomVille, 1)
        localStorage.removeItem('villeFavorites');
        localStorage.setItem("villeFavorites", JSON.stringify(tableauVillesFavorites))
        e.target.parentNode.classList.add('animate__fadeOut');
        window.setTimeout(function() {
            e.target.parentNode.remove()
        }, 400);
        
    }
}


function recherche(){
    let valInput = elInput.value
    if (valInput.length >= 2){
        elUlListeRecherche.innerHTML = ''


        
        fetch(`https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json?query=${valInput}&apiKey=${APIhere}&locationattributes=tz`)
        .then(response => response.json())
        .then(result => {
                 
            let suggestion = result.suggestions 
            
            suggestion.forEach(res =>{
                const locationId = res.locationId
                const ville = res.address.city                
                let etat = res.address.state
                if (res.address.state === undefined){etat = ''}
                const pays = res.address.country
                if (ville !== undefined){ //if (typeof ville === 'string'){
                    
                    elListeRecherche.classList.add('listeVisible') 

                    //je crée l'élément span pour la ville
                    const spanVille = document.createElement('span')            
                    spanVille.classList.add('spanVille') 
                    spanVille.textContent=ville

                    //je crée un autre élément span pour la region/pays
                    const spanRegionPays = document.createElement('span')            
                    spanRegionPays.classList.add('spanRegionPays')
                    spanRegionPays.textContent=`${etat}/${pays}`

                    //je stocke locationID dans une span invisible
                    const spanlocationId = document.createElement('span')
                    spanlocationId.classList.add('spanlocationId')
                    spanlocationId.textContent=`${locationId}`
                    
                    
                    //creation de la balise <a> pour la redirection
                    const elLi = document.createElement('li')
                    elLi.classList.add('liRecherche')                   
                    
                    elLi.append(spanVille,spanRegionPays,spanlocationId)
                    elUlListeRecherche.append(elLi) 
                }                 
            });
        })
    }else{
        elListeRecherche.classList.remove('listeVisible')
    }  
}

function effacerInput(e){
    e.preventDefault()
    elInput.value = ''
    elListeRecherche.classList.remove('listeVisible')
}


function selectionVille(e){
    const nomVille = e.target.firstElementChild.textContent
    const locationId = e.target.lastElementChild.textContent
    //fetch pour récupérer les latitudes et longitude
    fetch(`https://geocoder.ls.hereapi.com/6.2/geocode.json?locationid=${locationId}&jsonattributes=1&gen=9&apiKey=${APIhere}`)
    .then(response => response.json())
    .then(result => {
        //Pour chacunes des villes cliquées, on créer un nouvel objet avec les données en latitude et longitude
        // adresse fetch pour api donnant l'heure locale de la ville  grace aux coordonnnées géograph.:
        
        const ObjetDonneesVille = {
            ville : nomVille,
            latitude : result.response.view[0].result[0].location.displayPosition.latitude,
            longitude : result.response.view[0].result[0].location.displayPosition.longitude,
        }        
        updateLocalStorageEtRedirection(ObjetDonneesVille)        
    })
    
    
        

}
function meLocaliser(e){
    e.preventDefault()
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude.toFixed(5)
            const long = position.coords.longitude.toFixed(5)
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=b7cc3853b03f04deba6ebfc22cc89866`)
            .then(response => response.json())
            .then(result => {
              
            const ObjetDonneesVille = {
                            ville : result.name,
                            latitude : lat,
                            longitude : long,
             }            
            updateLocalStorageEtRedirection(ObjetDonneesVille)
            });          
        }, () => {
            alert(`Le navigateur n'est pas paramétré pour accepter la localisation.`)
        })
    }

}

function updateLocalStorageEtRedirection(ObjetDonneesVille){

    localStorage.removeItem('donneesVille');
    let tableauDonneesVille = [];       
    //On push l'objet dans le tableau
    tableauDonneesVille.push(ObjetDonneesVille);
    //on réinjecte le tableau dans le localStorage
    localStorage.setItem("donneesVille", JSON.stringify(tableauDonneesVille));
    
    //affiche l'animation de chargement des données
    elBlocChargement.classList.add('chargementVisible') 
    setTimeout(() => {
        elCalqueTransition.classList.add('is-active');
    }, 400)
    setTimeout(function(){
        elBlocChargement.classList.remove('chargementVisible')

        window.location.href='./index.html'        
    }, 1000)
    
}

function infoVisible(){
    if (elElementBlocInfo.classList.contains('blocInfoVisible')){
        infoHidden()
    }else {
        elElementBlocInfo.classList.add('animate__fadeIn')
        elElementBlocInfo.classList.add('blocInfoVisible')
        window.setTimeout(function() {
            elElementBlocInfo.classList.remove('animate__fadeIn');
        }, 300);
    }
    
}
function infoHidden(){
    elElementBlocInfo.classList.remove('animate__fadeIn')
    elElementBlocInfo.classList.add('animate__fadeOut');
    
    window.setTimeout(function() {
        elElementBlocInfo.classList.remove('blocInfoVisible')
        elElementBlocInfo.classList.remove('animate__fadeOut')
    }, 300);
}


