  // Initialize Firebase
var config = {
  apiKey: "AIzaSyDop8OcfQH0pLIwu8Zh9gtADKO1ULcrWTk",
  authDomain: "rps-multiplayer-dec0e.firebaseapp.com",
  databaseURL: "https://rps-multiplayer-dec0e.firebaseio.com",
  projectId: "rps-multiplayer-dec0e",
  storageBucket: "rps-multiplayer-dec0e.appspot.com",
  messagingSenderId: "488083470223"
};
firebase.initializeApp(config);

//Firebase variables
var database = firebase.database();
var userListRef = database.ref("USERS_ONLINE");
var gameStateRef = database.ref("GAME_STATE");
var userRef = userListRef.push({player: "unknown"});

//Game State Variables
var thisUser = userRef.key;
var player1Key;
var player2Key;
var player1Name;
var player2Name;

//DOM variables
var btnShoot = $("#button-shoot");
var btnPlayer = $(".player-btn");
var btnSelect = $(".selection-button");
  // sync the game State with firebase
  gameStateRef.on("value", function(snap) {
    var gameState = snap.val();
          player1Name = gameState.one.name
          player2Name = gameState.one.name
        player1Choice = gameState.one.selection
        player2Choice = gameState.two.selection
           player1Key = gameState.one.userKey
           player2Key = gameState.two.userKey

    $("#one-panel h3").text(gameState.one.name)
    $("#one-wins").text(gameState.one.wins);
    $("#one-losses").text(gameState.one.losses);

    $("#two-panel h3").text(gameState.two.name)
    $("#two-wins").text(gameState.two.wins);
    $("#two-losses").text(gameState.two.losses);

    if (gameState.one.selection != "none") {
      $("#one-content").html("<p>Ready!</p>")
    }
    else {
      $("#one-content").html("<p>Thinking...</p>")
    };

    if (gameState.two.selection != "none") {
      $("#two-content").html("<p>Ready!</p>");
    }
    else {
      $("#two-content").html("<p>Thinking...</p>");
    };

    if (gameState.one.selection != "none" && gameState.two.selection != "none" ){


      startCountdown(dispWinnerAndReset, getWinner(gameState.one, gameState.two))
      gameStateRef.child("one").update({selection: "none"});
      gameStateRef.child("two").update({selection: "none"});
      // call dispWinner on getWinner(gameState.one, gameState.two);
    };
  });

  //creates/disconnects users when they load/close the page
  userListRef.on("value", function(snap) {
    if (snap.val()) {
      userRef.onDisconnect().remove()
    }
    userRef.set({present: true})
  });

  //Controls the Player selection Modal, displaying different options depending on the number of users/active players
  database.ref().once("value", function(snap) {
    var gameState = snap.val().GAME_STATE;
    var activeUsers = Object.keys(snap.val().USERS_ONLINE)
    //If no other player has made a selection... (checks to see if an Online user is listed as Player one or two)
    if (activeUsers.indexOf(gameState.one.userKey) === -1 &&
        activeUsers.indexOf(gameState.two.userKey) === -1) {
         $("#modal").modal('show');
    }
    else if (activeUsers.indexOf(gameState.one.userKey) === -1) {
          console.log("b");
         $(".modal-body div").removeClass("btn-group");
         $(".player-btn[data-player='two']").addClass("hidden");
         $("#modal").modal('show');
    }
    else if (activeUsers.indexOf(gameState.two.userKey) === -1) {
      console.log("c");
         $(".modal-body div").removeClass("btn-group");
         $(".player-btn[data-player='one']").addClass("hidden");
         $("#modal").modal('show');
         $("#selection-area").removeClass("hidden");
    }
    else {
      console.log("d")
    }
  });

