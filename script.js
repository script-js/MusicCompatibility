var playlists = [];
var artists = [];
var songs = [];
var similar = {
    artists: [],
    tracks: [],
    genres: []
};
var accessToken = sessionStorage.getItem("accessToken")

if (!accessToken) {
    chooser.innerHTML = `<button onclick="spotifyAuth()" class="loginBtn">
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="0" fill="none" width="20" height="20"></rect> <g> <path d="M10 2c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.7 11.5c-.1.2-.5.3-.7.2-2.1-1.2-4.7-1.5-7-.8-.3 0-.5-.1-.6-.4 0-.2.1-.5.4-.6 2.6-.8 5.4-.4 7.8.9.1.2.2.5.1.7zm1-2.1c-.1 0-.1 0 0 0-.2.3-.6.4-.9.2-2.4-1.4-5.3-1.7-8-.9-.3.1-.7-.1-.8-.4-.1-.4.1-.7.4-.9 3-.9 6.3-.5 9 1.1.3.2.4.6.3.9zm0-2.3c-2.6-1.5-6.8-1.7-9.3-.9-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-1 2.8-.8 7.5-.7 10.5 1.1.4.2.5.7.3 1-.3.4-.7.5-1.1.3z"></path> </g> </g></svg>
    Log in to Spotify
    </button>
    `
}

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
                sessionStorage.removeItem("accessToken")
                spotifyAuth()
            } else {
                alert("Error getting playlist: " + data.error.message)
            }
        } else {
            console.log(data)
            var plist = {
                id: list,
                name: data.name,
                icon: data.images[0].url,
                author: data.owner.display_name,
                tracks: [],
                artists: []
            };
            data.tracks.items.forEach(function (k) {
                var id = k.track.name
                var artistString = k.track.artists.map((x) => x.name).toString().replaceAll(",", ", ")
                plist.tracks.push(id + artistString)
                if (!songs.map((x) => x.title).includes(id)) {
                    songs.push({
                        artists: artistString,
                        icon: k.track.album.images[0].url,
                        title: id,
                        list
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
            var elem = document.createElement("div")
            elem.classList = "playlist"
            elem.innerHTML = `<img class="icon" src="${plist.icon}" /><div style="text-align:start"><span class="title">${plist.name}</span><br><span class="artists">${plist.author}</span></div>`
            listViewer.appendChild(elem)
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
                sessionStorage.removeItem("accessToken")
                spotifyAuth()
            } else {
                alert("Error getting playlist: " + data.error.message)
            }
        } else {
            console.log(data)
            data.items.forEach(function (k) {
                var id = k.track.name
                var artistString = k.track.artists.map((x) => x.name).toString().replaceAll(",", ", ")
                playlists[index].tracks.push(id + artistString)
                if (!songs.map((x) => x.title).includes(id)) {
                    songs.push({
                        artists: artistString,
                        icon: k.track.album.images[0].url,
                        title: id,
                        list
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
    if (!percent) { percent = 0 }
    console.log(percent)

    Array.from(circularProgress).forEach((progressBar) => {
        const progressValue = progressBar.querySelector(".percentage");
        const innerCircle = progressBar.querySelector(".inner-circle");
        let startValue = 0,
            progressColor = progressBar.getAttribute("data-progress-color");
        const progress = setInterval(() => {
            progressValue.textContent = `${startValue}% match`;

            progressBar.style.background = `conic-gradient(${progressColor} ${startValue * 3.6
                }deg,${progressBar.getAttribute("data-bg-color")} 0deg)`;
            if (startValue == percent) {
                clearInterval(progress);
            }
            startValue++;
        }, 1);
    });

}

async function showData() {
    statust.innerHTML = "Calculating compatibility..."
    progbar.value = 0
    progbar.max = 1 + artists.length;
    songs.forEach(function (s) {
        var isIn = 0;
        playlists.forEach(function (p) {
            if (p.tracks.includes(s.title + s.artists)) {
                isIn++;
            }
        })
        if (isIn == playlists.length) {
            similar.tracks.push(s)
        }
    })
    progbar.value++;
    for (var i = 0; i < artists.length; i++) {
        progbar.value++;
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
    progress.style.display = "none"
    results.style.display = "block"
    setTimeout(getScore, 500)
    if (similar.tracks.length > 0) {
        showTracks()
    } else {
        samesongs.innerHTML = "<h1>Songs</h1>You don't like any of the same songs"
    }
    if (similar.artists.length > 0) {
        similar.artists.forEach(function (a) {
            var elem = document.createElement("div")
            elem.classList = "artist"
            elem.onclick = function () { showArtistSongs(this) }
            elem.innerHTML = `<img class="icon" src="${a.icon}" /><span class="title">${a.name}</span>`
            sameartists.appendChild(elem)
        })
    } else {
        sameartists.innerHTML = "You don't like any of the same artists"
        samegenres.innerHTML = "nothing"
    }
    similar.genres.forEach(function (g) {
        var elem = document.createElement("div")
        elem.classList = "genre"
        elem.innerHTML = g
        samegenres.appendChild(elem)
    })
}

async function start() {
    chooser.style.display = "none"
    progress.style.display = "block"
    var lists = Array.from(chooser.querySelectorAll("input"));
    progbar.max = lists.length
    for (var i = 0; i < lists.length; i++) {
        var link = lists[i].value;
        if (link) {
            await getList(link.replace("https://open.spotify.com/playlist/", "").replace("http://open.spotify.com/playlist/", "").split("?")[0])
            progbar.value++;
        }
    }
    setTimeout(showData, 3)
}

function addList() {
    var newip = document.createElement("input")
    newip.placeholder = "Playlist URL"
    inputs.appendChild(newip)
}

function showArtistSongs(elem) {
    Array.from(sameartists.querySelectorAll(".artist")).forEach(function (e) {
        e.onclick = function () { showArtistSongs(elem) }
        e.classList = "artist"
    })
    var artistName = elem.querySelector(".title").innerText;
    elem.classList = "artist selected"
    elem.onclick = function () {
        showTracks()
        elem.onclick = function () { showArtistSongs(elem) }
        elem.classList = "artist"
    }
    samesongs.innerHTML = "";
    playlists.forEach(function (p) {
        var header = document.createElement("div")
        header.classList = "playlist header"
        header.innerHTML = `<img class="icon" src="${p.icon}" /><div style="text-align:start"><span class="title">${p.name}</span><br><span class="artists">${p.author}</span></div>`
        samesongs.appendChild(header)
        songs.forEach(function (s) {
            if (s.list == p.id && s.artists.includes(artistName)) {
                var song = document.createElement("div")
                song.classList = "song"
                song.innerHTML = `<img class="icon" src="${s.icon}" /><div style="text-align:start"><span class="title">${s.title}</span><br><span class="artists">${s.artists}</span></div>`
                samesongs.appendChild(song)
            }
        })
    })
}

function showTracks() {
    samesongs.innerHTML = "";
    similar.tracks.forEach(function (s) {
        var elem = document.createElement("div")
        elem.classList = "song"
        elem.innerHTML = `<img class="icon" src="${s.icon}" /><div style="text-align:start"><span class="title">${s.title}</span><br><span class="artists">${s.artists}</span></div>`
        samesongs.appendChild(elem)
    })
}