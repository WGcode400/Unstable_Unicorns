"use strict"
import { MessageHandler } from "./MessageHandler.js"
import { UUID4 } from "./../UUID4.js"
export { Websocket };


class Websocket {
    //-------------------------------------------------------------------------
    // Input:
    //   address - WebSocket server for which to connect. 
    //   port - Port on server.
    //   onOpenCallback - Callback to run once connection is established.
    //   onErrorCallback - Callback should there be an error.
    //   onCloseCallback - Callback if connection is closed.
    //   onPacketErrorCallback - Callback for any packet errors.
    //-------------------------------------------------------------------------
    constructor() {
        this.webSocket = new WebSocket("ws://localhost:9001/client")
        this.webSocket.onopen = () => this._connect()
        this.webSocket.onmessage = (event) => this._dispatch(event)
        this.webSocket.onerror = (event) => this._error(event)
        this.webSocket.onclose = () => this._disconnect()
        
        this.msgHandler = new MessageHandler()
    }
    //-------------------------------------------------------------------------
    // Uses:
    //   Send data over WebSocket.
    // Input:
    //   data - Object data to be sent.  Must be JSON convertible.
    // Note:
    //   This function mainly exists for debug printing of transactions.
    //-------------------------------------------------------------------------
    _send(msg) {
        this.webSocket.send(msg)
        //$('#output').append(msg)
    }
    //-------------------------------------------------------------------------
    // Uses:
    //   Handle data coming from WebSocket.  This dispatches data to handler
    //   functions.
    // Input:
    //   event - Event from WebSocket.
    //-------------------------------------------------------------------------
    _dispatch(event)
    {
        const data = JSON.parse(event.data);       
        console.log(data);

        $('#loadingDiv').css("background", "rgba(255,0,0,.1)"); //change backgroundcolor or 
        $("#loadingDiv").fadeOut(1000) //can use fadeOut to hide element from screen
                     

        //const eventData = event.data.replace('\"', '"')
        //const data = JSON.parse(eventData)

        //packet types
        
        if (data.Key === "areas") {
            //each is its own message / handles the same and its own way
            this.msgHandler.handleAreas(data.Value)
        }
        else if (data.Key === "controllers") {
            this.msgHandler.handleControllers(data.Value)
        }
        else if (data.Key === "receivers") {
            this.msgHandler.handleReceiverViews(data.Value)
        }
        else if (data.Key === "monikers") {
            this.msgHandler.handleMonikers(data.Value)
        }
        else if (data.Key === "icons") {
            this.msgHandler.handleIcons(data.Value)
        }
        else if (data.Key === "maps") {
            this.msgHandler.handleMaps(data.Value)
        }
        else if (data.Key === "views") {
            this.msgHandler.handleViews(data.Value)
        }
        //else if (data.Key === "newMessage") {
        //    this.msgHandler.handleFuturePacketType(data.Value)
        //}
        
    }    
    //-------------------------------------------------------------------------
    // Uses:
    //   Opens WebSocket connection.
    //-------------------------------------------------------------------------
    _connect() {
        const area = {}
        const uuid4 = new UUID4()
        area.name = "js area"
        area.id = uuid4.newID()
        this._send(JSON.stringify(area))
    }
    //-------------------------------------------------------------------------
    // Uses:
    //   Handles errors on WebSocket connection.
    //-------------------------------------------------------------------------
    _error() {
        console.log('error')
    }
    //-------------------------------------------------------------------------
    // Uses:
    //   Closes WebSocket connection.
    //-------------------------------------------------------------------------
    _disconnect() {
        console.log('disconnected')
    }
}


