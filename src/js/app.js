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

// -------------------- Engine -------------------- 

// A computational engine
var Engine = {

    //takes an array of data and determines if a punch has occurred
    lookForPunch: function(accels) {
        var diff = 20; // the difference which defines a peak
        var threshHold = 100; // the minimum magnitude for a punch

        for (var i = 0; i < accels.length; i++) {
            var a = accels[i]; // grab the current acceloration
            console.log(a.x + ' ' + a.y + ' ' + a.z)
            var m = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z); //compute the magnitude of the vector
            console.log('magnitude: ------> ' + m);
        }
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

    // Show a card with clicked item details
    var detailCard = new UI.Card({
        title: mitems[event.itemIndex].title
        //icon: 'resources/images/punch.png.pbi'
    });
    detailCard.show();

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