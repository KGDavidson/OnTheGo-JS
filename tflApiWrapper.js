const getNearbyStops = async (lat, lon) => {
    var endpointUrl = `https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${lon}&stopTypes=TransportInterchange,NaptanMetroStation,NaptanRailStation,NaptanBusCoachStation,NaptanFerryPort,NaptanPublicBusCoachTram&modes=tube,bus,coach,overground,dlr,cable-car,national-rail,river-bus,river-tour,tram&returnLines=false&radius=1000`;
    var response = await fetch(endpointUrl);
    var json = await response.json();

    return json.stopPoints.map((e) => {
        //console.log(e);
        var mode = 0;
        if (
            e.modes.includes("dlr") ||
            e.modes.includes("national-rail") ||
            e.modes.includes("overground") ||
            e.modes.includes("tube")
        ) {
            mode = 1;
        }
        var towards = "";

        var towards = (
            e.additionalProperties.find((e) => e.key == "Towards") || {
                value: "",
            }
        ).value;
        if (towards) {
            towards = "towards " + towards;
        }
        return {
            lat: e.lat,
            lng: e.lon,
            indicator:
                "indicator" in e
                    ? e.indicator
                          .replace("Stop ", "")
                          .replace("-bound", "")
                          .replace("Stand ", "")
                          .replace("Stop", "")
                    : "-",
            id: e.id,
            towards: towards,
            naptanId: e.naptanId,
            name: e.commonName,
            lines: e.lines.map((e) => {
                return { name: e.name, id: e.id };
            }),
            mode: mode,
        };
    });
};
