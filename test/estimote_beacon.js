var Estimote = require('bleacon').Estimote;

Estimote.discover(function(estimote) {
    console.log('found: ' + estimote.toString());

    console.log('connect');
    estimote.connect(callback);
});

// estimote.connecct(callback);

// estimote.discoverServicesAndCharacteristics(callback);

// estimote.pair(callback);

// estimote.readDeviceName(callback(devicename));

// var deviceName = 'estimote';
// estimote.writeDeviceName(deviceName, callback);

