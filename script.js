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
    const generateRandomString = (length) => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce((acc, x) => acc + possible[x % possible.length], "");
    }

    const codeVerifier = generateRandomString(64);

    const sha256 = async (plain) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(plain)
        return window.crypto.subtle.digest('SHA-256', data)
    }

    const base64encode = (input) => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }

    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64encode(hashed);


    const clientId = '75cbbb83721048b18a5cf0eb9e912ff7';
    const redirectUri = 'https://musiccompatibility.pages.dev/';

    const scope = 'user-read-private user-read-email';
    const authUrl = new URL("https://accounts.spotify.com/authorize")

    // generated in the previous step
    window.localStorage.setItem('code_verifier', codeVerifier);

    const params = {
        response_type: 'code',
        client_id: clientId,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    }

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
}