var map;
var poly;
var directionsDisplay;
var directionsService;
var markerArray = [];

function initialize() {
    // Instantiate a directions service.
    directionsService = new google.maps.DirectionsService();

    // Create a renderer for directions and bind it to the map.
    var rendererOptions = {
        map: map
    }
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions)
    var singapore = new google.maps.LatLng(1.3667, 103.7500);
    var myOptions = {
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: singapore
    }
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    // Instantiate an info window to hold step text.
    stepDisplay = new google.maps.InfoWindow();
    calcRoute();
}

function calcRoute() {

    //Route Object
    function routeObject(start, end) {
        this.routeStart = start;
        this.routeEnd = end;
        this.legs = [];
        this.steps = [];
    }

    //Step Object
    function stepObject(start, end, dist, instr, pathCoords) {
        this.stepStart = start;
        this.stepEnd = end;
        this.distance = dist;
        this.instructions = instr;
        this.pathCoordinates = pathCoords;
    }

    // First, clear out any existing markerArray
    // from previous calculations.
    for (i = 0; i < markerArray.length; i++) {
        markerArray[i].setMap(null);
    }

    var route_type = "cheapest";

    //read json data file
    $.getJSON('sampledata.json', function (data) {

        //set title div text
        var fromText = data["data"]["from"];
        var toText = data["data"]["to"];
        document.getElementById("title").innerText = "From " + fromText + " to " + toText;

        var routeData = data["data"]["route"][route_type];

        //get start and end coords
        var routeDataCoords = routeData["coords"];
        var mainCoords = routeDataCoords.replace(/,/g, ' ').split(' ');  
        var l = mainCoords.length;
        start = new google.maps.LatLng(parseFloat(mainCoords[1]), parseFloat(mainCoords[0]));
        end = new google.maps.LatLng(parseFloat(mainCoords[l-1]), parseFloat(mainCoords[l-2]));

        //create new routeObject with start and end variables
        var route = new routeObject(start, end);

        //for each turn in object
        $.each(routeData["turns"], function (key, val) {

            //distance of step
            var dist = val["dist"];

            //instruction issued at each turn
            var instr = val["move"] + " " + val["onto"];

            //parse string into floating point numbers
            var turnCoordsStringArray = val["coords"].replace(/,/g, ' ').split(' ');

            //get coordinates along the path
            var pathCoords = [];
            for (i = 0; i < turnCoordsStringArray.length; i += 2) {
                pathCoords.push(
                new google.maps.LatLng(parseFloat(turnCoordsStringArray[i + 1]), parseFloat(turnCoordsStringArray[i])));
            }

            //get start and end of path
            stepStart = pathCoords[0];
            stepEnd = pathCoords[pathCoords.length - 1];

            route.steps.push(
                new stepObject(stepStart, stepEnd, dist, instr, pathCoords)
            );

        });
        showSteps(route);
    });
}

function showSteps(myRoute) {
    // For each step, place a marker, and add the text to the marker's
    // info window. Also attach the marker to an array so we
    // can keep track of it and remove it when calculating new
    // routes.
    var dirArray = [];
    var dirHTML = document.createElement('ol');

    for (var i = 0; i < myRoute.steps.length; i++) {
        var marker = new google.maps.Marker({
            position: myRoute.steps[i].stepStart,
            map: map,
        });

        var instrText = myRoute.steps[i].instructions + "\n" + myRoute.steps[i].distance + "km";
        attachInstructionText(marker, instrText);
        dirArray.push(instrText);

        markerArray[i] = marker;

        //set PolyLineOptions
        var polyOptions = {
            strokeColor: "blue",
            strokeOpacity: 1.0,
            strokeWeight: 3
        }
        poly = new google.maps.Polyline(polyOptions);
        poly.setMap(map);

        poly.setPath(myRoute.steps[i].pathCoordinates);
    }


    for(var i=0; i<dirArray.length; i++){
        var node = document.createElement('li');
        node.innerText = dirArray[i] + "\n \n";
        dirHTML.appendChild(node);
    }

    document.getElementById("directions").appendChild(dirHTML);
}

//Value of String of Instruction
function attachInstructionText(marker, text) {
    google.maps.event.addListener(marker, 'click', function () {
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
    });
}