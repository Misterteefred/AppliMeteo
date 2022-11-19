const elVille = document.querySelector('.ville')
const elDate = document.querySelector('.date')
const elBlocIcone = document.querySelector('.blocIcone')
const elTemperature = document.querySelector('.temperature')
const elDescriptionIcone = document.querySelector('.descriptionIcone')
const elVent = document.querySelector('.vent')
const elRafale = document.querySelector('.rafale')
const elHumidite = document.querySelector('.humidite')
const elLever = document.querySelector('.lever')
const elCoucher = document.querySelector('.coucher')
const elPression = document.querySelector('.pression')
const elVignettesHautAujourdhui = document.querySelector('.vignettesHautAujourdhui')
const elVignettesBasJoursSuivant = document.querySelector('.vignettesBasJoursSuivants')
const elVignetteAujourdhuiFooter = document.querySelector('.vignetteAujourdhuiFooter')
const elVignetteJoursSuivantFooter = document.querySelector('.vignetteJoursSuivantFooter')
const elBoutonFavoris = document.querySelector('.boutonFavoris')
const elBody = document.querySelector('body')
const elSectionMenu = document.querySelector('.sectionMenu')
const elCalqueTransition = document.querySelector('.calqueTransition');
const lienEmplacement = document.querySelector('.menuRechercher a');

const CLEAPI = 'b7cc3853b03f04deba6ebfc22cc89866' //openWaethermap
const CLEAPI_IPGEOLOCALISATION = 'a4f657fbead34108a66b870b04fdc67f'
let latitude
let longitude
let nomVille
const tableauJours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const tableauMois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];


lienEmplacement.addEventListener('click', function(e){
    e.preventDefault();
    let target = e.currentTarget.href; // attention : "currentTarget" pour récupérer l'adresse du lien. (Pas e.target)         
    elCalqueTransition.classList.add('is-active');
    setTimeout(() => {
        window.location.href = target;
    }, 400)
})


window.onload = verficationDemarrage()

