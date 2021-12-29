# androidtv-remote

[![npm-version](https://badgen.net/npm/v/androidtv-remote)](https://www.npmjs.com/package/androidtv-remote)
[![npm-total-downloads](https://badgen.net/npm/dt/androidtv-remote)](https://www.npmjs.com/package/androidtv-remote)

## Installation

```
npm install androidtv-remote
```

## Usage

After first succeeded pairing, you can reuse generated certs with `getCertificate()` by sending it in constructor options.

```js
let host = "Android.local";
let options = {
    pairing_port : 6467,
    remote_port : 6466,
    name : 'androidtv-remote',
    cert: {},
}

let androidRemote = new AndroidRemote(host, options)

androidRemote.on('secret', function (){
    line.question("Code : ", async function (code){
        androidRemote.sendCode(code);
    }.bind(this));
});

androidRemote.on('powered', function (powered){
    console.debug("Powered : " + powered)
});

androidRemote.on('volume', function (volume){
    console.debug("Volume : " + volume.level + '/' + volume.maximum + " | Muted : " + volume.muted);
});

androidRemote.on('current_app', function (current_app){
    console.debug("Current App : " + current_app);
});

androidRemote.on('ready', async function (){
    let cert = androidRemote.getCertificate();

    androidRemote.sendKey(RemoteKeyCode.MUTE, RemoteDirection.SHORT)

    androidRemote.sendAppLink("https://www.disneyplus.com");
}.bind(this))

let started = await androidRemote.start();
```
## Events

#### `Event: secret`

Emitted when androidtv ask for code.

#### `Event: powered`

Emitted when androidtv is powering on/off.

#### `Event: volume`

Emitted when androidtv is changing volume/mute.

#### `Event: current_app`

Emitted when androidtv is changing current app.

## Commands

#### `Command: sendKey(KeyCode, Direction)`
- `KeyCode` : Any key of https://developer.android.com/reference/android/view/KeyEvent?hl=fr
- `Direction` : 
  * `START_LONG` : Start long push
  * `END_LONG` : Stop long push
  * `SHORT` : Simple push


## License

MIT
