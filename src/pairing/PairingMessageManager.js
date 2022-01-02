import protobufjs from "protobufjs";
import {system} from "systeminformation";
import * as path from "path";

class PairingMessageManager {
    constructor(){
        this.root = protobufjs.loadSync(path.join(__dirname,"pairingmessage.proto"));

        this.PairingMessage = this.root.lookupType("pairing.PairingMessage");
        this.Status = this.root.lookupEnum("pairing.PairingMessage.Status").values;
        this.RoleType = this.root.lookupEnum("RoleType").values;
        this.EncodingType = this.root.lookupEnum("pairing.PairingEncoding.EncodingType").values;

        system().then(function (data){
            pairingMessageManager.manufacturer = data.manufacturer;
            pairingMessageManager.model = data.model;
        });
    }

    create(payload){
        let errMsg = this.PairingMessage.verify(payload);
        if (errMsg)
            throw Error(errMsg);

        let message = this.PairingMessage.create(payload);

        return this.PairingMessage.encodeDelimited(message).finish();
    }

    createPairingRequest(service_name){
        return this.create({
            pairingRequest: {
                serviceName: service_name,
                clientName: this.model,
            },
            status: this.Status.STATUS_OK,
            protocolVersion: 2
        });
    }

    createPairingOption(){
        return this.create({
            pairingOption: {
                preferredRole : this.RoleType.ROLE_TYPE_INPUT,
                inputEncodings : [{
                    type : this.EncodingType.ENCODING_TYPE_HEXADECIMAL,
                    symbolLength : 6
                }]
            },
            status: this.Status.STATUS_OK,
            protocolVersion: 2
        });
    }

    createPairingConfiguration(){
        return this.create({
            pairingConfiguration: {
                clientRole : this.RoleType.ROLE_TYPE_INPUT,
                encoding : {
                    type : this.EncodingType.ENCODING_TYPE_HEXADECIMAL,
                    symbolLength : 6
                }
            },
            status: this.Status.STATUS_OK,
            protocolVersion: 2
        });
    }

    createPairingSecret(secret){
        let json = {
            pairingSecret: {
                secret : secret
            },
            status: this.Status.STATUS_OK,
            protocolVersion: 2
        };
        return this.create(json);
    }

    parse(buffer){
        return this.PairingMessage.decodeDelimited(buffer);
    }

}
let pairingMessageManager = new PairingMessageManager()
export { pairingMessageManager };
