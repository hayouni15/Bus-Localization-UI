$(document).ready(async () => {
    var locationString = ''
    var mymap = L.map('mapid').setView([46.8139, -71.2080], 13);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic3RvdXJhMTUiLCJhIjoiY2p5NHdxcnJrMDFnYzNtbGI1Nnk3c3dyNSJ9.LM2FWZdepyp1N1hAVYCrWg', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoic3RvdXJhMTUiLCJhIjoiY2p5NHdxcnJrMDFnYzNtbGI1Nnk3c3dyNSJ9.LM2FWZdepyp1N1hAVYCrWg'
    }).addTo(mymap);

    // defining icon class
    var LeafIcon = L.Icon.extend({
        options: {
            shadowUrl: 'images/shadow.png',
            iconSize: [38, 45],
            shadowSize: [30, 64],
            iconAnchor: [19, 50],
            shadowAnchor: [15, 65],
            popupAnchor: [-3, -76]
        }
    });
    // define icon class for route markers
    var routeTrack = L.icon({
        iconUrl: 'images/dot.png',
        //shadowUrl: 'images/shadow.png',

        iconSize: [10, 10], // size of the icon
        shadowSize: [0, 0], // size of the shadow
        iconAnchor: [5, 5], // point of the icon which will correspond to marker's location
        shadowAnchor: [0, 0], // the same for the shadow
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    //define icon class for estimated position
    var estimatedLocationIcon = L.icon({
        iconUrl: 'images/estimatedPosition.png',
        shadowUrl: 'images/shadow.png',

        iconSize: [38, 45],
        shadowSize: [30, 64],
        iconAnchor: [19, 45],
        shadowAnchor: [15, 65],
        popupAnchor: [-3, -76]
    });
    //define icon class for estimated position
    var GPSLocationIcon = L.icon({
        iconUrl: 'images/gps.png',
        shadowUrl: 'images/shadow.png',

        iconSize: [38, 45],
        shadowSize: [30, 64],
        iconAnchor: [19, 45],
        shadowAnchor: [15, 65],
        popupAnchor: [-3, -76]
    });


    // create instance of anchors
    var TLIcon = new LeafIcon({ iconUrl: 'images/TL.png' })
    var FHIcon = new LeafIcon({ iconUrl: 'images/FH.png' })
    var STOPIcon = new LeafIcon({ iconUrl: 'images/stop.png' })
    var possibleLocationIcon = new LeafIcon({ iconUrl: 'images/pin.png' })


    //var markerFH = L.marker([46.8139, -71.2080], { icon: FHIcon }).addTo(mymap);
    //mymap.removeLayer(markerFH)
    //var marker = L.marker([46.8139, -71.2080]).addTo(mymap);
    var counter = 0
    var fn = async function () {
        // console.log('test')
        // requset current position 
        await fetch('/currentPosition', {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Accept': 'application/json'
                // "Content-Type": "application/x-www-form-urlencoded",
            },
            referrer: "no-referrer", // no-referrer, *client
            // body: file // body data type must match "Content-Type" header
        }).then((res) => {
            // console.log(res)
            return res.json()
        })
            .then((data) => {
                // console.log(data)
                counter += 0.1
                // console.log(data.frame)
                var marker = L.marker([46.8139, -71.3080 + counter]).addTo(mymap);

            })
    }
    var AnchorGroup = L.layerGroup().addTo(mymap);
    // request anchors from database and draw them on map
    var drawAnchors = async function () {
        await fetch('/getAnchors', {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Accept': 'application/json'
                // "Content-Type": "application/x-www-form-urlencoded",
            },
            referrer: "no-referrer", // no-referrer, *client
            // body: file // body data type must match "Content-Type" header
        }).then((res) => {
            // console.log(res)
            return res.json()
        })
            .then((data) => {
                data.forEach(element => {
                    if (element.anchor_type === '0' && element.unconfirmed === 0) {
                        var marker = L.marker([element.lat, element.lng], { icon: TLIcon }).addTo(AnchorGroup).addTo(AnchorGroup).bindPopup(`TL : ${element.id}` + `<br> DFP:${(element.distance_from_prev).toFixed(2)} m`);
                    } else if (element.anchor_type === '1' && element.unconfirmed === 0) {
                        var marker = L.marker([element.lat, element.lng], { icon: FHIcon }).addTo(AnchorGroup).bindPopup(`FH : ${element.id}` + `<br> DFP:${(element.distance_from_prev).toFixed(2)} m`);
                    } else if (element.anchor_type === '2' && element.unconfirmed === 0) {
                        var marker = L.marker([element.lat, element.lng], { icon: STOPIcon }).addTo(AnchorGroup).bindPopup(`SS : ${element.id}` + `<br> DFP:${(element.distance_from_prev).toFixed(2)} m`);
                    } else {
                        if (element.unconfirmed === 0) {
                            var marker = L.marker([element.lat, element.lng]);
                        }

                    }
                    //mymap.setView([element.lat, element.lng], 16)
                });


                //var marker = L.marker([46.8139, -71.3080 + counter]).addTo(mymap);

            })
    }
    drawAnchors()


    $('#deleteAnchors').click(function () {
        mymap.removeLayer(AnchorGroup)
    })
    $('#drawAnchors').click(function () {
        AnchorGroup = L.layerGroup().addTo(mymap);
        drawAnchors()
    })


    //###########################  Draw possible locations #############################
    var PossiblePositionsGroup = L.layerGroup().addTo(mymap);
    var locationEstimation = L.layerGroup().addTo(mymap);
    var GPS_location = L.layerGroup().addTo(mymap);
    var GetAnchorwithId = async (id, callback) => {
        await fetch(`/getAnchorWithID/${id}`, {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Accept': 'application/json'
                // "Content-Type": "application/x-www-form-urlencoded",
            },
            referrer: "no-referrer", // no-referrer, *client
            // body: file // body data type must match "Content-Type" header
        }).then((res) => {
            // console.log(res)
            return res.json()
        })
            .then((data) => {
                callback(data)

            })
    }
    var drawPossiblePostions = async function () {

        //console.log('locString:', locationString)
        if (PossiblePositionsGroup) {
            //console.log('inside')
            mymap.removeLayer(PossiblePositionsGroup)
            PossiblePositionsGroup = L.layerGroup().addTo(mymap);
        }
        if (locationEstimation) {
            //console.log('inside')
            mymap.removeLayer(locationEstimation)
            locationEstimation = L.layerGroup().addTo(mymap);
        }
        if (GPS_location) {
            //console.log('inside')
            mymap.removeLayer(GPS_location)
            GPS_location = L.layerGroup().addTo(mymap);
        }

        // console.log('fetch positions')
        await fetch(`/getPossibleLocations`, {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Accept': 'application/json'
                // "Content-Type": "application/x-www-form-urlencoded",
            },
            referrer: "no-referrer", // no-referrer, *client
            // body: file // body data type must match "Content-Type" header
        }).then((res) => {
            // console.log(res)
            return res.json()
        })
            .then((data) => {
                //console.log(data)
                locationString = data[0].locations_string
                certainty_coef = data[0].certainty_coef
                location_estimate = data[0].location_estimation
                //update certainty bar
                document.querySelector('#certaintyBar').setAttribute("value", certainty_coef)
                // get possible locations
                var possibleLocations = data[0].locations_string.split('$')
                possibleLocations.pop()
                //console.log(possibleLocations)
                // get the estimate location between anchors 
                var coordinates = data[0].location_estimation.split('$')
                if (coordinates[0]) {
                    //console.log(coordinates)
                    latitude_estimation = coordinates[0]
                    longitude_estimation = coordinates[1]
                    var x = L.marker([latitude_estimation, longitude_estimation], { icon: estimatedLocationIcon }).addTo(locationEstimation)
                    GPS_latitude = coordinates[2]
                    GPS_longitude = coordinates[3]
                    //console.log(GPS_latitude)
                    if (document.getElementById("checkbox").checked) {

                        var y = L.marker([GPS_latitude, GPS_longitude], { icon: GPSLocationIcon }).addTo(GPS_location)
                        y.setOpacity(0.4)
                        document.querySelector('#check').setAttribute("style", "display: block;margin-top:5px")
                        document.querySelector('#findingLocation').setAttribute("style", "display: none")
                    }
                }


                possibleLocations.forEach((location) => {
                    GetAnchorwithId(parseInt(location), (anchor) => {
                        //console.log(anchor)
                        lat = anchor[0].lat
                        long = anchor[0].lng
                        var possibleAnchor = L.marker([lat, long], { icon: possibleLocationIcon }).addTo(PossiblePositionsGroup)

                    })

                })


            })
    }
    // check estimated possition every 5 sec and plot it
    setInterval(drawPossiblePostions, 500)

    // slide down 
    $('#slideDown').click(() => {
        $('html, body').animate({
            scrollTop: $("#scrollStop").offset().top
        }, 1000)
    })
    // hide sidebar 
    $('#hide_side').click(() => {
        $('#sidebar').hide("slow", () => {
            $('#main').css("margin-left", '0px')
            $('#mapcontainer').css("width", "97%")
        })
    })
    // show sidebar 
    $('#show_side').click(() => {
        $('#sidebar').show("slow", () => {
            $('#main').css("margin-left", '78px')
            $('#mapcontainer').css("width", "90%")
        })
    })
    // draw route lines
    var markerGroup = L.layerGroup().addTo(mymap);
    var drawLines = async function () {
        var line_coordinates = []
        await fetch('/getAnchors', {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Accept': 'application/json'
                // "Content-Type": "application/x-www-form-urlencoded",
            },
            referrer: "no-referrer", // no-referrer, *client
            // body: file // body data type must match "Content-Type" header
        }).then((res) => {
            // console.log(res)
            return res.json()
        })
            .then((data) => {
                data.forEach(element => {
                    if (element.unconfirmed === 0) {
                        line_coordinates.push([element.lat, element.lng])
                    }

                    //mymap.setView([element.lat, element.lng], 16)
                });

                console.log(line_coordinates)
                //var marker = L.marker([46.8139, -71.3080 + counter]).addTo(mymap);
                var latlngs = line_coordinates
                var polyline = L.polyline(latlngs, { color: 'blue' }).addTo(markerGroup);
                // zoom the map to the polyline
                mymap.fitBounds(polyline.getBounds())

            })
    }


    // draw /detete the route
    $('#route801').click(function () {
        markerGroup = L.layerGroup().addTo(mymap);
        drawLines()
    })
    $('#deleteroute801').click(function () {
        mymap.removeLayer(markerGroup);
    })

    var focus = async function () {

        await fetch(`/getPossibleLocations`, {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Accept': 'application/json'
                // "Content-Type": "application/x-www-form-urlencoded",
            },
            referrer: "no-referrer", // no-referrer, *client
            // body: file // body data type must match "Content-Type" header
        }).then((res) => {
            // console.log(res)
            return res.json()
        })
            .then((data) => {
                // get the estimate location between anchors 
                var coordinates = data[0].location_estimation.split('$')
                if (coordinates[0]) {
                    latitude_estimation = coordinates[0]
                    longitude_estimation = coordinates[1]

                    mymap.setView([latitude_estimation, longitude_estimation], 24)
                }


            })
    }

    $('#focus').click(function () {
        focus()
    })

    setInterval(() => {
        if (document.getElementById("autofocus").checked) {
            focus()
        }
    }
        , 500)

})