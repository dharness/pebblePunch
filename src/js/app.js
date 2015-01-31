/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var Accel = require('ui/accel');
var ajax = require('ajax');
Accel.init();

// -------------------- UI -------------------- 


var main = new UI.Card({
  title: 'Pebble.js',
  icon: 'images/menu_icon.png',
  subtitle: 'Hello Dylan!',
  body: 'Press any button.'
});

main.show();

// -------------------- ACCELOROMETER --------------------

Accel.config({
  rate: 25,
  samples: 25,
  subscribe: true,
});

Accel.on('data', function(e) {
  console.log('Just received ' + e.accels + ' from the accelerometer.');
});

// Accel.on('tap', function(e) {

//   var data = {};

//   Accel.peek(function(e) {

//     var sendData = {
//       magX : e.accel.x,
//       magY: e.accel.y,
//       magZ: e.accel.z,
//       id: 'sampleID'
//     };

//     console.log(JSON.stringify(sendData));

//     ajax(
//       {
//         url: 'http://104.131.88.222:6113',
//         method: 'POST',
//         data: sendData,
//         type: 'json',
//         contentType: "application/json; charset=utf-8",
// },
//       function(data) {
//         // Success!
//         console.log(data);
//       },
//       function(error) {
//         // Failure!
//         console.log('Failed fetching weather data: ' + error);
//       }
//     );

//   });

// });