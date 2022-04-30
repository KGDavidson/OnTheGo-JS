var currentNearbyStops = [];
var currentStop = null;
var intervalId;

var map = L.map("map", {
    center: [51.507209, -0.127614],
    minZoom: 11,
    maxZoom: 17,
    zoom: 17,
});

const mapBounds = L.latLngBounds([
    [51.944653, -0.756512],
    [51.031025, 0.721172],
]);
map.fitBounds(mapBounds);

map.setMaxBounds(map.getBounds());

const tiles = new L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }
).addTo(map);

map.setView(map.getCenter(), 17);

console.log(map.getCenter());
const addNearbyStopsToMap = () => {
    getNearbyStops(map.getCenter().lat, map.getCenter().lng).then(
        (nearbyStops) => {
            currentNearbyStops = nearbyStops;
            setNearbyStops();
        }
    );
};

addNearbyStopsToMap();

const setNearbyStops = () => {
    clearStopsList();
    currentNearbyStops.map((stop, index) => {
        addStopToStopsList(
            index,
            stop.indicator,
            stop.name,
            stop.towards,
            stop.lines
        );
        addStopMarker(index, stop.lat, stop.lng, stop.mode);
    });
};

const clearStopsList = () => {
    var stopsList = document.getElementById("stopsList");
    stopsList.innerHTML = "";
};

const unsetCurrentStop = () => {
    intervalId == null ? null : clearInterval(intervalId);
    currentStop = null;
    document.getElementById("stopsList").style.display = "block";
    document.getElementById("departures").style.display = "none";
};

const setCurrentStop = (index) => {
    if (intervalId) {
        clearInterval(intervalId);
    }
    console.log("updated");
    currentStop = currentNearbyStops[index];
    document.getElementById("stopsList").style.display = "none";
    document.getElementById("departures").style.display = "block";

    const departures = document.getElementById("departures");
    var linesHTML = "";
    console.log(currentStop);
    currentStop.lines.forEach((line) => {
        linesHTML += `<div class="line"> ${line.name} </div>`;
    });
    departures.innerHTML = `
        <div class="stop">
            <div class="header">
                <div class="back" onclick="unsetCurrentStop()">&#10094;</div>
                <div class="info">
                    <div class="stopName"><span>${currentStop.name}</span></div>
                    <div class="towards">${currentStop.towards}</div>
                </div>
            </div>
            <div class="lines">
                ${linesHTML}
            </div>
        </div>
    `;

    getStopDepartures(currentStop).then((stopDepartures) => {
        stopDepartures.map((stop) => {
            addDeparturesToDeparturesList(
                stop.name,
                stop.destination,
                stop.mins == 0 ? "due" : stop.mins + " mins"
            );
        });
    });

    intervalId = setTimeout(setCurrentStop, 5000);
};

const addDeparturesToDeparturesList = (name, destination, mins) => {
    const departures = document.getElementById("departures");
    departures.innerHTML += `
        <div class="departure">
            <div class="header">
                <div class="info">
                    <div class="nameContainer">
                        <div class="name">${name}</div><span></span>
                    </div>
                    <div class="destination">${destination}</div>
                </div>
            </div>
            <div class="mins">
                ${mins}
            </div>
        </div>
    `;
};

const addStopToStopsList = (index, indicator, name, towards, lines) => {
    const stopsList = document.getElementById("stopsList");
    var linesHTML = "";
    lines.forEach((line) => {
        linesHTML += `<div class="line"> ${line.name} </div>`;
    });
    stopsList.innerHTML += `
        <div class="stop" onclick="setCurrentStop(${index})">
            <div class="header">
                <div class="stopLetter">${indicator}</div>
                <div class="info">
                    <div class="stopName"><span>${name}</span></div>
                    <div class="towards">${towards}</div>
                </div>
            </div>
            <div class="lines">
                ${linesHTML}
            </div>
        </div>
    `;
};

const getUserLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            unsetCurrentStop();
            map.setView(
                [position.coords.latitude, position.coords.longitude],
                map.zoom
            );
            addNearbyStopsToMap();
        });
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
};

const showPosition = (position) => {
    addMarker(51.507209, -0.127614);
};

const addStopMarker = (index, lat, lng, mode) => {
    addMarker(index, lat, lng, mode);
};

const addMarker = (index, lat, lng, icon) => {
    if (map.getBounds().contains([lat, lng])) {
        var century21icon = L.icon({
            iconUrl:
                icon == 0 ? "imgs/busHighlight.png" : "imgs/trainHighlight.png",
            iconSize: [30, 30],
        });
        var marker = L.marker([lat, lng], {
            title: "",
            icon: century21icon,
        });

        marker.addTo(map).on("click", (e) => setCurrentStop(index)); /*
            .bindPopup(
                "<p1><b>The White House</b><br>Landmark, historic home & office of the United States president, with tours for visitors.</p1>"
            )
            .openPopup();*/
    }
};
