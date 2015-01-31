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


var main = new UI.Card({
  title: 'Pebble.js',
  icon: 'images/menu_icon.png',
  subtitle: 'Hello Dylan!',
  body: 'Press any button.'
});

main.show();

Accel.on('tap', function(e) {
  
  Accel.peek(function(e) {
    
    var sendData = {
      magX : e.accel.x,
      magY: e.accel.y,
      magZ: e.accel.z
    };
    
    console.log(JSON.stringify(magnitudes));
    
    ajax(
      {
        url: 'http://104.131.88.222:6113',
        method: 'POST',
        data: sendData,
        type: 'json',
        contentType: "application/json; charset=utf-8",
      },
      function(data) {
        // Success!
        console.log('Successfully fetched weather data!');
      },
      function(error) {
        // Failure!
        console.log('Failed fetching weather data: ' + error);
      }
    );
      
  });
  
});


