/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var Accel = require('ui/accel');
var ajax = require('ajax');
var Vibe = require('ui/vibe');
Accel.init();

// -------------------- ENGINE --------------------

var Engine = {

  //takes an array of data and determines if a punch has occurred
  lookForPunch: function(accels) {
    var diff = 20; // the difference which defines a peak
    var threshHold = 100; // the minimum magnitude for a punch

    for (var i = 1; i < accels.length; i++) {

      var a = accels[i]; // grab the current acceloration
      var _a = accels[i - 1]; // grab the current acceloration

      var magS = a.x + ' ' + a.y + ' ' + a.z;
      var _magS = _a.x + ' ' + _a.y + ' ' + _a.z;

      if (Math.abs(magS - _magS) > 15000000) {
        var m = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z); //compute the magnitude of the vector
        console.log('PUNCH')
        this.sendPunch();
      }

    }
  },

  sendPunch: function() {
        ajax({
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
  }
}


// -------------------- UI -------------------- 

// Make a list of menu items
var mitems = [{
    title: "Punch!",
    subtitle: "Giver 'er"
}, {
    title: "High Score",
    subtitle: "Compete!"
}, {
    title: "About",
    subtitle: "The Team"
}];

// Create the Menu, supplying the list of fruits
var MainMenu = new UI.Menu({
    sections: [{
        title: 'Menu',
        items: mitems
    }]
});

MainMenu.show();

// Add a click listener for select button click
MainMenu.on('select', function(event) {
    Vibe.vibrate('short');

    if (mitems[event.itemIndex].title == "Punch!") {
        var detailCard = new UI.Card({
            title: mitems[event.itemIndex].title
        });

        detailCard.show();
    }


    // Show a card with clicked item details
    // var detailCard = new UI.Card({
    //     title: mitems[event.itemIndex].title
    //icon: 'resources/images/punch.png.pbi'
    // });
    // detailCard.show();

});

// -------------------- ACCELOROMETER --------------------

Accel.config({
  rate: 25,
  samples: 25,
  subscribe: true,
});

// subscription listening for punches
Accel.on('data', function(e) {
  Engine.lookForPunch(e.accels);
});