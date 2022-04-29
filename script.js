var map = L.map("map", {
    center: [51.507209, -0.127614],
    zoom: 10,
});

var mapBounds = L.latLngBounds([
    [51.944653, -0.756512],
    [51.031025, 0.721172],
]);
map.fitBounds(mapBounds);

map.setMaxBounds(map.getBounds());

var tiles = new L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        minZoom: "11",
    }
).addTo(map);

function showPosition(position) {
    addMarker(51.507209, -0.127614);
}

function addMarker(lat, lng) {
    if (map.getBounds().contains([lat, lng])) {
        var century21icon = L.icon({
            iconUrl: "imgs/userLocationMarker.png",
            iconSize: [30, 30],
        });
        var marker = L.marker([lat, lng], {
            title: "",
            icon: century21icon,
        });

        marker
            .addTo(map)
            .bindPopup(
                "<p1><b>The White House</b><br>Landmark, historic home & office of the United States president, with tours for visitors.</p1>"
            )
            .openPopup();
    }
}
