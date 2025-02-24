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
      if (data.error == "Invalid access token.") {
        localStorage.removeItem("accessToken")
        location.reload()
      } else {
        alert("Error getting playlist: " + data.error.message)
      }
    } else {
      console.log(data)
      playlists[list] = {
        name: data.name,
        icon: data.images[0],
        author: data.owner.display_name,
        tracks: [],
        artists: []
      };
      data.tracks.items.forEach(function (k) {
        var id = k.track.uri.replace("spotify:track:","")
        playlists[list].tracks.push(id)
        if (!songs.includes(id)) {
            songs.push(id)
        }
        k.track.artists.forEach(function(artist) {
            var aid = artist.uri.replace("spotify:artist:","")
            if (!playlists[list].artists.includes(aid)) {
              playlists[list].artists.push(aid)
            }
            if (!artists.includes(aid)) {
                artists.push(aid)
            }
        })
      });
    }
}