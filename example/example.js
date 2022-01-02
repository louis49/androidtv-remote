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

androidRemote.on('error', function (error){
    console.error("Error : " + error);
});

androidRemote.on('ready', async function (){
    let cert = androidRemote.getCertificate();

    androidRemote.sendKey(RemoteKeyCode.BUTTON0, RemoteDirection.START_LONG)
    await new Promise(resolve => setTimeout(resolve, 100));
    androidRemote.sendKey(RemoteKeyCode.BUTTON0, RemoteDirection.END_LONG)

    androidRemote.sendKey(RemoteKeyCode.MUTE, RemoteDirection.SHORT)

    androidRemote.sendAppLink("https://www.disneyplus.com");
}.bind(this))

let started = await androidRemote.start();

androidRemote.stop();

await androidRemote.start();








