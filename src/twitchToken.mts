import { TwitchFragment, parseTwitchFragment } from "./parseTwitchFragment.mjs";

const StorageKey = 'twitchState';
// change this to use your own app
const ClientID = 'c27ufnb754plcjr10uez68huahputt';
// enables reading/sending of chats, reading of the stream key and the broadcast id
// so enough to get twitch chat inbound and start a stream automatically
// moderator:read:followers - follow
// channel:read:subscriptions - subscribe/resub/gifts
// bits:read - cheer
// channel:manage:redemptions - channel points redeemed reward
const Scope = 'chat:read chat:edit channel:read:stream_key user:read:broadcast moderator:read:followers channel:read:subscriptions bits:read channel:manage:redemptions';

const requestAnchor = document.getElementById('request') as HTMLAnchorElement;
if (!requestAnchor) {
	throw Error('Request button not found');
}
const tokenContainer = document.getElementById('access-token') as HTMLDivElement;
if (!tokenContainer) throw Error('Token container not found');
const result = document.getElementById('result') as HTMLDivElement;
if (!result) throw Error('Result container not found');


const setResult = (t: string) => {
	result.style.display = 'inline-block';
	result.innerText = t;
}

const handleValidation = async ({accessToken, state}: TwitchFragment) => {
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
}

const setupRequestLink = () => {
	const randomData = new Uint32Array(20);
	self.crypto.getRandomValues(randomData);

	const stateHex = [...randomData].map(v => v.toString(16).padStart(2, '0')).join('');
	window.sessionStorage.setItem(StorageKey, stateHex);
	const thisUrl = `${document.location.origin}${document.location.pathname}`;
	console.debug('redirect_uri', thisUrl);
	requestAnchor.href = "https://id.twitch.tv/oauth2/authorize?response_type=token" +
		`&client_id=${ClientID}` +
		`&scope=${encodeURIComponent(Scope)}` +
		`&redirect_uri=${encodeURIComponent(thisUrl)}` +
		`&state=${stateHex}`;
	requestAnchor.innerText = 'Get Access Token';
}

const launch = async () => {
	const fragment = parseTwitchFragment();
	if (fragment) {
		requestAnchor.style.display = 'none';
		await handleValidation(fragment);
		return;
	}

	setupRequestLink();
}

launch().catch(e => console.error(e));