import tls from "tls";
import { remoteMessageManager } from "./RemoteMessageManager.js";
import EventEmitter from "events";
import protobufjs from "protobufjs";

class RemoteManager extends EventEmitter {
    constructor(host, port, certs) {
        super();
        this.host = host;
        this.port = port;
        this.certs = certs;
    }

    async start() {
        return new Promise((resolve, reject) => {
            let options = {
                key : this.certs.key,
                cert: this.certs.cert,
                port: this.port,
                host : this.host,
                rejectUnauthorized: false
            };

            this.chunks = Buffer.from([]);
            this.error = null;
            this.autoReconnect = true;

            console.debug("Start Remote Connect");

            this.client = tls.connect(options, () => {
                //console.debug("Remote connected")
            });

            this.client.on('timeout', () => {
                console.debug('timeout');
                this.client.destroy();
            });

            // Le ping est reçu toutes les 5 secondes
            this.client.setTimeout(10000);

            this.client.on("secureConnect", () => {
                console.debug(this.host + " Remote secureConnect");
                reject = null;
                resolve(true);
            });

            this.client.on('data', (data) => {
                this.chunks = Buffer.concat([this.chunks, Buffer.from(data)]);
                if (this.chunks.length === 0) {
                    return;
                }

                let reader = protobufjs.Reader.create(this.chunks);
                let expectedSize = null;
                try {
                    expectedSize = reader.uint32();
                    expectedSize += reader.pos;
                } catch (error) {
                    if (! (error instanceof RangeError)) {
                        throw error;
                    }
                }

                if ((expectedSize !== null) && (this.chunks.length >= expectedSize)) {
                    let message = remoteMessageManager.RemoteMessage.decode(reader);
                    this.chunks = this.chunks.subarray(reader.pos);

                    if(!message.remotePingRequest){
                        //console.debug(this.host + " Receive : " + Array.from(this.chunks));
                        console.debug(this.host + " Receive : " + JSON.stringify(message.toJSON()));
                    }

                    if(message.remoteConfigure){
                        this.client.write(remoteMessageManager.createRemoteConfigure(
                            622,
                            "Build.MODEL",
                            "Build.MANUFACTURER",
                            1,
                            "Build.VERSION.RELEASE",
                            ));
                        this.emit('ready');
                    }
                    else if(message.remoteSetActive){
                        this.client.write(remoteMessageManager.createRemoteSetActive(622));
                    }
                    else if(message.remotePingRequest){
                        this.client.write(remoteMessageManager.createRemotePingResponse(message.remotePingRequest.val1));
                    }
                    else if(message.remoteImeKeyInject){
                        this.emit('current_app', message.remoteImeKeyInject.appInfo.appPackage);
                    }
                    else if(message.remoteImeBatchEdit){
                        console.debug("Receive IME BATCH EDIT" + message.remoteImeBatchEdit);
                    }
                    else if(message.remoteImeShowRequest){
                        console.debug("Receive IME SHOW REQUEST" + message.remoteImeShowRequest);
                    }
                    else if(message.remoteVoiceBegin){
                        //console.debug("Receive VOICE BEGIN" + message.remoteVoiceBegin);
                    }
                    else if(message.remoteVoicePayload){
                        //console.debug("Receive VOICE PAYLOAD" + message.remoteVoicePayload);
                    }
                    else if(message.remoteVoiceEnd){
                        //console.debug("Receive VOICE END" + message.remoteVoiceEnd);
                    }
                    else if(message.remoteStart){
                        this.emit('powered', message.remoteStart.started);
                    }
                    else if(message.remoteSetVolumeLevel){
                        this.emit('volume', {
                            level : message.remoteSetVolumeLevel.volumeLevel,
                            maximum : message.remoteSetVolumeLevel.volumeMax,
                            muted : message.remoteSetVolumeLevel.volumeMuted,
                        });
                        //console.debug("Receive SET VOLUME LEVEL" + message.remoteSetVolumeLevel.toJSON().toString());
                    }
                    else if(message.remoteSetPreferredAudioDevice){
                        //console.debug("Receive SET PREFERRED AUDIO DEVICE" + message.remoteSetPreferredAudioDevice);
                    }
                    else if(message.remoteError){
                        //console.debug("Receive REMOTE ERROR");
                        this.emit('error', {error : message.remoteError});
                    }
                    else{
                        console.log("What else ?");
                    }
                }
            });

            this.client.on('close', async (hasError) => {
                console.info(this.host + " Remote Connection closed ", hasError);
                if(hasError){
                    if (reject != null) {
                        reject(this.error.code);
                    }
                    if(this.error.code === "ECONNRESET"){
                        this.emit('unpaired');
                    }
                    else if(this.error.code === "ECONNREFUSED"){
                        // L'appareil n'est pas encore prêt : on relance
                        await this.maybeReconnect();
                    }
                    else if(this.error.code === "EHOSTDOWN"){
                        // L'appareil est down, on ne fait rien
                    }
                    else{
                        // Dans le doute on redémarre
                        await this.maybeReconnect();
                    }
                }
                else {
                    // Si pas d'erreur on relance. Si elle s'est éteinte alors une erreur empéchera de relancer encore
                    await this.maybeReconnect();
                }
            });

            this.client.on('error', (error) => {
                console.error(this.host, error);
                this.error = error;
            });
        });

    }

    async maybeReconnect() {
        if (this.autoReconnect) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.start().catch((error) => {
                console.error(error);
            });
        }
    }

    sendPower(){
        this.client.write(remoteMessageManager.createRemoteKeyInject(
            remoteMessageManager.RemoteDirection.SHORT,
            remoteMessageManager.RemoteKeyCode.KEYCODE_POWER));
    }

    sendKey(key, direction){
        this.client.write(remoteMessageManager.createRemoteKeyInject(
            direction,
            key));
    }

    sendAppLink(app_link){
        this.client.write(remoteMessageManager.createRemoteRemoteAppLinkLaunchRequest(app_link));
    }

    stop(){
        this.autoReconnect = false;
        this.client.destroy();
    }
}

export { RemoteManager };
