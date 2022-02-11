# androidtv-remote

[![npm-version](https://badgen.net/npm/v/androidtv-remote)](https://www.npmjs.com/package/androidtv-remote)
[![npm-total-downloads](https://badgen.net/npm/dt/androidtv-remote)](https://www.npmjs.com/package/androidtv-remote)

[![Donate](https://badgen.net/badge/paypal/donate?icon=https://simpleicons.now.sh/paypal/fff)](https://www.paypal.com/donate/?hosted_button_id=B8NGNPFGK69BY)
[![Donate](https://badgen.net/badge/buymeacoffee/donate?icon=https://simpleicons.now.sh/buymeacoffee/fff)](https://www.buymeacoffee.com/louis49github)

# Installation

```
npm install androidtv-remote
```

# Usage

After first succeeded pairing, you can reuse generated certs with `getCertificate()` by sending it in constructor options.

```js
let host = "192.168.1.12";
let options = {
    pairing_port : 6467,
    remote_port : 6466,
    name : 'androidtv-remote',
    cert: {},
}

let androidRemote = new AndroidRemote(host, options)

androidRemote.on('secret', () => {
    line.question("Code : ", async (code) => {
        androidRemote.sendCode(code);
    });
});

androidRemote.on('powered', (powered) => {
    console.debug("Powered : " + powered)
});

androidRemote.on('volume', (volume) => {
    console.debug("Volume : " + volume.level + '/' + volume.maximum + " | Muted : " + volume.muted);
});

androidRemote.on('current_app', (current_app) => {
    console.debug("Current App : " + current_app);
});

androidRemote.on('ready', async () => {
    let cert = androidRemote.getCertificate();

    androidRemote.sendKey(RemoteKeyCode.MUTE, RemoteDirection.SHORT)

    androidRemote.sendAppLink("https://www.disneyplus.com");
});

let started = await androidRemote.start();
```
# Events

### `Event: secret`

Emitted when androidtv ask for code.

### `Event: powered`

Emitted when androidtv is powering on/off.

### `Event: volume`

Emitted when androidtv is changing volume/mute.

### `Event: current_app`

Emitted when androidtv is changing current app.

### `Event: error`

Emitted when androidtv has a problem : by example when you send a wrong app_link with `sendAppLink(app_link)`.

# Commands

### `Command: sendCode(code)`
- `code` : You need to pass the shown code on the TV when asked

### `Command: sendKey(KeyCode, Direction)`
- `KeyCode` : Any key of https://developer.android.com/reference/android/view/KeyEvent?hl=fr
- `Direction` : 
  * `START_LONG` : Start long push
  * `END_LONG` : Stop long push
  * `SHORT` : Simple push

### `Command : sendAppLink(app_link)`
- `app_link` : You can find them in some Android apps by seeking 'android:host' in Android-Manifest
  * You can use [jadx](https://github.com/skylot/jadx) to decompile the Android app and read Android-Manifest
  * Example : "https://www.netflix.com/title.*"

# Others

* If you need to decrypt some new messages from android TV, pass an Hexa form of buffer here : https://protogen.marcgravell.com/decode
* You can take a look at my other package for homebridge that use this current one: [homebridge-plugin-androidtv](https://github.com/louis49/homebridge-plugin-androidtv)

# License

MIT
