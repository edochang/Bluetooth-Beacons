var Bleacon = require('bleacon');
var http = require('http');

var beacons = [];
var username = "";
var uuid = "b9407f30f5f8466eaff925556b57fe6d";

// Node Instruction Script
// Simulate java main method for readability
init();
main();
// Set interval timer to call scanning for every 30 seconds
setInterval(main, 7000);

// define data initiation method
function init() {
    // Get OS user name
    storeUsername();
}

// define main method
function main() {
    beacons = [];

    // See variables state for debugging
    // console.log("LOG: username: " + username);
    // console.log("LOG: uuid: " + uuid);
    // console.log("LOG: beacons: " + beacons.valueOf());

    // Start scanning for beacons
    startBleaconScanning(uuid);
}

Bleacon.on('discover', function(bleacon) {
    var beacon = {};
    // console.log("LOG: Discovered a beacon, adding to beacons array");

    // Debug to see what the beacons say
    // console.log("LOG: ","UUID: " + bleacon.uuid, "Major: " + bleacon.major, "Minor: " + bleacon.minor, "Power: " + bleacon.measuredPower, "RSSI: " + bleacon.rssi, "Accuracy: " + bleacon.accuracy, "Proximity: " + bleacon.proximity);
    
    // console.log("LOG: Populate Major and Minor for Beacon object");
    beacon['distinctId'] = bleacon.uuid + bleacon.major + bleacon.minor;
    beacon['uuid'] = bleacon.uuid;
    beacon['major'] = bleacon.major;
    beacon['minor'] = bleacon.minor;
    beacon['rssi'] = bleacon.rssi;
    beacon['power'] = bleacon.measuredPower;
    beacon['proximity'] = bleacon.proximity;

    beacons.push(beacon);
    // console.log("LOG: Push beacon with major: " + bleacon.major + ", minor: " + bleacon.minor + ", rssi: " + bleacon.rssi, ", proximity: " + bleacon.proximity);
});

function storeUsername() {
    username = process.env['USER'];
    console.log("Log: Store Mac OS username " + username);
}

// Stop the timer and process the beacons array
function stopScanningAndProcess() {
    console.log("LOG: Stop scanning for beacons and process list of beacons");
    Bleacon.stopScanning();

    // console.log("LOG: Print what's in beacons array at Init0");
    // console.log(beacons.valueOf());

    // Creates an object with distinct beacons as an object property list
    var objDistinctBeacon = {};
    var distinctBeacons = [];
    for (var i = 0, l = beacons.length; i < l; i++) {
        if (objDistinctBeacon.hasOwnProperty(beacons[i].distinctId)) {
            continue;
        }
        distinctBeacons.push(beacons[i]);
        objDistinctBeacon[beacons[i].distinctId] = 1;
    }

    // For debugging of distinctBeacons array
    // console.log("LOG: Print what's in dinstinctBeacons array at Init1");
    // console.log(distinctBeacons.valueOf());

    // console.log("LOG: Print what's in beacons array at Init1");
    // console.log(beacons.valueOf());

    console.log("LOG: Calculate nearest beacon");
    calculateNearestBeacon(distinctBeacons);
}

function startBleaconScanning(input) {
    console.log("LOG: Start scanning for beacons with UUID=" + input);
    Bleacon.startScanning(input);
    setTimeout(stopScanningAndProcess, 5000);
}

function calculateNearestBeacon(input) {
    // Debug log to see the methods inputs
    // console.log("LOG: Print the methods input");
    // console.log(input.valueOf());

    // filter out objects that are not near
    console.log("LOG: Filter out non near proximity beacons");
    var inputFiltered = [];
    for (var i = 0, l = input.length; i < l; i++) {
        if (input[i].proximity.toString() == 'immediate') {
            inputFiltered.push(input[i]);
        }
    }

    // Sort input with comparison function
    inputFiltered.sort(function(object1, object2) {
        return object1.rssi - object2.rssi;
    });

    // See the sorting results
    // console.log("LOG: Print the sorted input");
    // console.log(inputFiltered.valueOf());

    if (inputFiltered.length == 0){   
        console.log("LOG: No beacons nearby!");
    } else {
        sendDataToServer(inputFiltered[0]);
    }
}

function calculateNearestBeacon2(input) {

}

function sendDataToServer(input) {
    // Debug log to see the methods inputs
    // console.log("LOG: Print the methods input");
    // console.log(input.valueOf());

    var nearestBeacon = {};
    nearestBeacon['uuid'] = input.uuid;
    nearestBeacon['major'] = input.major;
    nearestBeacon['minor'] = input.minor;
    nearestBeacon['rssi'] = input.rssi;
    nearestBeacon['proximity'] = input.proximity;

    var newUsername = username + "@deloitte.co.uk";

    console.log("LOG: Build body of the request");
    var requestBody = '{' + '"major":' + nearestBeacon.major + ',"minor":' + nearestBeacon.minor + ',"userName":"' + newUsername + '"}'

    console.log("LOG: nearestBeacon: " + requestBody);

    var req;
    
    var httpOptions = {
        host: 'mashuptomcat.azurewebsites.net',
        path: '/bookMyDesk/bookDesk',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    //     var httpOptions = {
    //     host: '0.0.0.0',
    //     port: 8888,
    //     path: '/testresponse',
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Content-Length': requestBody.length
    //     }
    // };

    req = http.request(httpOptions, function (res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
        console.log( e.stack );
    });

    // write data to request body
    req.write(requestBody);
    req.end();
}
