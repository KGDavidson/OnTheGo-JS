const getNearbyStops = async (lat, lon) => {
    var endpointUrl = `https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${lon}&stopTypes=NaptanPublicBusCoachTram,NaptanBusCoachStation,NaptanRailStation,NaptanMetroStation&radius=1500&modes=bus,dlr,national-rail,overground,tube`;
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
        return {
            lat: e.lat,
            lng: e.lon,
            indicator:
                "indicator" in e ? e.indicator.replace("Stop ", "") : null,
            id: e.id,
            naptanId: e.naptanId,
            name: e.commonName,
            lines: e.lines.map((e) => {
                return { name: e.name, id: e.id };
            }),
            mode: mode,
        };
    });
};
