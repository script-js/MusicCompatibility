var playlists = {};
var artists = [];
var songs = [];
var accessToken = "63aa6906d3444b228c2fcd3fbf882bf0"

async function getList(list) {

    var response = await fetch('https://api.spotify.com/v1/playlists/' + list, {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });

    var data = await response.json();
    return data;
}

async function authorize() {
    var client_id = 'CLIENT_ID';
    var client_secret = 'CLIENT_SECRET';

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var token = body.access_token;
        }
    });
}