import { TwitchFragment, parseTwitchFragment } from "./parseTwitchFragment.mjs";

const StorageKey = 'twitchState';
// change this to use your own app
const ClientID = 'c27ufnb754plcjr10uez68huahputt';

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

const getScope = (): string => {
	let scope = 'channel:read:stream_key user:read:broadcast ';

	// Reading Chat
	const chatRead = document.getElementById('chat-read') as HTMLInputElement;
	if (!chatRead) throw Error('chat-read input not found');
	if (chatRead.checked) scope += 'chat:read ';

	// Sending Chat
	const chatSend = document.getElementById('chat-send') as HTMLInputElement;
	if (!chatSend) throw Error('chat-send input not found');
	if (chatSend.checked) scope += 'chat:edit ';

	// Follow
	const follow = document.getElementById('follow') as HTMLInputElement;
	if (!follow) throw Error('follow input not found');
	if (follow.checked) scope += 'moderator:read:followers ';

	// Subscription/Resub/Gift
	const subscribe = document.getElementById('subscribe') as HTMLInputElement;
	if (!subscribe) throw Error('subscribe input not found');
	if (subscribe.checked) scope += 'channel:read:subscriptions ';

	// Cheer
	const cheer = document.getElementById('cheer') as HTMLInputElement;
	if (!cheer) throw Error('cheer input not found');
	if (cheer.checked) scope += 'bits:read ';

	// Redeem Channel Reward
	const redeem = document.getElementById('redeem') as HTMLInputElement;
	if (!redeem) throw Error('redeem input not found');
	if (redeem.checked) scope += 'channel:manage:redemptions ';

	// Remove trailing whitespace
	return scope.slice(0, -1);
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
		`&scope=${encodeURIComponent(getScope())}` +
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