import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./constants";
import {BakoSafeConnector} from "./BakoSafeConnector";


export interface ISocketAuth {
    username: string;
    data: Date;
    origin: string;
    sessionId: string;
}

export interface ICreateClientSocket {
    sessionId: string;
    events: BakoSafeConnector
}

const default_socket_auth: Omit<ISocketAuth, 'sessionId'> = {
    username: '[CONNECTOR]',
    data: new Date(),
    origin: window.origin ?? 'https://safe.bako.global',
}


export class SocketClient {
    server: Socket;
    events: BakoSafeConnector;
    request_id: string;

    constructor({sessionId, events}: ICreateClientSocket) {
        this.request_id = crypto.randomUUID()
        
        this.server = io(SOCKET_URL, {
            auth: {
                ...default_socket_auth,
                sessionId,  
                request_id: this.request_id
            },
            autoConnect: false,
            reconnection: false,
        });
        this.events = events;
        this.server?.on('message', (data) => {
            console.log('[MESSAGE]: ', {
                valid: data.to == default_socket_auth.username,
                auth: default_socket_auth.username,
                data
            })
            if(!data.request_id || data.request_id != this.request_id) return;
            //todo: emmit reject event

            if(data.to == default_socket_auth.username){
              this.events.emit(data.type, {
                from: data.username,
                data: data.data,
              });
            }
        });

        this.server.connect();
    }

    //emite an request to servidor
    request(
        to: string, 
        type: string, 
        data: {[key: string]: any} = {})
    {
        this.server.emit('message', {
            to,
            type,
            data
        });
   }

    get isConnected() {
        return this.server.connected;
    }
}