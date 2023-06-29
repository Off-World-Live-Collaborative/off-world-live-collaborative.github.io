export const parseTwitchFragment = () => {
    const hash = document.location.hash.substring(1);
    if (hash.length < 2) {
        return false;
    }
    const elements = hash.split('&');
    let accessToken = '', scope = '', state = '';
    for (const element of elements) {
        const keyVal = element.split('=');
        if (keyVal.length < 2) {
            console.error('Unknown field found:', keyVal);
            continue;
        }
        const val = decodeURIComponent(keyVal[1]);
        switch (keyVal[0]) {
            case 'access_token':
                accessToken = val;
                break;
            case 'scope':
                scope = val;
                break;
            case 'state':
                state = val;
                break;
        }
    }
    return {
        accessToken,
        state,
        scope,
    };
};
//# sourceMappingURL=parseTwitchFragment.mjs.map