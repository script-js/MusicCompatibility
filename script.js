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
        if (data.error == "The access token expired") {
            localStorage.removeItem("accessToken")
            spotifyAuth()
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
            var id = k.track.id
            plist.tracks.push(id)
            if (!songs.map((x) => x.id).includes(id)) {
                songs.push({
                    id,
                    artists: k.track.artists.map((x) => x.name).toString().replace(",", ", "),
                    icon: k.track.album.images[0].url,
                    title: k.track.name
                })
            }
            k.track.artists.forEach(function (artist) {
                if (!plist.artists.includes(artist.id)) {
                    plist.artists.push(artist.id)
                }
                if (!artists.map((x) => x.id).includes(artist.id)) {
                    artists.push({
                        id: artist.id,
                        url: artist.href
                    })
                }
            })
        });
        playlists.push(plist)
    }
}

function populateSimilar() {
    songs.forEach(function (s) {
        var isIn = 0;
        playlists.forEach(function (p) {
            if (p.tracks.includes(s.id)) {
                isIn++;
            }
        })
        if (isIn == playlists.length) {
            similar.tracks.push(s)
        }
    })
    artists.forEach(async function (a) {
        var isIn = 0;
        playlists.forEach(function (p) {
            if (p.artists.includes(a.id)) {
                isIn++;
            }
        })
        if (isIn == playlists.length) {
            var artistData = await (await fetch(a.url, {
                headers: {
                    Authorization: 'Bearer ' + accessToken
                }
            })).json();
            similar.artists.push({
                id: a.id,
                name: artistData.name,
                icon: artistData.images[0].url
            })
            artistData.genres.forEach(function (g) {
                if (!similar.genres.includes(g)) {
                    similar.genres.push(g)
                }
            })
        }
    })
}

function getScore() {
    var trackCompat = (similar.tracks.length / (songs.length / 2)) * 100
    var artistCompat = (similar.artists.length / artists.length) * 100;
    var percent = Math.ceil((trackCompat / 2) + (artistCompat / 2))
    const circularProgress = document.querySelectorAll(".circular-progress");

    Array.from(circularProgress).forEach((progressBar) => {
        const progressValue = progressBar.querySelector(".percentage");
        const innerCircle = progressBar.querySelector(".inner-circle");
        let startValue = 0,
            speed = 1,
            progressColor = progressBar.getAttribute("data-progress-color");
        if (percent) {
            const progress = setInterval(() => {
                startValue++;
                progressValue.textContent = `${startValue}%`;
                progressValue.style.color = `${progressColor}`;

                progressBar.style.background = `conic-gradient(${progressColor} ${startValue * 3.6
                    }deg,${progressBar.getAttribute("data-bg-color")} 0deg)`;
                if (startValue == percent) {
                    clearInterval(progress);
                }
            }, speed);
        }
    });

}

function showData() {
    getScore()
    songs.forEach(function(s) {
        var elem = document.createElement("div")
        elem.classList = "song"
        elem.innerHTML = `<img class="album-cover" src="${s.icon}" /><span class="title">${s.title}</span><br><span class="artists">${s.artists}</span>`
        samesongs.appendChild(elem)
    })
}