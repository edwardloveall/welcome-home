var duration = 1; // track the duration of the currently playing track
var playlist = [];
var currentPlaylistIndex = 0;
var STOPPED = 2;
var PAUSED = 0;
var PLAYING = 1;
var BUFFERING = 3;
var currentPlayState = STOPPED;
var isFirstUser = true;

$(document).ready(function () {
    $('#api').bind('ready.rdio', function () {
        //$(this).rdio().play('a171827');
    });
    $('#api').bind('playingTrackChanged.rdio', function (e, playingTrack, sourcePosition) {
        if (playingTrack) {
            duration = playingTrack.duration;
            $('#art').attr('src', playingTrack.icon);
            $('#track').text(playingTrack.name);
            $('#album').text(playingTrack.album);
            $('#artist').text(playingTrack.artist);
        }
    });
    $('#api').bind('positionChanged.rdio', function (e, position) {
        $('#position').css('width', Math.floor(100 * position / duration) + '%');
        if (Math.floor(100 * position / duration) >= 99)
            playNextTrack();
    });
    $('#api').bind('playStateChanged.rdio', function (e, playState) {
        if (playState == PAUSED || playState == 4) { // paused
            currentPlayState = PAUSED;
            console.log("player state: paused");
            $('#play').show();
            $('#pause').hide();
        } else if (playState == PLAYING) { // playing
            $('#play').hide();
            $('#pause').show();
            console.log("player state: playing");
            currentPlayState = PLAYING;
        }
        else if (playState == BUFFERING) {
            currentPlayState = BUFFERING;
            console.log("player state: buffering");
        } else if (playState == STOPPED) {
            currentPlayState = STOPPED;
            console.log("player state: stopped");
        }
    });
    // this is a valid playback token for localhost.
    // but you should go get your own for your own domain.
    $('#api').rdio('GAlNi78J_____zlyYWs5ZG02N2pkaHlhcWsyOWJtYjkyN2xvY2FsaG9zdEbwl7EHvbylWSWFWYMZwfc=');

    $('#previous').click(function () { playPreviousTrack() });
    $('#play').click(function () { $('#api').rdio().play(); });
    $('#pause').click(function () { $('#api').rdio().pause(); });
    $('#next').click(function () { playNextTrack(); });


    function playNextTrack() {
        if (playlist[currentPlaylistIndex + 1]) {
            currentPlaylistIndex++;
            $("#api").rdio().play(playlist[currentPlaylistIndex].trackid);
            updatePlaylistView();
        }
        else {
            console.log("playPrevioustrack(): no next track to play");
        }
    }

    function playPreviousTrack() {
        if (playlist[currentPlaylistIndex - 1]) {
            currentPlaylistIndex--;
            $("#api").rdio().play(playlist[currentPlaylistIndex].trackid);
            updatePlaylistView();
        }
        else {
            console.log("playPrevioustrack(): no previous track to play");
        }
    }
});