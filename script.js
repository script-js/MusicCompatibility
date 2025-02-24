var playlists = [];
var artists = [];
var songs = [];
var similar = {
   artists: [],
   tracks: [],
   genres: [] 
};
var accessToken = localStorage.getItem("accessToken")

async function getList(list) {
    var response = await fetch('https://api.spotify.com/v1/playlists/' + list, {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });
    var data = await response.json();
    if (data.error) {
      if (data.error.includes("access token")) {
        localStorage.removeItem("accessToken")
        location.reload()
      } else {
        alert("Error getting playlist: " + data.error.message)
      }
    } else {
      console.log(data)
      var plist = {
        name: data.name,
        icon: data.images[0],
        author: data.owner.display_name,
        tracks: [],
        artists: []
      };
      data.tracks.items.forEach(function (k) {
        var id = k.track.uri.replace("spotify:track:","")
        plist.tracks.push(id)
        if (!songs.includes(id)) {
            songs.push(id)
        }
        k.track.artists.forEach(function(artist) {
            var aid = artist.uri.replace("spotify:artist:","")
            if (!plist.artists.includes(aid)) {
              plist.artists.push(aid)
            }
            if (!artists.includes(aid)) {
                artists.push(aid)
            }
        })
      });
      playlists.push(plist)
    }
}

function findSameSongs() {
    songs.forEach(function(k) {
        
    })
}