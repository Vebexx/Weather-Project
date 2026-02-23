# 🌤 WeatherMap — Live Weather App

**WeatherMap** on interaktiivinen ja responsiivinen React-sovellus, joka näyttää Suomen kaupunkien sään reaaliajassa. Sovelluksessa yhdistyvät kartta, reaaliaikainen säädata ja käyttäjäystävällinen hakukenttä, ja se on rakennettu täysin ilmaisilla työkaluilla ja API:lla.

---

## 🚀 Ominaisuudet

- 🌐 **Live-sää Suomessa**:  
  - Nykyinen lämpötila  
  - Säätila (selkeää, pilvistä, sadetta, lumisadetta, ukkosmyrsky)  
  - Tuulen nopeus (km/h)  
  - Päivä/yö-teema säätietojen mukaan
  - Viikon sääennuste perustuen sijaintisi säähän  

- 🗺 **Interaktiivinen kartta (Leaflet)**:  
  - Markerit eri kaupungeille  
  - Popupit lämpötilalla ja sääikoneilla  
  - FlyTo-animaatio hakukentän kautta haettaessa  
  - Käyttäjän sijaintimarkeri  
  - Zoom (+/-) ja scrollWheelZoom tuettu  

- 🔍 **Hakukenttä / Autocomplete**:  
  - Ehdottaa kaupunkeja JSON-listasta kirjainten mukaan  
  - Virheilmoitus, jos kaupunkia ei löydy  
  - FlyTo-animaatio vie kartan haluttuun kaupunkiin  

- 🎨 **Custom markerit ja visualisointi**:  
  - Lämpötilan mukaan väritetyt markerit  
  - Sääikoni popupissa (WiDaySunny, WiCloudy, WiRain jne.)  
  - Smooth animaatiot markerien päivitykselle  

- ⏱ **Reaaliaikainen kello ja teema**:  
  - Päivä/näköyön mukaan vaihtuva tausta ja ikonit  
  - Kello päivittyy minuutin tarkkuudella  

- 📄 **JSON-kaupunkilista**:  
  - Kaikki Suomen kaupungit haetaan `finnishCities.json` tiedostosta  
  - Helppo lisätä uusia kaupunkeja  

- 📱 **Responsiivinen layout (TailwindCSS)**:  
  - Mobile-first  
  - Kortti- ja karttanäkymä mukautuu eri näyttökokoihin  

- ⚡ **Reaaliaikainen päivitys ja optimointi**:  
  - React Query huolehtii datan refetchistä  
  - Refetch 15 sekunnin välein, live-data popupissa
  - Manuaalinen päivitys nappi jos haluat itse päivittää sään  

---

## 🛠 Teknologiat

- **React** – komponenttipohjainen käyttöliittymä  
- **Leaflet** – interaktiivinen kartta ja markerit  
- **Framer Motion** – smooth animaatiot  
- **TailwindCSS** – responsiivinen ja moderni layout  
- **React Query** – datafetch ja cache optimointi  
- **Open-Meteo API** – ilmainen säädata  
- **JSON** – kaupungit ja koordinaatit  
- **React Icons** – sääikonit Wi-sarjasta  

---

## 📁 Projektin rakenne

```text
src/
├─ components/
│  └─ WeatherMap.jsx   # Kartta, hakukenttä, markerit ja popupit
├─ data/
│  └─ cities.json      # Lista Suomen kaupungeista ja koordinaateista
├─ App.jsx             # Sovelluksen pääkomponentti
├─ main.jsx            # React-sovelluksen renderöinti
