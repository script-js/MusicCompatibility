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
    return new Promise(async function (resolve) {
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
                        artists: k.track.artists.map((x) => x.name).toString().replaceAll(",", ", "),
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
            if (data.tracks.next) {
                await getPage(data.tracks.next, playlists.length - 1)
            }
            resolve()
        }
    })
}

async function getPage(url, index) {
    return new Promise(async function (resolve) {
        var response = await fetch(url, {
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
            data.items.forEach(function (k) {
                var id = k.track.id
                playlists[index].tracks.push(id)
                if (!songs.map((x) => x.id).includes(id)) {
                    songs.push({
                        id,
                        artists: k.track.artists.map((x) => x.name).toString().replaceAll(",", ", "),
                        icon: k.track.album.images[0].url,
                        title: k.track.name
                    })
                }
                k.track.artists.forEach(function (artist) {
                    if (!playlists[index].artists.includes(artist.id)) {
                        playlists[index].artists.push(artist.id)
                    }
                    if (!artists.map((x) => x.id).includes(artist.id)) {
                        artists.push({
                            id: artist.id,
                            url: artist.href
                        })
                    }
                })
            });
            if (data.next) {
                await getPage(data.next, playlists.length - 1)
            }
            resolve()
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
            progressColor = progressBar.getAttribute("data-progress-color");
        if (percent) {
            const progress = setInterval(() => {
                startValue++;
                progressValue.textContent = `${startValue}% match`;

                progressBar.style.background = `conic-gradient(${progressColor} ${startValue * 3.6
                    }deg,${progressBar.getAttribute("data-bg-color")} 0deg)`;
                if (startValue == percent) {
                    clearInterval(progress);
                }
            }, 1);
        }
    });

}

function showData() {
    chooser.style.display = "none"
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
    for (var i = 0; i < artists.length; i++) {
        var a = artists[i]
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
    }
    results.style.display = "block"
    getScore()
    similar.tracks.forEach(function (s) {
        var elem = document.createElement("div")
        elem.classList = "song"
        elem.innerHTML = `<img class="icon" src="${s.icon}" /><div style="text-align:start"><span class="title">${s.title}</span><br><span class="artists">${s.artists}</span></div>`
        samesongs.appendChild(elem)
    })
    similar.artists.forEach(function (a) {
        var elem = document.createElement("div")
        elem.classList = "artist"
        elem.innerHTML = `<img class="icon" src="${a.icon}" /><span class="title">${a.name}</span>`
        sameartists.appendChild(elem)
    })
}

async function start() {
    var lists = Array.from(chooser.querySelectorAll("input"));
    console.log(0)
    for (var i = 0; i < lists.length; i++) {
        var link = lists[i].value;
        if (link) {
            await getList(link.replace("https://open.spotify.com/playlist/", "").replace("http://open.spotify.com/playlist/", "").split("?")[0])
        }
    }
    setTimeout(showData,3)
}

function addList() {
    var newip = document.createElement("input")
    newip.placeholder = "Playlist URL"
    inputs.appendChild(newip)
}