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
            handleNewRdioUser(data[i].rdiouserid);
          }
        else
          users[i] = {"displayname":"", "rdiouserid":""};
        }
      }

      //Removing users
      for (var i in users) {
        if (!data[i]) {
          console.log("Removing user with mac: " + i);
          if (users[i].rdiouserid != "")
            handleRemovedRdioUser(users[i].rdiouserid);
            delete users[i];
          }
        }

      updateUsersView();
    });
  }

  function updateUsersView() {
    $("section.users").empty();
    for (var i in users) {
      var user_element = document.createElement('div');
      var front_face = document.createElement('div');
      var back_face = document.createElement('div');
      var name = document.createElement('h2');
      var edit = document.createElement('a');
      var edit_text = document.createTextNode('Edit')

      user_element.classList.add("user");
      front_face.classList.add("font-face");
      back_face.classList.add("back-face");
      edit.classList.add("edit");

      if(users[i].rdiouserid != "")
        var nameText = document.createTextNode(users[i].displayname);
      else {
        var nameText = document.createTextNode(i);
        name.classList.add('mac-address');
      }

      edit.appendChild(edit_text);
      name.appendChild(nameText);
      back_face.appendChild(name);
      back_face.appendChild(edit);
      user_element.appendChild(front_face);
      user_element.appendChild(back_face);

      $("section.users").append(user_element);
    }

    if (Object.keys(users).length) {
      $("#divUsers").show();
      $("#divPlayer").show();
      $("#divSpinner").hide();
    } else {
      $("#divUsers").hide();
      $("#divPlayer").hide();
      $("#divSpinner").show();
    }
  }

  function handleNewRdioUser(rdiouserid)
  {
    //do some magic with the userid and come back with a song id
    var songid = "a171827"

    $('#api').rdio().play(songid);
  }

  function  handleRemovedRdioUser(rdiouserid)
  {
    //stop playing this user's tracks

    //If this was the last person with an rdioid... stop all playback
    //if(Object.keys(users).length == 1)
    $('#api').rdio().stop();
  }
});
