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
canPunch = false;
puncher = Pebble.getWatchToken();
var punchCard = new UI.Card({
    title: 'IIII',
    subtitle: 'pppp'
});

// -------------------- ENGINE --------------------


var Engine = {
    //takes an array of data and determines if a punch has occurred
    lookForPunch: function(accels, callback) {
        // console.log(canPunch)
        for (var i = 0; i < accels.length && canPunch; i += 2) {
            var magS = accels[i].x + accels[i + 1].x;
            if (magS > 2000) {
                console.log('PUNCH' + magS);
                callback(magS);
                return;
            }
        }
    },
    trackMotion: function(accels, callback) {

        var sumX =0 , sumY = 0;
        for (var i = 0; i < accels.length; i ++) {

            sumX+= accels[i].x;
            sumY+= accels[i].y;

        }

        console.log (sumX + ',' +  sumY);
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
                punchCard.title('Highscore: ' + data.highScore);
                punchCard.subtitle('Score: ' + punch);
                punchCard.icon('images/menu_icon.png');
                Vibe.vibrate('short');
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
}, {
    title: "Batman Doyle"
}];

var img = new UI.Image({
    position: new Vector2(0, 0),
    size: new Vector2(128, 128),
    image: 'images/home-128.png'
});

// var hannes = new UI.Image({
//     position: new Vector2(0, 0),
//     size: new Vector2(144, 168),
//     image: 'images/hannes.png'
// });

var wind = new UI.Window({
    fullscreen: true
});

// Create the Menu, supplying the list of fruits
var MainMenu = new UI.Menu({
    sections: [{
        title: 'Menu',
        items: mitems
    }]
});

MainMenu.show();

// function displayScore(score, highScore) {
//     punchCard = new UI.Card({
//         title: 'Highscore: ' + highScore,
//         subtitle: 'Score: ' + score
//     });
//     punchCard.show();
// }

// Add a click listener for select button click
MainMenu.on('select', function(event) {
    Vibe.vibrate('short');

    if (mitems[event.itemIndex].title == "Punch!") {
        canPunch = true;


        punchCard.show();


    } else if (mitems[event.itemIndex].title == "High Score") {
        wind.add(img);
        wind.show();

    } else if (mitems[event.itemIndex].title == "About") {
        var detailCard = new UI.Menu({
            sections: [{
                title: 'Menu',
                items: us
            }]
        });

        detailCard.on('select', function(event) {
            //Vibe.vibrate('short');

            var second_wind = new UI.Window({
                fullscreen: true,
                backgroundColor: 'white'
            });

            var motion = move.checkMotions([]);


            if (event.itemIndex == 0) { //Ryan

            }
            else if (event.itemIndex == 1) { //Dylan

            }
            else if (event.itemIndex == 1) { //Hannes
                second_wind.add(img);
                second_wind.show();
            }

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
    // var punch = Engine.lookForPunch(e.accels, Engine.sendPunch);
    var punch = Engine.trackMotion(e.accels);
});