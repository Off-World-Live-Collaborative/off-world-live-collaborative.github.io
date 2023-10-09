import { parseTwitchFragment } from "./parseTwitchFragment.mjs";
const StorageKey = 'twitchState';
const ClientID = 'c27ufnb754plcjr10uez68huahputt';
const CheckboxIds = ['chat-read', 'chat-send', 'follow', 'subscribe', 'cheer', 'redeem'];
const requestAnchor = document.getElementById('request');
if (!requestAnchor) {
    throw Error('Request button not found');
}
const tokenContainer = document.getElementById('access-token');
if (!tokenContainer)
    throw Error('Token container not found');
const selection = document.getElementById('selection');
if (!selection)
    throw Error('selection container not found');
const result = document.getElementById('result');
if (!result)
    throw Error('Result container not found');
const setResult = (t) => {
    result.style.display = 'inline-block';
    result.innerText = t;
};
const getScope = () => {
    let scope = 'channel:read:stream_key user:read:broadcast ';
    for (const [, checkbox] of Checkboxes) {
        if (checkbox.checked)
            scope += `${checkbox.value} `;
    }
    return scope.slice(0, -1);
};
const handleValidation = async ({ accessToken, state }) => {
    const savedState = window.sessionStorage.getItem(StorageKey);
    if (!savedState) {
        setResult('❌ Redirect invalid');
        return;
    }
    if (savedState != state) {
        setResult('❌ Redirect invalid -- triggered from a different browser / computer. Refresh page and try again');
        return;
    }
    tokenContainer.style.display = 'inline-block';
    tokenContainer.innerText = accessToken;
    window.sessionStorage.clear();
    setResult('Success ✅');
};
const setupRequestLink = () => {
    const randomData = new Uint32Array(20);
    self.crypto.getRandomValues(randomData);
    const stateHex = [...randomData].map(v => v.toString(16).padStart(2, '0')).join('');
    window.sessionStorage.setItem(StorageKey, stateHex);
    const thisUrl = `${document.location.origin}${document.location.pathname}`;
    requestAnchor.href = "https://id.twitch.tv/oauth2/authorize?response_type=token" +
        `&client_id=${ClientID}` +
        `&scope=${encodeURIComponent(getScope())}` +
        `&redirect_uri=${encodeURIComponent(thisUrl)}` +
        `&state=${stateHex}`;
};
const Checkboxes = new Map();
for (const id of CheckboxIds) {
    const element = document.getElementById(id);
    if (!element)
        throw Error(`${id} input not found`);
    element.addEventListener('change', setupRequestLink, false);
    Checkboxes.set(id, element);
}
const launch = async () => {
    const fragment = parseTwitchFragment();
    if (fragment) {
        requestAnchor.style.display = 'none';
        selection.style.display = 'none';
        await handleValidation(fragment);
        return;
    }
    requestAnchor.innerText = 'Get Access Token';
    setupRequestLink();
};
launch().catch(e => console.error(e));
//# sourceMappingURL=twitchToken.mjs.map