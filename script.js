var playlists = {};
var artists = [];
var songs = [];
var accessToken = "H5hqBNbEeTvlNoxCB7jv12WwNV15H96b9VlEw58IOhoP5aAHXCAOLzUcG97RA7kH"

async function getList(list) {

    var response = await fetch('https://api.spotify.com/v1/playlists/' + list, {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });
    var data = await response.json();
    if (data.error) {
      console.error(data.error.message)
    }
}