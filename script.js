var playlists = {};
var artists = [];
var songs = [];
var accessToken = localStorage.getItem("accessToken")

async function getList(list) {

    var response = await fetch('https://api.spotify.com/v1/playlists/' + list, {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });
    var data = await response.json();
    if (data.error) {
      console.error(data.error.message)
    } else {
        console.log(data)
    }
}