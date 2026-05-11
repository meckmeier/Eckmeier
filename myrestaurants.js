// =====================================================
// LOAD RESTAURANT DATA + BUILD MAP + BUILD LIST
// =====================================================

async function loadRestaurants() {

    // =====================================================
    // STORE MARKERS SO CARDS AND MAP CAN TALK TO EACH OTHER
    // =====================================================

    const markersById = {};

    let activeCard = null;
    let activeMarker = null;
    const restaurantsById = {};

    // =====================================================
    // CREATE MAP
    // This only happens ONCE
    // =====================================================

    const map = L.map("restaurant-map").setView([44.8755, -91.9193], 9);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    // =====================================================
    // DEFAULT MAP MARKER ICON
    // =====================================================

    const defaultIcon = L.icon({
        iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

        shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });


    // =====================================================
    // HIGHLIGHTED MAP MARKER ICON
    // =====================================================

    const activeIcon = L.icon({
        iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",

        shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });

    //build the selected restaurant html

    function restaurantHTML(r) {
    return `
        <article class="restaurant-item">
            <h3>
                <a href="${r.url}" target="_blank">
                    ${r.name}
                </a>
            </h3>

            <p>${r.city}</p>
            <p>${r.note}</p>

            <span class="tag">${r.tag}</span>
        </article>
    `;
}
    // =====================================================
    // HIGHLIGHT THE CARD + MARKER
    // Used when clicking either a card or a marker
    // =====================================================

    function setActiveRestaurant(id) {
        if (activeCard) {
            activeCard.classList.remove("active-restaurant");
        }

        if (activeMarker) {
            activeMarker.setIcon(defaultIcon);
        }

        const card = document.querySelector(`[data-restaurant-id="${id}"]`);
        const marker = markersById[id];
        const restaurant = restaurantsById[id];

        if (card) {
            card.classList.add("active-restaurant");
            activeCard = card;
        }

        if (marker) {
            marker.setIcon(activeIcon);
            marker.openPopup();
            activeMarker = marker;
        }

        if (restaurant) {
            document.getElementById("selected-restaurant").innerHTML =
                restaurantHTML(restaurant);
        }
    }

    // =====================================================
    // LOAD CSV FILE
    // =====================================================

    const response = await fetch("restaurants.csv");

    const csvText = await response.text();


    // =====================================================
    // PARSE CSV USING PAPAPARSE
    // =====================================================

    const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: h => h.trim(),
        transform: v => v.trim()
    });


    const restaurants = parsed.data;
    console.log("parsed data:", restaurants);
    console.log("first row:", restaurants[0]);
    console.log("headers:", Object.keys(restaurants[0]));

    // =====================================================
    // FIND THE HTML CONTAINER FOR THE RESTAURANT CARDS
    // =====================================================

    const container =
        document.getElementById("restaurant-list");


    // =====================================================
    // LOOP THROUGH EACH RESTAURANT
    // =====================================================

    restaurants.forEach((r, index) => {

        // =================================================
        // CREATE A UNIQUE ID FOR THIS RESTAURANT
        // =================================================

        const id = `restaurant-${index}`;
        restaurantsById[id] = r;

        // =================================================
        // ADD RESTAURANT CARD TO PAGE
        // =================================================

        container.insertAdjacentHTML(
        "beforeend",
        `
        <article class="restaurant-item" data-restaurant-id="${id}">
            <h3>
                <a href="${r.url}" target="_blank">
                    ${r.name}
                </a>
            </h3>

            <p>${r.city}</p>
            <p>${r.note}</p>

            <span class="tag">${r.tag}</span>
        </article>
        `
    );



        // =================================================
        // FIND THE CARD WE JUST CREATED
        // =================================================

        const card =
            document.querySelector(`[data-restaurant-id="${id}"]`);


        // =================================================
        // WHEN CARD IS CLICKED:
        // highlight map marker
        // =================================================

        card.addEventListener("click", () => {

            setActiveRestaurant(id);

        });


        // =================================================
        // CREATE MAP MARKER
        // =================================================

        if (r.lat && r.lng) {

            const marker = L.marker(
                [
                    Number(r.lat),
                    Number(r.lng)
                ],

                {
                    icon: defaultIcon
                }
            )

            .addTo(map)

            .bindPopup(
                `
                <strong>${r.name}</strong><br>
                ${r.city}<br>
                ${r.note}
                `
            );


            // =============================================
            // SAVE MARKER
            // =============================================

            markersById[id] = marker;


            // =============================================
            // WHEN MARKER IS CLICKED:
            // highlight restaurant card
            // =============================================

            marker.on("click", () => {

                setActiveRestaurant(id);

            });
        }

    });

}


// =====================================================
// START EVERYTHING
// =====================================================

loadRestaurants();