$(document).ready(function() {
  var interval = setInterval(function () {
    updateUsers(users_json);
  }, 1000);

  var users = [];
  var users_json = "/current_users"

  function updateUsers(path) {
    $.ajax({
      url: path,
      dataType: "json"
    }).done(function (data) {
      //Adding users
      for (var i in data) {
        //Check if we have this user already
        //TODO... account for users who already have their MAC address in the array but then come back with updated rdiouserid info
        if (!users[i]) {
          console.log("Adding user with Mac: " + i);
          //Check if the user has a rdiouserid, otherwise just add an empty object with the Mac address as the key
          if (data[i].displayname && data[i].rdiouserid) {
            users[i] = { "displayname": data[i].displayname, "rdiouserid": data[i].rdiouserid };
          }
        else
          users[i] = {"displayname":"", "rdiouserid":""};
          handleNewUser(users[i], i);
        }
      }

      //Removing users
      for (var i in users) {
        if (!data[i]) {
          console.log("Removing user with mac: " + i);
          if (users[i].rdiouserid != "")
            handleRemoveUser(users[i], i);
            delete users[i];
          }
        }
    });
  }

  function handleNewUser(user, macaddress) {
    console.log("handleNewUser");

    var user_element = document.createElement('div');
    var front_face = document.createElement('div');
    var back_face = document.createElement('div');
    var name = document.createElement('h2');
    var edit = document.createElement('a');
    var edit_text = document.createTextNode('Edit')

    user_element.id = macaddress;
    user_element.classList.add("user");
    front_face.classList.add("font-face");
    back_face.classList.add("back-face");
    edit.classList.add("edit");

    if(user.rdiouserid != "") {
      var nameText = document.createTextNode(user.displayname);
      handleNewRdioUser(user.rdiouserid);
    } else {
      var nameText = document.createTextNode(macaddress);
    }

    edit.appendChild(edit_text);
    name.appendChild(nameText);
    back_face.appendChild(name);
    back_face.appendChild(edit);
    user_element.appendChild(front_face);
    user_element.appendChild(back_face);

    $("section.users").append(user_element);

    $(document.getElementById(macaddress))
      .css("opacity", 0).css("top", -20)
      .animate({
      opacity: 1,
      top: 0
    }, 500);

    // updateUserSpinner();
  }

  function handleRemoveUser(user, macaddress) {
    $(document.getElementById(macaddress))
      .animate({
      opacity: 0,
      top: -20
    }, 500, function() {
      $(this)
        .remove();
      // updateUserSpinner();
    });

    if (user.rdiouserid != "") {
      handleRemovedRdioUser(user.rdiouserid)
    }
  }

  function handleNewRdioUser(rdiouserid) {
    //Do some magic with the userid and come back with songs

      //this is just to mock different users joining
      var path;
      if (rdiouserid == "934234")
          path = "/userathreetracks.txt";
      else if (rdiouserid == "12349875")
          path = "/userbtwotracks.txt";

      $.ajax({
          url: path,
          dataType: "json",
          success: function (data) {
              console.log("handle new user call back returned");
              for (var i in data) {
                  playlist.push(data[i]);
                  if (isFirstUser && currentPlayState == STOPPED) {
                      //Only auto-play the playlist if this is the first user joining
                      isFirstUser = false;
                      $("#api").rdio().play(playlist[0].trackid);
                  }
              }

              updatePlaylistView();
          },
          error: function (xhr, status) {
              console.log("error: " + status);
          }

      })
  }

  function  handleRemovedRdioUser(rdiouserid) {
      var indexesToRemove = [];

      //remove this user's tracks
      for (i in playlist) {
          if (playlist[i].userid == rdiouserid) {
              if (i == currentPlaylistIndex) $('#api').rdio().stop();
              //keep track of which tracks to remove
              indexesToRemove.push(i);
          }
      }
      //remove the tracks from the array
      for (i in indexesToRemove) {
          playlist.splice(indexesToRemove[i]-i, 1);
      }

      updatePlaylistView();
  }


  function updatePlaylistView() {
    $("section.playlist ul").empty();
    for (i in playlist) {
      var song_element = document.createElement('li');
      var play_pause = document.createElement('span');
      var name = document.createElement('span');
      var artist = document.createElement('span');
      var user_name = document.createElement('span');

      var name_text = document.createTextNode(playlist[i].name)
      var artist_text = document.createTextNode(playlist[i].artist)
      var user_name_text = document.createTextNode(playlist[i].userid)

      song_element.classList.add("track");
      play_pause.classList.add("play-pause");
      name.classList.add("name");
      artist.classList.add("artist");
      user_name.classList.add("user-name")

      song_element.setAttribute("data-track-id", playlist[i].trackid);

      if (i == currentPlaylistIndex) {
        //Style if this is the current song
        song_element.classList.add('current');
      }

      user_name.appendChild(user_name_text);
      artist.appendChild(artist_text);
      name.appendChild(name_text);
      song_element.appendChild(play_pause);
      song_element.appendChild(name);
      song_element.appendChild(artist);
      song_element.appendChild(user_name);

      $("section.playlist ul").append(song_element);
    }

    $('section.playlist li').click(function() {
      if ((currentPlayState == PLAYING || currentPlayState == BUFFERING) && currentPlaylistIndex == $(this).index()) {
        $("#api").rdio().pause();
      } else {
        var song_id = $(this).data("track-id");
        $("#api").rdio().play(song_id);
        currentPlaylistIndex = $(this).index();
      }
      updatePlaylistView();
    });

    update_play_icon();
  }
});
