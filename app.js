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

// Make a list of menu items
var mitems = [{
    title: "Punch!",
    subtitle: "Giver 'er"
}, {
    title: "High Score",
    subtitle: "Compete!"
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

    // Show a card with clicked item details
    var detailCard = new UI.Card({
        title: 'Punch!'
    });

    // Show the new Card
    detailCard.show();
});

Accel.on('tap', function(e) {

    Accel.peek(function(e) {

        var sendData = {
            magX: e.accel.x,
            magY: e.accel.y,
            magZ: e.accel.z
        };

        console.log(JSON.stringify(magnitudes));

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

    });

});