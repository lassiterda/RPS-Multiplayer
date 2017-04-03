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

  //DOM variables
  var btnShoot = $("#button-shoot");

  // sync the game State with firebase
  gameStateRef.on("value", function(snap) {
    $("#player1-panel h3").text(snap.val().one.name)
    $("#player1-wins").text(snap.val().one.wins);
    $("#player1-losses").text(snap.val().one.losses);

    $("#player2-panel h3").text(snap.val().two.name)
    $("#player2-wins").text(snap.val().two.wins);
    $("#player2-losses").text(snap.val().two.losses);


  });

  //creates/disconnects users when they load/close the page
  userListRef.on("value", function(snap) {
    if (snap.val()) {
      userRef.onDisconnect().remove()
    }
    userRef.set({present: true})
  });

//Controls the Player selection Modal, displaying different options depending on the number of users/active players
userListRef.once("value", function(snap) {
  //loop through the active users to see how many 'players' there are
  var otherPlayers = Object.keys(snap.val()).filter(function(ele){
    return snap.val()[ele].player != "unknown"
  });
  //If no other player has made a selection...
  if (otherPlayers.length === 0) {
    $("#modal").modal('show');
    $("#selection-area").removeClass("hidden");
  }
  //If there's already another player in the game...
  else if (otherPlayers.length === 1){
      otherPlayers = Object.keys(snap.val()).filter(function(ele){
        return snap.val()[ele].player != "unknown"
      })[0];
    $(".modal-body div").removeClass("btn-group");
      $(".player-btn[data-player='" + snap.val()[otherPlayers].player + "']").addClass("hidden")
    $("#modal").modal('show');
    $("#selection-area").removeClass("hidden");
  }

});

  //Click handler for the player selection buttons
  $(".player-btn").on("click", function(){
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
  $(".selection-button").on("click", function(event) {

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

    //Update the User's selection in fb
    gameStateRef.child(thisUser).child(selection).update({selection: selection})
    //
    btnSelected.attr("data-selected", "false");
    btnSelected.removeClass("selected");
    btnSelected.css("filter", "invert(87%)")

    btnShoot.removeClass("selected");
    btnShoot.addClass("disabled")
  });

//Updates Firebase user record to set wins and losses (when the client disconnects they should go offline), as well as storing each player in the GAME_STATE Node under their player ID
