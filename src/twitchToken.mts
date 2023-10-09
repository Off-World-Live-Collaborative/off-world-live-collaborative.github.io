import { TwitchFragment, parseTwitchFragment } from "./parseTwitchFragment.mjs";

const StorageKey = 'twitchState';
// change this to use your own app
const ClientID = 'c27ufnb754plcjr10uez68huahputt';
const CheckboxIds = ['chat-read', 'chat-send', 'follow', 'subscribe', 'cheer', 'redeem'];

const requestAnchor = document.getElementById('request') as HTMLAnchorElement;
if (!requestAnchor) {
	throw Error('Request button not found');
}
const tokenContainer = document.getElementById('access-token') as HTMLDivElement;
if (!tokenContainer) throw Error('Token container not found');
const selection = document.getElementById('selection') as HTMLDivElement;
if (!selection) throw Error('selection container not found');
const result = document.getElementById('result') as HTMLDivElement;
if (!result) throw Error('Result container not found');

const setResult = (t: string) => {
	result.style.display = 'inline-block';
	result.innerText = t;
}

const getScope = (): string => {
	let scope = 'channel:read:stream_key user:read:broadcast ';

	for (const [, checkbox] of Checkboxes) {
		if (checkbox.checked) scope += `${checkbox.value} `
	}

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
	// console.debug('redirect_uri', thisUrl);
	requestAnchor.href = "https://id.twitch.tv/oauth2/authorize?response_type=token" +
		`&client_id=${ClientID}` +
		`&scope=${encodeURIComponent(getScope())}` +
		`&redirect_uri=${encodeURIComponent(thisUrl)}` +
		`&state=${stateHex}`;
}
const Checkboxes = new Map<string, HTMLInputElement>();
for (const id of CheckboxIds) {
	const element = document.getElementById(id) as HTMLInputElement;
	if (!element) throw Error(`${id} input not found`);
	element.addEventListener('change', setupRequestLink, false);
	Checkboxes.set(id, element);
}

const launch = async () => {
	const fragment = parseTwitchFragment();
	if (fragment) {
		requestAnchor.style.display = 'none';
		selection.style.display = 'none'
		await handleValidation(fragment);
		return;
	}

	requestAnchor.innerText = 'Get Access Token';
	setupRequestLink();
}

launch().catch(e => console.error(e));