//Click handler functions for DOM elements
  //Click handler for the player selection buttons
  btnPlayer.on("click", function(){
    if ($("#player-name").val().length > 0) {
      var player = $(this).attr("data-player");
      var name = $("#player-name").val().trim();
      gameStateRef.child(player).update({userKey: thisUser, name: name, wins: 0, losses: 0});

      btnShoot.attr("data-player", player)
      $("#player-name").empty();
      $("#modal").modal("hide");
      $("#selection-area").removeClass("hidden")
    }
  });
  //Click handler which controls the DOM manipulation for the RPS selection buttons
  btnSelect.on("click", function(event) {

    var btnValue = $(event.target);

    if (btnValue.attr("data-selected") === "true") {

        btnValue.removeClass("selected")
        btnValue.css("filter", "invert(87%)");
        btnValue.attr("data-selected", "false")

        btnShoot.removeClass("selected")
        btnShoot.addClass("disabled");
      }
    else {

      var btnGroupSelect = $(".selection-button img");
      var btnValue = $(event.target);

      btnGroupSelect.attr("data-selected", "false");
      btnGroupSelect.removeClass("selected");
      btnGroupSelect.css("filter", "invert(87%)")

        btnValue.attr("data-selected", "true");
        btnValue.addClass("selected")
        btnValue.css("filter", "invert(0%)");

        btnShoot.addClass("selected");
        btnShoot.removeClass("disabled")
    }

  });
  //Click handler for the Shoot button, stores the User's choice in their user Object
  btnShoot.on("click", function() {
    //grab the selected choice (RPS) as a jQuery Object
    var btnSelected = $(".selection-button img[data-selected='true']");

    //grab user selection string (rock, paper, or scissors)
    var selection = btnSelected.attr("alt");
    var player = $(this).attr("data-player")
    //Update the User's selection in fb
    gameStateRef.child(player).update({selection: selection})
    $("#" +player + "-content").html("<p>Ready!</p>")

    btnSelected.attr("data-selected", "false");
    btnSelected.removeClass("selected");
    btnSelected.css("filter", "invert(87%)")

    btnShoot.removeClass("selected");
    btnShoot.addClass("disabled")
  });

//function to return the winning 'player' object (one or two), once both Players have selected.
  function getWinner(player1, player2) {

    if (player1.selection == player2.selection) {
      return "tied"
    }
    else {
    //rock-check
      if (player1.selection.toLowerCase() === "rock") {
        if (player2.selection.toLowerCase() === "paper") { return "two"; }
        else { return "one" }
      };

      if (player1.selection.toLowerCase() === "paper") {
        if (player2.selection.toLowerCase() === "rock") { return "two"; }
        else { return "one" }
      };

      if (player1.selection.toLowerCase() === "scissors") {
        if (player2.selection.toLowerCase() === "rock") { return "two"; }
        else { return "one" }
      };
    }
  };

  function startCountdown(callback, input) {
    var time = 3;
    $("#countdown").text(time);
     countdown = setInterval(function() {
      time--;
      $("#countdown").text(time);
      if (time === 0) {
        //Stops the timer
        callback(input);
        $("#countdown").empty();
        clearInterval(countdown)

      };
    }, 1000)

  };

  function dispWinnerAndReset(str) {
          $("#one-content").html("<img class='img img-responsive' src='assets/images/" + player1Choice.toLowerCase() + ".jpeg' />");
          $("#two-content").html("<img class='img img-responsive' src='assets/images/" + player1Choice.toLowerCase() + ".jpeg' />");
          if (str === "tied") {
            $("#msg-area").text("There was a tie")
          }
          else if (str === "one") {

            $("#msg-area").text(player1Name + " won")

            gameStateRef.child("one").child("wins").transaction(function (current_value) {
              return (current_value || 0) + 1;
            });
            gameStateRef.child("two").child("losses").transaction(function (current_value) {
              return (current_value || 0) + 1;
            });
          }
          else if (str === "two"){

            $("#msg-area").text(player1Name + " won")

              gameStateRef.child("two").child("wins").transaction(function (current_value) {
                return (current_value || 0) + 1;
              });
              gameStateRef.child("one").child("losses").transaction(function (current_value) {
                return (current_value || 0) + 1;
              });

          }
          setTimeout(function() {
            $("#msg-area").empty()
          }, 2000)
        return true;  // reset gameStateRef.one.choice and gameStateRef.two.choice
};
