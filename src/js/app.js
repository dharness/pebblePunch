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
canPunch = true;
puncher = Pebble.getWatchToken();

    // -------------------- ENGINE --------------------

var Engine = {

    //takes an array of data and determines if a punch has occurred
    lookForPunch: function(accels, callback) {    
        for (var i = 0; i < accels.length && canPunch; i+=2) {
            var magS = accels[i].x + accels[i+1].x;
            if (magS > 2000) {
                // console.log('PUNCH' + magS);
                callback(magS);
                return;
            }
        }
    },

    sendPunch: function(punch, puncher) {
        ajax({
                url: 'http://104.131.88.222:6113',
                method: 'POST',
                data: {
                    id: Pebble.getWatchToken(),
                    magnitude: punch
                },
                type: 'json',
                contentType: "application/json; charset=utf-8",
            },
            function(data) {
                // Success!
                console.log(data);
            },
            function(error) {
                // Failure!
                console.log('Failed fetching punch data: ' + error);
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

var us = [{
    title: "Ryan Holmes"
}, {
    title: "Dylan Harness"
}, {
    title: "Hannes Filler"
}];

var img = new UI.Image({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    image: 'images/home-128.png'
});

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
            icon: 'images/menu_icon.png'
        });

        detailCard.show();
    } else if (mitems[event.itemIndex].title == "High Score") {
        var detailCard = new UI.Card({
            title: 'wooot'
        });

        detailCard.show();
    } else if (mitems[event.itemIndex].title == "About") {
        var detailCard = new UI.Menu({
            sections: [{
                title: 'Menu',
                items: us
            }]
        });

        detailCard.show();
    } else {
        console.log("what? how even?");
    }
});

// -------------------- ACCELOROMETER --------------------

Accel.config({
    rate: 15,
    samples: 10,
    subscribe: true,
});

// subscription listening for punches
Accel.on('data', function(e) {
    var punch = Engine.lookForPunch(e.accels, Engine.sendPunch);
});