import {
    AndroidRemote,
    RemoteKeyCode,
    RemoteDirection
} from "androidtv-remote";

import Readline from "readline";

let line = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let host = "192.168.1.31";
let options = {
    pairing_port : 6467,
    remote_port : 6466,
    name : 'androidtv-remote',
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

androidRemote.on('error', (error) => {
    console.error("Error : " + error);
});

androidRemote.on('unpaired', () => {
    console.error("Unpaired");
});

androidRemote.on('ready', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    let cert = androidRemote.getCertificate();

    androidRemote.sendKey(RemoteKeyCode.KEYCODE_0, RemoteDirection.START_LONG)
    await new Promise(resolve => setTimeout(resolve, 100));
    androidRemote.sendKey(RemoteKeyCode.KEYCODE_0, RemoteDirection.END_LONG)

    androidRemote.sendKey(RemoteKeyCode.KEYCODE_MUTE, RemoteDirection.SHORT)
    await new Promise(resolve => setTimeout(resolve, 10000));
    androidRemote.sendAppLink("https://www.disneyplus.com");
});

let started = await androidRemote.start();










