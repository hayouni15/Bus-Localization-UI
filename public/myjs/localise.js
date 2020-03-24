$(document).ready(async() => {
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
            iconAnchor: [19, 22],
            shadowAnchor: [15, 32],
            popupAnchor: [-3, -76]
        }
    });

    var routeTrack = L.icon({
        iconUrl: 'images/dot.png',
        //shadowUrl: 'images/shadow.png',

        iconSize: [10, 10], // size of the icon
        shadowSize: [0, 0], // size of the shadow
        iconAnchor: [5, 5], // point of the icon which will correspond to marker's location
        shadowAnchor: [0, 0], // the same for the shadow
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    var TLIcon = new LeafIcon({ iconUrl: 'images/TL.png' })
    var FHIcon = new LeafIcon({ iconUrl: 'images/FH.png' })
    var STOPIcon = new LeafIcon({ iconUrl: 'images/stop.png' })


    //var markerFH = L.marker([46.8139, -71.2080], { icon: FHIcon }).addTo(mymap);
    //mymap.removeLayer(markerFH)
    //var marker = L.marker([46.8139, -71.2080]).addTo(mymap);
    var counter = 0
    var fn = async function() {
        console.log('test')

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
                console.log(data.frame)
                var marker = L.marker([46.8139, -71.3080 + counter]).addTo(mymap);

            })
    }
    var AnchorGroup = L.layerGroup().addTo(mymap);
    // setInterval(fn, 4000)
    var drawAnchors = async function() {
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
                        var marker = L.marker([element.lat, element.lng], { icon: TLIcon }).addTo(AnchorGroup);
                    } else if (element.anchor_type === '1' && element.unconfirmed === 0) {
                        var marker = L.marker([element.lat, element.lng], { icon: FHIcon }).addTo(AnchorGroup);
                    } else if (element.anchor_type === '2' && element.unconfirmed === 0) {
                        var marker = L.marker([element.lat, element.lng], { icon: STOPIcon }).addTo(AnchorGroup);
                    } else {
                        if (element.unconfirmed === 0) {
                            var marker = L.marker([element.lat, element.lng]).addTo(AnchorGroup);
                        }

                    }
                    //mymap.setView([element.lat, element.lng], 16)
                });


                //var marker = L.marker([46.8139, -71.3080 + counter]).addTo(mymap);

            })
    }
    drawAnchors()
    var Track801 = []
    var markerGroup = L.layerGroup().addTo(mymap);
    var drawRoute = async function(color, route) {

        await fetch(`/${route}`, {
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
                prevsec = 0
                data.forEach(element => {

                    lat = element.split('$')[1]
                    long = element.split('$')[2]
                    sec = element.split('.')[0][element.split('.')[0].length - 1]
                    if (prevsec !== sec) {
                        //console.log(lat, long, sec)
                        prevsec = sec
                        if (sec == 1) {
                            var x = L.marker([lat, long], { icon: routeTrack }).addTo(markerGroup)
                            console.log(x)
                                //Track801.push(L.marker([lat, long], { icon: routeTrack }).addTo(mymap));
                        }

                    }



                });


                //var marker = L.marker([46.8139, -71.3080 + counter]).addTo(mymap);

            })
    }

    $('#route801').click(function() {
        markerGroup = L.layerGroup().addTo(mymap);
        drawRoute('blue', 801)
            //$('#route801').css('display', 'none')
            // $('#deleteroute801').css('display', 'initial')
    })
    $('#deleteroute801').click(function() {
        mymap.removeLayer(markerGroup);
    })
    $('#deleteAnchors').click(function() {
        mymap.removeLayer(AnchorGroup)
    })
    $('#drawAnchors').click(function() {
        AnchorGroup = L.layerGroup().addTo(mymap);
        drawAnchors()
    })

    //setInterval(drawAnchors, 10000)




})