function verficationDemarrage() {
    setTimeout(() => {
        elCalqueTransition.classList.remove('is-active');
    }, 400);
    
    let donneesLocalStorage = [];
    if (localStorage.getItem("donneesVille") !== null) {
        donneesLocalStorage = JSON.parse(localStorage.getItem("donneesVille"));        
        nomVille = donneesLocalStorage[0].ville
        latitude = donneesLocalStorage[0].latitude
        longitude = donneesLocalStorage[0].longitude

        
        //fetch pour récupérer l'heure local en fontion des latitude et longitude du localstorage
        fetch(`https://api.ipgeolocation.io/timezone?apiKey=${CLEAPI_IPGEOLOCALISATION}&lat=${latitude}&long=${longitude}&lang=fr`)
        .then(response => response.json())
        .then(result => {
            const timezoneName = result.timezone
            const heureAPI = result.time_24
            const tabHeureAPI = heureAPI.split(':')
            const heureLocale = tabHeureAPI[0] + 'h' + tabHeureAPI[1]
            let jour = result.date_time_txt.split(',')[0]
            switch (jour){
                case 'Monday' :
                    jour = 'Lundi'
                break
                case 'Tuesday' :
                    jour = 'Mardi'
                break
                case 'Wednesday' :
                    jour = 'Mercredi'
                break
                case 'Thursday' :
                    jour = 'Jeudi'
                break
                case 'Friday' :
                    jour = 'Vendredi'
                break
                case 'Saturday' :
                    jour = 'Samedi'
                break
                case 'Sunday' :
                    jour = 'Dimanche'
                break
            }
            let numeroDuJour = result.date.slice(8)
            numeroDuJour = (numeroDuJour< 10 ? '0' : '') + numeroDuJour
            let numeroDuMois = tableauMois[result.date.slice(5,7)-1]
            donneesLocalStorage[0]['heureLocale'] = heureLocale;
            localStorage.setItem("donneesVille", JSON.stringify(donneesLocalStorage));

                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,dewpoint_2m,apparent_temperature,precipitation,weathercode,surface_pressure,cloudcover,windspeed_10m,winddirection_10m,windgusts_10m,soil_temperature_0cm,soil_moisture_0_1cm&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,shortwave_radiation_sum&current_weather=true&timezone=${timezoneName}`) 
                .then(response => response.json())    
                .then(result => {
                    //météo actuelle
                    const ville = nomVille
                    const prefixHeureJournee = Number(tabHeureAPI[0])
                    // //à prendre  :
                    const dateHeure = `${jour} ${numeroDuJour} ${numeroDuMois}, ${heureLocale}`
                    

                    const temperature = Math.round(result.current_weather.temperature)
                    const vent = Math.round(result.current_weather.windspeed)
                    const rafalesVent = Math.round(result.hourly.windgusts_10m[prefixHeureJournee])
                    
                    

                    //humidité : le prefixe de l'heure correspond à l'index du tableau.                    
                    const humidite = result.hourly.relativehumidity_2m[prefixHeureJournee]
                    const leverSoleil = result.daily.sunrise[0].slice(11,result.daily.sunrise[0].length+1)
                    const coucherSoleil = result.daily.sunset[0].slice(11,result.daily.sunset[0].length+1)
                    
                    const prefixeLeverSoleil = leverSoleil.slice(0, 2)
                    const prefixeCoucherSoleil = coucherSoleil.slice(0, 2)
                    
                    
                    let iconePrincipal = iconeMeteo(result.current_weather.weathercode,prefixHeureJournee,prefixeCoucherSoleil, prefixeLeverSoleil)
                    
                    
                    let description
                    let codeFondEcran
                    switch (iconePrincipal){
                        case 0 :
                        description = 'Très ensoleillé'
                        codeFondEcran = '0'
                        break
                        case'0n' :
                        description = 'Ciel dégagé'
                        codeFondEcran = '0n'
                        break
                        case 1 :
                        description = 'Ensoleillé'
                        codeFondEcran = '1'
                        break
                        case'1n' :
                        description = 'Ciel dégagé'
                        codeFondEcran = '1n'
                        break
                        case 2 :
                        description = 'Partiellement nuageux'
                        codeFondEcran = '2'
                        break
                        case'2n' :
                        description = 'Partiellement nuageux'
                        codeFondEcran = '2n'
                        break
                        case 3 :
                        description = 'Nuageux'
                        codeFondEcran = '3'
                        break
                        case 45 :
                        description = 'Brouillard'
                        codeFondEcran = '3'
                        break
                        case 48 :
                        description = 'Brouillard givré'
                        codeFondEcran = '3'
                        
                        break
                        case 51 :
                        description = 'Bruine légère'
                        codeFondEcran = '51'
                        break
                        case 53 :
                        description = 'Bruine'
                        codeFondEcran = '51'
                        break
                        case 55 :
                        description = 'Bruine dense'
                        codeFondEcran = '51'
                        break                        
                        case 56 :
                        description = 'Bruine légère verglaçante'
                        codeFondEcran = '51'
                        break
                        case 57 :
                        description = 'Bruine dense verglaçante'
                        codeFondEcran = '51'
                        break
                        case 61 :
                        description = 'Faible pluie'
                        codeFondEcran = '51'
                        break
                        case 63 :
                        description = 'Pluie'
                        codeFondEcran = '51'
                        break
                        case 65 :
                        description = 'Forte pluie'
                        codeFondEcran = '51'
                        break
                        case 66 :
                        description = 'Faible pluie verglaçante'
                        codeFondEcran = '51'
                        break
                        case 67 :
                        description = 'Forte pluie verglaçante'
                        codeFondEcran = '51'
                        break
                        case 71 :
                        description = 'Faible chute de neige'
                        codeFondEcran = '71'
                        break
                        case 73 :
                        description = 'Chute de neige'
                        codeFondEcran = '71'
                        break
                        case 75 :
                        description = 'Forte chute de neige'
                        codeFondEcran = '71'
                        break
                        case 77 :
                        description = 'Neige en grains'
                        codeFondEcran = '71'
                        break
                        case 80 :
                        description = 'Légères averses'
                        codeFondEcran = '51'
                        break
                        case 81 :
                        description = 'Averses'
                        codeFondEcran = '51'
                        break
                        case 82 :
                        description = 'Fortes averses'
                        codeFondEcran = '51'
                        break
                        case 85 :
                        description = 'Faible chute de neige'
                        codeFondEcran = '71'
                        break
                        case 86 :
                        description = 'Fortes chute de neige'
                        codeFondEcran = '71'
                        break
                        case 95 :
                        description = 'Orage'
                        codeFondEcran = '95'
                        break
                        case 96 :
                        description = 'Orage et légère grêle'
                        codeFondEcran = '95'
                        break
                        case 99 :
                        description = 'Orage et forte grêle'
                        codeFondEcran = '95'
                        break

                        default:  
                        description = ''
                        codeFondEcran = '1'
                    }
                    const pression = Math.round(result.hourly.surface_pressure[prefixHeureJournee])

                    //sauvegarde des données
                    const objetMeteoActuelle = {                
                        date : `${jour} ${numeroDuJour} ${numeroDuMois}`,
                        leverSoleil : leverSoleil, 
                        coucherSoleil : coucherSoleil,
                        iconeMeteo : codeFondEcran
                    }
                    
                    //Le chiffre en paramètre represente l'index dans lequel l'objet sera enregistré
                    sauvegarde(objetMeteoActuelle, 1)
                    sauvegarde(result.hourly, 2)

                    //-------ECRITURE DOM METEO ACTUELLE--------------
                    elBody.style.backgroundImage = `linear-gradient(rgba(25, 28, 44, 0.5),rgba(19, 13, 46, 0.5)), url('./ressources/iconesMeteo/fond/${codeFondEcran}.jpg')`;
                    elSectionMenu.style.backgroundImage = `linear-gradient(rgba(25, 28, 44, 0.5),rgba(19, 13, 46, 0.5)), url('./ressources/iconesMeteo/fond/${codeFondEcran}.jpg')`;
                    //ville et date
                    elVille.textContent = ville
                    elDate.textContent = dateHeure

                    //On vérifie si la ville fait partie des favoris, dans ce cas, le coeur sera de couleur rouge
                    let tableauVillesFavorites = []
                    if (localStorage.getItem("villeFavorites") !== null) {
                        tableauVillesFavorites = JSON.parse(localStorage.getItem("villeFavorites")); 
                    }
                    tableauVillesFavorites.forEach(objet => {
                        if (objet.nomVille === ville){
                            elBoutonFavoris.style.color = 'red'
                        }
                    });

                    //icone :  //${iconePrincipal}
                    const elImg = document.createElement('img')
                    elImg.setAttribute('src', `./ressources/iconesMeteo/${iconePrincipal}.svg`)
                    elImg.setAttribute('alt', 'iconeMeteo')
                    elBlocIcone.append(elImg)
                    //température
                    elTemperature.textContent = temperature + '°'
                    //description
                    elDescriptionIcone.textContent = description
                    //bloc vent
                    elVent.textContent = 'Vent: ' + vent + 'km/h'
                    elRafale.textContent = 'Rafales Max: ' + rafalesVent + 'km/h'
                           
                    //humidité
                    elHumidite.textContent = 'Humidité: ' + humidite + '%'

                    //bloc lever/coucher du soleil:
                    elLever.textContent = leverSoleil
                    elCoucher.textContent = coucherSoleil

                    //pression athmosphérique
                    elPression.textContent = 'Pression: ' + pression + 'hPa'

                    //----------------deuxième vignette----------------------

                    const tabHeure = result.hourly.time
                    const tabCode = result.hourly.weathercode
                    
                    const tabTemperature = result.hourly.temperature_2m
                    
                    for (let i = 8; i<=20; i = i + 2){
                        
                        const heurePrevision =  tabHeure[i].slice(11,13)                       
                        
                        const iconeDeuxiemeVignette = iconeMeteo(tabCode[i],heurePrevision,prefixeCoucherSoleil, prefixeLeverSoleil)
                        const temperature = Math.round(tabTemperature[i])


                        //écriture dans le DOM :
                        
                        //l'heure
                        const divElementHeure = document.createElement('div')
                        divElementHeure.classList.add('elementHeure')
                        divElementHeure.textContent = heurePrevision + 'h'

                        //l'icone:
                        const divElementImg = document.createElement('div')
                        divElementImg.classList.add('elementImg')
                        const elImg = document.createElement('img')
                        elImg.setAttribute('src', `./ressources/iconesMeteo/${iconeDeuxiemeVignette}.svg`)
                        elImg.setAttribute('alt', 'iconeMeteo')
                        divElementImg.append(elImg) 

                        //température
                        const divElementTemperature = document.createElement('div')
                        divElementTemperature.classList.add('elementTemperature')
                        divElementTemperature.textContent = temperature + '°'
                        
                        //injecte le tout dans un div
                        const divVignetteAujourdhui = document.createElement('div')
                        divVignetteAujourdhui.classList.add('vignetteAujourdhui')
                        divVignetteAujourdhui.append(divElementHeure, divElementImg , divElementTemperature)
                            
                        //Que l'on met dans un conteneur  
                        elVignettesHautAujourdhui.append(divVignetteAujourdhui)

                        
                    }

                    // Troisième vignette : prévision des jours suivants
                    const tabCodeIconeNextDay = result.daily.weathercode
                    const tabTempMaxNextDay = result.daily.temperature_2m_max
                    const tabTempMinNextDay = result.daily.temperature_2m_min


                    let indexJour = tableauJours.indexOf(jour)
                    let tabJoursSuivant = []
                    let libeleJour
                    for (let i = 1; i<=6; i++){
                        
                        if (indexJour === 6){
                            indexJour = -1
                            libeleJour = tableauJours[indexJour+1]
                        }else{
                            libeleJour = tableauJours[indexJour+1]
                        }
                        indexJour++
                        tabJoursSuivant.push(libeleJour)
                       
                       
                        //l'icone
                        const iconeTroisiemeVignette = tabCodeIconeNextDay[i]

                        //Températures minimales et maximales
                        const tempMax = Math.round(tabTempMaxNextDay[i])
                        const tempMin = Math.round(tabTempMinNextDay[i])

                        //Ecriture dans le DOM

                        // Libele du jour
                        const divTitleJour = document.createElement('div')
                        divTitleJour.classList.add('titleJours')
                        divTitleJour.textContent = libeleJour

                        //l'icone:
                        const divElementImg = document.createElement('div')
                        divElementImg.classList.add('elementImg')
                        const elImg = document.createElement('img')
                        elImg.setAttribute('src', `./ressources/iconesMeteo/${iconeTroisiemeVignette}.svg`)
                        elImg.setAttribute('alt', 'iconeMeteo')
                        divElementImg.append(elImg) 

                        //TempMax
                        const divTempMax = document.createElement('div')
                        divTempMax.classList.add('tempMax')
                        divTempMax.textContent = tempMax + '°'

                        //TempMax
                        const divTempMin = document.createElement('div')
                        divTempMin.classList.add('tempMin')
                        divTempMin.textContent = tempMin + '°'

                        //div conteneur
                        const divVignetteJourSuivant = document.createElement('div')
                        divVignetteJourSuivant.classList.add('vignetteJourSuivant')
                        divVignetteJourSuivant.append(divTitleJour,divElementImg,divTempMax,divTempMin)

                        //ecriture dans le Dom
                         elVignettesBasJoursSuivant.append(divVignetteJourSuivant)

                    }
                    sauvegarde(tabJoursSuivant, 3)                    

                function iconeMeteo(codeIcone,prefixHeureJournee,prefixeCoucherSoleil, prefixeLeverSoleil){
                    switch (codeIcone){
                        case 0 :
                        //Dans le cas où le ciel est parfaitement dégagé mais qu'il fait nuit alors on prendra l'icone avec la lune. Et même chose avec les deux autres cas.
                        if (prefixHeureJournee > prefixeCoucherSoleil || prefixHeureJournee < prefixeLeverSoleil){
                            codeIcone = '0n'
                        }
                        break
                        case 1 :
                        if (prefixHeureJournee > prefixeCoucherSoleil || prefixHeureJournee < prefixeLeverSoleil){
                            codeIcone = '1n'
                        }
                        break
                        case 2 :
                        if (prefixHeureJournee > prefixeCoucherSoleil || prefixHeureJournee < prefixeLeverSoleil){
                            codeIcone = '2n'
                        }
                        break
                        default:  codeIcone = codeIcone
                    }
                    return codeIcone
                }

                function sauvegarde(donnees, index){
                    let tableauMeteo = [];
                    tableauMeteo = JSON.parse(localStorage.getItem("donneesVille"));
                    //Avec le splice, je remplace l'index 1 existant du tableau pour injecter les données
                    tableauMeteo.splice(index, 1, donnees);
                    // localStorage.removeItem('donneesVille');
                    localStorage.setItem("donneesVille", JSON.stringify(tableauMeteo));                    
                    
                }
                })//fin du fetch API Open-Meteo
                

            })//fin du fetch API ip géolocalisation

    }else{        
        window.location.href='./emplacement.html'
    }
}
elVignetteAujourdhuiFooter.addEventListener('click', function(e){
    elCalqueTransition.classList.add('is-active');
    setTimeout(() => {
        window.location.href='./detailJourneeActuelle.html'
    }, 400)
    
})

elVignetteJoursSuivantFooter.addEventListener('click', function(e){
    elCalqueTransition.classList.add('is-active');
    setTimeout(() => {
        window.location.href='./detailJourneesSuivantes.html'
    }, 400)
    
})

elBoutonFavoris.addEventListener('click', function couleurBouton(){
    let tableauVillesFavorites = [];
    if (localStorage.getItem("villeFavorites") !== null) {
        tableauVillesFavorites = JSON.parse(localStorage.getItem("villeFavorites")); 
    }

    if (elBoutonFavoris.style.color === 'red'){
        elBoutonFavoris.style.color = 'grey'
        const indexNomVille = tableauVillesFavorites.findIndex( (element) => element.nomVille === nomVille);
       
        tableauVillesFavorites.splice(indexNomVille, 1)
        localStorage.removeItem('villeFavorites');
        localStorage.setItem("villeFavorites", JSON.stringify(tableauVillesFavorites))
    }else{
        elBoutonFavoris.style.color = 'red'
        const TabDonnnesVille = JSON.parse(localStorage.getItem("donneesVille"))       

        
        const objVillesFavorites = {                
            nomVille : TabDonnnesVille[0].ville,
            latitudeVille : TabDonnnesVille[0].latitude,
            longitudeVille : TabDonnnesVille[0].longitude,
            leverSoleil : TabDonnnesVille[1].leverSoleil,
            
            coucherSoleil : TabDonnnesVille[1].coucherSoleil,
            heureLocale : TabDonnnesVille[0].heureLocale,
        }
        
        tableauVillesFavorites.push(objVillesFavorites);
            //on réinjecte le tableau dans le localStorage
        localStorage.setItem("villeFavorites", JSON.stringify(tableauVillesFavorites))

    }
});


