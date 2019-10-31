const PLAYER_ONE = "playerOne/";
const PLAYER_TWO = "playerTwo/";
const CHAT = "chat/";
const GAME = "game/";

// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDYWHgfVhYT-1UYm4ey2XTD4C7XxjCvHMg",
    authDomain: "rps-multiplayer-fd7ea.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-fd7ea.firebaseio.com",
    projectId: "rps-multiplayer-fd7ea",
    storageBucket: "rps-multiplayer-fd7ea.appspot.com",
    messagingSenderId: "1067490817062",
    appId: "1:1067490817062:web:a126e9e70b095f7668a2e7"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

var playerNumber = "";
var choices = ["rock", "paper", "scissors"];
var messages = [];

var player = {
    name: "",
    wins: 0,
    losses: 0,
    choice: "",
    online: true,

    clear: function() {
        this.name = "";
        this.wins = 0;
        this.losses = 0;
        this.choice = "";
        this.online = false;
    },

    update: function() {
        database.ref(playerNumber).set({
            name: this.name,
            wins: this.wins,
            losses: this.losses,
            choice: this.choice,
            online: this.online
        });
        if (playerNumber === PLAYER_ONE) {
            database.ref(GAME).update({
                playerOneChoice: this.choice
            });
        } else if (playerNumber === PLAYER_TWO) {
            database.ref(GAME).update({
                playerTwoChoice: this.choice
            });
        }
    }
}

function setPlayerNumber(number) {
    playerNumber = number;
    player.update();
    $("#name-prompt").modal();
}

function removePlayer() {
    player.clear();
    player.update();
    clearChat();
}

function renderChoices(playerSelectedChoice) {
    let choicesElement;
    if (playerNumber === PLAYER_ONE) {
        choicesElement = $("#p1-choices");
    } else if (playerNumber === PLAYER_TWO) {
        choicesElement = $("#p2-choices");
    }
    choicesElement.empty();
    choices.forEach(function(choice) {
        let button = $("<button>")
            .addClass("choice btn")
            .data("choice", choice)
            .html(choice);
        if (choice === playerSelectedChoice) {
            button.addClass("btn-success");
        } else {
            button.addClass("btn-primary");
        }
        choicesElement.append(button);
    })
}

function clearChat() {
    database.ref(CHAT).set({});
}

$(document).ready(function() {
    
});

$("#save-name").on("click", function(event) {
    event.preventDefault();

    player.name = $("#name-input").val().trim();
    player.update();
    $("#name-prompt").modal("hide");
})

//determine which player this is
database.ref().once("value").then(function (snapshot) {
    if (!snapshot.val().playerOne.online) {
        setPlayerNumber(PLAYER_ONE);
    } else if (!snapshot.val().playerTwo.online) {
        setPlayerNumber(PLAYER_TWO)
    }
    console.log(playerNumber);
});

//------DB listeners------//
//update playerOne data
database.ref(PLAYER_ONE).on("value", function(snapshot) {
    $("#p1-name").html(snapshot.val().name);
    $("#p1-wins").html(snapshot.val().wins);
    $("#p1-losses").html(snapshot.val().losses);

    if (playerNumber === PLAYER_ONE) {
        renderChoices(snapshot.val().choice);
    }

}, function(error) {
    console.log(error);
});
//update playerTwo data
database.ref(PLAYER_TWO).on("value", function(snapshot) {
    $("#p2-name").html(snapshot.val().name);
    $("#p2-wins").html(snapshot.val().wins);
    $("#p2-losses").html(snapshot.val().losses);

    if (playerNumber === PLAYER_TWO) {
        renderChoices(snapshot.val().choice);
    }
}, function(error) {
    console.log(error);
});

//update chat
database.ref(CHAT).on("child_added", function(snapshot) {
        let mediaDiv = $("<div>")
            .addClass("media mb-3");
        let mediaBodyDiv = $("<div>")
            .addClass("media-body");
        let username = $("<h6>")
            .addClass("mt-0 mb-0");

        username.html(snapshot.val().user + ":");
        mediaBodyDiv.html(snapshot.val().message);

        mediaBodyDiv.prepend(username);
        mediaDiv.append(mediaBodyDiv);
        $("#chat-target").append(mediaDiv)
            .scrollTop($("#chat-target")[0].scrollHeight);
}, function(error) {
    console.log(error);
});

//update game
database.ref(GAME).on("value", function(snapshot) {
    //determine winner
    let playerOneChoice = snapshot.val().playerOneChoice;
    let playerTwoChoice = snapshot.val().playerTwoChoice;
    let display = $("#game-status");

    if (playerOneChoice == "" || playerTwoChoice == "") {
        return;
    }

    if (playerOneChoice == playerTwoChoice) {
        display.html("It was a tie!");
    } else if ((playerOneChoice == "rock" && playerTwoChoice == "scissors") || (playerOneChoice == "scissors" && playerTwoChoice == "paper") || (playerOneChoice == "paper" && playerTwoChoice == "rock")) {
        display.html("Player 1 Wins!");
        if (playerNumber === PLAYER_ONE) {
            player.wins++;
        } else {
            player.losses++;
        }
        player.update()
    } else {
        display.html("Player 2 Wins!");
        if (playerNumber === PLAYER_TWO) {
            player.wins++;
        } else {
            player.losses++;
        }
        player.update()
    }
    //update display

    //reset game after 10 seconds
}, function(error) {
    console.log(error);
})

$("#send-message").on("click", function(event) {
    event.preventDefault();

    database.ref(CHAT).push({
        message: $("#message").val().trim(),
        user: player.name
    });

    $("#message").val("");
})

$(document).on("click", ".choice", function(event) {
    event.preventDefault();
    player.choice = $(this).data("choice");
    player.update();
})

//remove player from db on unload
// $(window).on("unload", removePlayer); <-- didn't work in Firefox. Next line does.
$(window).on("beforeunload", removePlayer);