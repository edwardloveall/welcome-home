var duration = 1; // track the duration of the currently playing track
$(document).ready(function () {
    $('#api').bind('ready.rdio', function () {
        $(this).rdio().play('a171827');
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
    });
    $('#api').bind('playStateChanged.rdio', function (e, playState) {
        if (playState == 0) { // paused
            $('#play').show();
            $('#pause').hide();
        } else {
            $('#play').hide();
            $('#pause').show();
        }
    });
    // this is a valid playback token for localhost.
    // but you should go get your own for your own domain.
    $('#api').rdio('GAlNi78J_____zlyYWs5ZG02N2pkaHlhcWsyOWJtYjkyN2xvY2FsaG9zdEbwl7EHvbylWSWFWYMZwfc=');

    $('#previous').click(function () { $('#api').rdio().previous(); });
    $('#play').click(function () { $('#api').rdio().play(); });
    $('#pause').click(function () { $('#api').rdio().pause(); });
    $('#next').click(function () { $('#api').rdio().next(); });
});