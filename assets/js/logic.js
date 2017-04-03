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
var one;
var two;
//DOM variables
var btnShoot = $("#button-shoot");
var btnPlayer = $(".player-btn");
var btnSelect = $(".selection-button");
  // sync the game State with firebase
  gameStateRef.on("value", function(snap) {
    $("#one-panel h3").text(snap.val().one.name)
    $("#one-wins").text(snap.val().one.wins);
    $("#one-losses").text(snap.val().one.losses);

    $("#two-panel h3").text(snap.val().two.name)
    $("#two-wins").text(snap.val().two.wins);
    $("#two-losses").text(snap.val().two.losses);
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
       $("#selection-area").removeClass("hidden");
  }
  //If player one hasn't beed picked
  else if (activeUsers.indexOf(gameState.one.userKey) != -1) {

       $(".modal-body div").removeClass("btn-group");
       $(".player-btn[data-player='one']").addClass("hidden");
       $("#modal").modal('show');
       $("#selection-area").removeClass("hidden")
  }
  //If player two  hasn't beed picked
  else if (activeUsers.indexOf(gameState.two.userKey) != -1) {
       $(".modal-body div").removeClass("btn-group");
       $(".player-btn[data-player='two']").addClass("hidden");
       $("#modal").modal('show');
       $("#selection-area").removeClass("hidden")
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

    //grab user selection string (Rock, Paper, or Scissors)
    var selection = btnSelected.attr("alt");
    var player = $(this).attr("data-player")
    //Update the User's selection in fb
    gameStateRef.child(player).update({selection: selection})
    console.log(player);
    $("#" +player + "-content").html("<p>Ready!</p>")

    btnSelected.attr("data-selected", "false");
    btnSelected.removeClass("selected");
    btnSelected.css("filter", "invert(87%)")

    btnShoot.removeClass("selected");
    btnShoot.addClass("disabled")
  });

//Updates Firebase user record to set wins and losses (when the client disconnects they should go offline), as well as storing each player in the GAME_STATE Node under their player ID
