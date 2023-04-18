const hideLoading = () => (loading.style.visibility = "hidden");
const showLoading = () => (loading.style.visibility = "visible");

const clearStopsList = () => {
  document.getElementById("stopsList").innerHTML = "";
};

const addStopToStopsList = (index, indicator, name, towards, lines) => {
  const stopsList = document.getElementById("stopsList");
  const linesHTML = lines
    .map((line) => `<div class="line"> ${line.name} </div>`)
    .join("");

  stopsList.innerHTML += `
      <div class="stop" onclick="setCurrentStop(${index})">
          <div class="header">
              <div class="stopLetter">${indicator.replace("->", "\u2B95")}</div>
              <div class="info">
                  <div class="stopName"><span>${name}</span></div>
                  <div class="towards">${towards}</div>
              </div>
          </div>
          <div class="lines">
              ${linesHTML || `<div class="line"> No lines </div>`}
          </div>
      </div>
  `;
};

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
    addMarker(index, stop.lat, stop.lng, stop.mode, stop.lines);
  });
};

const addNearbyStopsToMap = (lat, lng) => {
  showLoading();

  getNearbyStops(lat, lng).then((nearbyStops) => {
    currentNearbyStops = nearbyStops;
    setNearbyStops();
    hideLoading();
  });
};

const unsetCurrentStop = () => {
  if (intervalId !== null) clearInterval(intervalId);
  currentStop = null;
  document.getElementById("stopsList").style.display = "block";
  document.getElementById("departures").style.display = "none";
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

const setCurrentStop = (index) => {
  if (intervalId) {
    clearInterval(intervalId);
    hideLoading();
  }
  showLoading();
  currentStop = currentNearbyStops[index];
  document.getElementById("stopsList").style.display = "none";
  document.getElementById("departures").style.display = "block";

  const departures = document.getElementById("departures");
  const linesHTML =
    currentStop && currentStop.lines
      ? currentStop.lines
          .map((line) => `<div class="line"> ${line.name} </div>`)
          .join("")
      : `<div class="line"> No lines </div>`;

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
    hideLoading();
  });

  intervalId = setTimeout(() => setCurrentStop(index), 5000);
};

const showPosition = (position) => {
  addMarker(-1, position.coords.latitude, position.coords.longitude, 2);
};

const getUserLocation = () => {
  if (navigator.geolocation) {
    showLoading();
    navigator.geolocation.getCurrentPosition((position) => {
      unsetCurrentStop();
      map.setView(
        [position.coords.latitude, position.coords.longitude],
        map.zoom
      );
      showPosition(position);
      addNearbyStopsToMap(position.coords.latitude, position.coords.longitude);
    });
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
};

const addMarker = (index, lat, lng, icon, lines = []) => {
  let iconUrl = "imgs/busHighlight.png";

  switch (icon) {
    default:
      iconUrl = "imgs/busHighlight.png";
      break;
    case 1:
      iconUrl = "imgs/trainHighlight.png";
      break;
    case 2:
      iconUrl = "imgs/userLocationMarker.png";
      break;
  }

  if (map.getBounds().contains([lat, lng])) {
    const century21icon = L.icon({
      iconUrl,
      iconSize: [30, 30],
    });

    L.marker([lat, lng], {
      title: "",
      icon: century21icon,
    })
      .addTo(map)
      .on("click", (e) => setCurrentStop(index))
      .bindTooltip(
        `<div class="lines">${
          lines
            .map((line) => `<div class="line"> ${line.name} </div>`)
            .join("") || `<div class="line"> No lines </div>`
        }</div>`,
        {
          direction: "top",
          opacity: 0.8,
        }
      );
  }
};

let currentNearbyStops = [];
let currentStop = null;
let intervalId;

const loading = document.getElementsByClassName("loading")[0];

const map = L.map("map", {
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

addNearbyStopsToMap(map.getCenter().lat, map.getCenter().lng);
