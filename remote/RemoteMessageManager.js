import protobufjs from "protobufjs";
import { system } from "systeminformation"

class RemoteMessageManager {
    constructor() {
        this.root = protobufjs.loadSync("remote/remotemessage.proto");
        this.RemoteMessage = this.root.lookupType("remote.RemoteMessage");
        this.RemoteKeyCode = this.root.lookupEnum("remote.RemoteKeyCode").values;
        this.RemoteDirection = this.root.lookupEnum("remote.RemoteDirection").values;

        system().then(function (data){
            this.manufacturer = data.manufacturer;
            this.model = data.model;
        }.bind(this))
    }

    create(payload){
        if(!payload.remotePingResponse){
            console.debug("Create Remote " + JSON.stringify(payload));
        }

        let errMsg = this.RemoteMessage.verify(payload);
        if (errMsg)
            throw Error(errMsg);

        let message = this.RemoteMessage.create(payload);

        let array = this.RemoteMessage.encodeDelimited(message).finish()

        if(!payload.remotePingResponse){
            console.debug("Sending " + Array.from(array));
        }

        return array;
    }

    createRemoteConfigure(code1, model, vendor, unknown1, unknown2){
        let message = this.create({
            remoteConfigure:{
                code1 : 622,
                deviceInfo : {
                    model : this.model,
                    vendor : this.manufacturer,
                    unknown1 : 1,
                    unknown2 : "1",
                    packageName : "androitv-remote",
                    appVersion : "1.0.0",
                }
            }
        });

        return message;
    }

    createRemoteSetActive(active){
        return this.create({
            remoteSetActive:{
                active:active,
            }
        });
    }

    createRemotePingResponse(val1){
        return this.create({
            remotePingResponse:{
                val1:val1,
            }
        });
    }

    createRemoteKeyInject(direction, keyCode) {
        return this.create({
            remoteKeyInject:{
                keyCode : keyCode,
                direction : direction,
            }
        });
    }

    createRemoteAdjustVolumeLevel(level) {
        return this.create({
            remoteAdjustVolumeLevel : level,
        });
    }

    createRemoteResetPreferredAudioDevice() {
        return this.create({
            remoteResetPreferredAudioDevice : {},
        });
    }

    createRemoteImeKeyInject(appPackage, status) {
        return this.create({
            remoteImeKeyInject: {
                textFieldStatus : status,
                appInfo:{
                    appPackage:appPackage,
                }
            }
        });
    }

    createRemoteRemoteAppLinkLaunchRequest(app_link) {
        return this.create({
            remoteAppLinkLaunchRequest : {
                appLink : app_link
            }
        });
    }

    parse(buffer){
        return this.RemoteMessage.decodeDelimited(buffer);
    }

}
let remoteMessageManager = new RemoteMessageManager();

export { remoteMessageManager };
