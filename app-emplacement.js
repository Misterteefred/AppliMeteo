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
const elVilleFavoris = document.querySelector('.villeFavoris');


elInput.addEventListener('keydown', recherche);
elBoutonCroix.addEventListener('click', effacerInput);
elUlListeRecherche.addEventListener('mousedown', selectionVille);
elButtonLocalisation.addEventListener('click', meLocaliser)
elListeFavoris.addEventListener('click', selectionVilleFavorite)
// document.addEventListener('DOMContentLoaded', recuperationDonnees);
// document.addEventListener('DOMContentLoaded', ecritureDonnees);
elDivIconeInfo.addEventListener('click', infoVisible);
elDivCroix.addEventListener('click', infoHidden);
elListeFavoris.addEventListener('mousedown', draggableActive);
elListeFavoris.addEventListener('dragend', dragEnd);
elListeFavoris.addEventListener('mouseup', dragEndMouseUp);
elListeFavoris.addEventListener('dragstart', dragStart);
elListeFavoris.addEventListener('dragover', dragOver);
elListeFavoris.addEventListener('drop', drop);


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
    }, 600);
    
}

const APIhere = 'OUpVDZ-phafVgHUIu0MYAKqGB9NOXEAhoCifoHREwlI'
const API_TIMEZONEDB = '9SO8B4HCGK7U'
const CLEAPI_IPGEOLOCALISATION = 'a4f657fbead34108a66b870b04fdc67f'
let tableauVillesFavorites = []
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
        //https://api.ipgeolocation.io/timezone?apiKey=${CLEAPI_IPGEOLOCALISATION}&lat=${latitude}&long=${longitude}&lang=fr
        
        fetch(`https://api.ipgeolocation.io/timezone?apiKey=${CLEAPI_IPGEOLOCALISATION}&lat=${latitude}&long=${longitude}&lang=fr`)
        .then(response => response.json())
        .then(data => {
            
            const prefixeHeureJournee = data.time_24.slice(0,2)
            // const prefixeHeureJournee = data.formatted.slice(11,13)            

            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&&current_weather=true&timezone=Europe%2FBerlin`)
            .then(response => response.json())    
            .then(result => {

                // const nomVilleFavorite = objetVille.nomVille
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
                
                objetVille.tempVilleFavorite = temperature
                objetVille.iconeVilleFavorite = codeIcone
                localStorage.setItem("villeFavorites", JSON.stringify(tableauVillesFavorites));

            })//fin fetch api open meteo

        });//fin fetch api.ipgeolocation
    });//fin du forEach
}

setTimeout(() => {
    if (localStorage.getItem("villeFavorites") !== null){
        tableauVillesFavorites = JSON.parse(localStorage.getItem("villeFavorites"));        
        tableauVillesFavorites.forEach(objetVille => {
            const nomVilleFavorite = objetVille.nomVille
            const temperature = objetVille.tempVilleFavorite
            const codeIcone = objetVille.iconeVilleFavorite    
    
             //bouton "poignée"
             const elBoutonpoignee = document.createElement('button');
             elBoutonpoignee.classList.add('poignee');
             elBoutonpoignee.setAttribute('tabindex', '-1')
             elBoutonpoignee.innerHTML = '<i class="fa-solid fa-grip-vertical"></i>';
    
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
             divVilleFavoris.classList.add('villeFavoris')
             // divVilleFavoris.setAttribute('draggable','true')
             // divVilleFavoris.classList.add('animate__animated')
             divVilleFavoris.append(elBoutonpoignee,divBlocVillefavoris,elBoutonPoubelle)

             //écriture du DOM            
             elListeFavoris.append(divVilleFavoris)
        });
    }
}, 500);






// function recuperationDonnees(){
    
// }

// function ecritureDonnees(){
    
// }






function selectionVilleFavorite(e){    
    tableauVillesFavorites = JSON.parse(localStorage.getItem("villeFavorites"));

    if (e.target.classList.contains('favorisLibele') ){ 
        
        let nomVille
        let donneesLatitude
        let donneesLongitude
        
        tableauVillesFavorites.forEach(objet => {
            if (objet.nomVille === e.target.textContent){
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
        const nomDeLaVille = e.target.previousElementSibling.firstElementChild.textContent
        const indexNomVille = tableauVillesFavorites.findIndex( (element) => element.nomVille === nomDeLaVille);   
        tableauVillesFavorites.splice(indexNomVille, 1)
        localStorage.removeItem('villeFavorites');
        localStorage.setItem("villeFavorites", JSON.stringify(tableauVillesFavorites))

        e.target.parentNode.classList.add('suppression');
                window.setTimeout(function() {
            e.target.parentNode.remove()
        }, 200);
        
        
    }
}



const elIndicateur = document.createElement('div')
elIndicateur.classList.add('indicateur')

let elementEnDeplacement
let positionInitialeElementDeplace
let positionIndicateur
//dès que j'enfonce le bouton de la souris, le draggable s'active.
function draggableActive(e){    
    if (e.target.classList.contains('poignee')){
        e.target.parentNode.setAttribute('draggable','true')
             
    }
}
//dès que je reclache le bouton de la souris, le draggable se désactive.
function dragEndMouseUp(e){    
    if (e.target.classList.contains('poignee')){
        e.target.parentNode.removeAttribute('draggable')        
    }
}

//au moment où l'element commence à se déplacer, la classe CSS drag-start s'active pour l'opacité. 
//MAIS SURTOUT elementEnDeplacement = element. Autrement dit la variable elementEnDeplacement récupère le contenu de la div (e.target) dont le déplacement a commencé.
function dragStart(e){    
    const element = e.target
    element.classList.add('drag-start')
    elementEnDeplacement = element
    elListeFavoris.classList.add('drag-en-cours') 
    positionInitialeElementDeplace = trouverIndex(elementEnDeplacement)
}

function dragOver(e){
    e.preventDefault()
    //Dans ce cas précis, "e.target" c'est la poignée. "e.target.parentNode" correspond au parent de la poignée, c'est a dire la div complète de la ville.
    //si "lorsque l'on clique" on selectionne bien une div avec la classe villeFavoris, alors :
    if (e.target.parentNode.classList.contains('villeFavoris')){
        //PAR CONTRE quand le "dragOver" est déclenché "e.target.parentNode" correspond à l'élément survolé
        const elementSurvole = e.target.parentNode
        
        const milieu = elementSurvole.offsetHeight/2
        const positionCurseur = e.offsetY

        //Plusieurs cas où l'indicateur de doit pas être écrit dans le DOM.
         //Et pour eviter aussi le "tremblement" de l'indicateur
        if (elementSurvole === elementEnDeplacement ||
            (elementSurvole === elementEnDeplacement.previousElementSibling && positionCurseur > milieu)||
            (elementSurvole === elementEnDeplacement.nextElementSibling && positionCurseur <= milieu))
            {
            elIndicateur.remove()
        }else{
            if (positionCurseur <= milieu){
                if (elementSurvole.previousElementSibling !== elIndicateur){
                    //on va appliquer l'indicateur au dessus de ce parent.
                    elementSurvole.before(elIndicateur)                    
                }
            }else{
                if (elementSurvole.nextElementSibling !== elIndicateur){
                    //on va appliquer l'indicateur en dessous de ce parent.
                    elementSurvole.after(elIndicateur)
                    
                }
            }
            
        }
        
        positionIndicateur = trouverIndex(elIndicateur);
        
    }
}

function drop(e){
    //Pour un meilleur code, il faudra effectuer un drop que si l'indicateur est présent dans le DOM
    //on commence par obtenir la position de l'indicateur (si l'indicateur est pas trouver, ca va renvoyer "-1")
 
    positionIndicateur = trouverIndex(elIndicateur);
    
    if (positionIndicateur >= 0){

        const CSS_SCALE = 'scale(1.05)'
        const CSS_BOX_SHADOW = '0 0 24px rgba(32 32 32 / 0.8)'
        const PHASE_DECOLLAGE = 'decollage'
        const PHASE_DEPLACEMENT = 'deplacement'
        const PHASE_ATTERISSAGE = 'atterissage'
        
        function gestionAnimation(e) {            
            if (e.propertyName === "transform") {                
                const phase = elementEnDeplacement.dataset.phase;
                switch(phase){
                    case PHASE_DECOLLAGE:
                        elementEnDeplacement.dataset.phase = PHASE_DEPLACEMENT;

                        const hauteurElement = elementEnDeplacement.offsetHeight;
                        const margeBottomElement = Number(parseInt(window.getComputedStyle(elementEnDeplacement).marginBottom));
                        const hauteurTotal = hauteurElement + margeBottomElement
                        let nombreElement = positionIndicateur - positionInitialeElementDeplace - 1
                        if (positionIndicateur < positionInitialeElementDeplace){
                            nombreElement += 1;
                            
                        }
                        
                        elementEnDeplacement.style.transform += `translateY(${nombreElement * hauteurTotal}px)`;
                        /*
                        si la position de l'indicateur est > à celle de l'element alors
                        */
                       if (positionIndicateur > positionInitialeElementDeplace){
                            let premierBloc = positionInitialeElementDeplace + 1
                            let dernierBloc = positionIndicateur
                            for (let i = premierBloc; i<dernierBloc; i++){                            
                            elListeFavoris.children[i].style.transform = `translateY(${-hauteurTotal}px)`;
                            
                            }
                       }else{
                            let premierBloc = positionIndicateur
                            let dernierBloc = positionInitialeElementDeplace
                            for (let i = premierBloc; i<dernierBloc; i++){                            
                                elListeFavoris.children[i].style.transform = `translateY(${hauteurTotal}px)`;
                        }
                       }
                       
                    
                        
                    break;
                    case PHASE_DEPLACEMENT:
                        elementEnDeplacement.dataset.phase = PHASE_ATTERISSAGE;
                        elementEnDeplacement.style.boxShadow = '';
                        let chaineAvecScale = elementEnDeplacement.style.transform;
                        let chaineSansScale = chaineAvecScale.replace(CSS_SCALE, "");
                        chaineSansScale = chaineSansScale.trim()
                        elementEnDeplacement.style.transform = chaineSansScale;
                        
                    break;
                    case PHASE_ATTERISSAGE:
                        elementEnDeplacement.removeAttribute('data-phase');
                        //on supprimer le addeventListener pour évter les problèmes d'animation
                        elementEnDeplacement.removeEventListener('transitionend',gestionAnimation)

                         

                        if (positionIndicateur === elListeFavoris.children.length){
                            elListeFavoris.children[positionIndicateur-1].after(elementEnDeplacement)
                        }else{
                            elListeFavoris.children[positionIndicateur].before(elementEnDeplacement)
                        }
                        
                        
                        for (let i = 0; i< elListeFavoris.children.length; i++){
                          
                            // elListeFavoris.children[i].style.removeProperty('transform');
                            
                            elListeFavoris.children[i].style.transition = ('none');
                            elListeFavoris.children[i].style.transform = '';
                            setTimeout(function(){
                                elListeFavoris.children[i].removeAttribute('style')
                            },0)
                            
                        }

                    break;
                    default:
                    break;
                }
            }
            //sauvegarde de l'ordre des élements dans le localStorage
            const positionElementEnDeplacement = trouverIndex(elementEnDeplacement)
            const contenuVilleDeplace = tableauVillesFavorites[positionInitialeElementDeplace]
            tableauVillesFavorites.splice(positionInitialeElementDeplace,1)
            tableauVillesFavorites.splice(positionElementEnDeplacement,0,contenuVilleDeplace)
            localStorage.setItem("villeFavorites", JSON.stringify(tableauVillesFavorites));    

        };
        elementEnDeplacement.addEventListener('transitionend', gestionAnimation)

        elementEnDeplacement.dataset.phase = PHASE_DECOLLAGE
        elementEnDeplacement.style.transform = CSS_SCALE;
        elementEnDeplacement.style.boxShadow = CSS_BOX_SHADOW;
    } 
}

function dragEnd(e){
    if (e.target.classList.contains('villeFavoris')){
        e.target.removeAttribute('draggable')
        e.target.classList.remove('drag-start')
        elListeFavoris.classList.remove('drag-en-cours')        
        
        positionIndicateur = trouverIndex(elIndicateur);
        if (positionIndicateur >= 0){
            elIndicateur.remove()
        }

    }
}

function trouverIndex(element){
    const enfants = Array.from(elListeFavoris.children);
    const positionElement = enfants.indexOf(element);
    return positionElement
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

