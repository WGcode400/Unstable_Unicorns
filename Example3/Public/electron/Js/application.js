//-----------------------------------------------------------------------------
// Uses: Start the application.
// Date: 2019-12-18
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/urlParameters",
  "units/webSocketConnection",
  "units/settings",
  "units/clientId",
  "units/webSocketRequests",
  "units/system",
  "units/accutechAPI",
        
  "debug/debug",
  
  //"screens/NavPicker",   
  
  //-------------------------

  // Vendor tools.
  "vendor/webSocketAPI",
  "vendor/w2ui",
  "vendor/jquery"
],
function
(
  urlParameters,
  webSocketConnection,
  Settings,
  ClientId, 
  WebSocketRequests,
  System,
  AccutechAPI,

  Debug,
 
  //NavPicker,

  WebSocketAPI,
  w2ui
  //JQuery =  $
)
{
  class Application
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Use WebSocket to setup the Accutech API, and then load configuration.
    // Input:
    //   webSocketAPI - Instance of `WebSocketAPI`.
    //-------------------------------------------------------------------------
    _websocketConnect( webSocketAPI )
    {
      this.webSocketAPI = webSocketAPI

      //if ( this.parameters.logwebsocket )
        this.webSocketAPI.setLogTransactionsCallback
        (
          function( data, isSending )
          {
            const direction = isSending ? "Sent" : "Received"
            const dataCopy = $.extend( true, {}, data )
            console.log( direction, dataCopy )
          }
        )

      // Hide the loading indication.
      $( "#loadingDiv" ).fadeOut( 1000 )



        //start the program       
        
        application.webSocketRequests = new WebSocketRequests(this.webSocketAPI)

        
        //console.log("app",application)

        
      //
      // $$$FUTURE - Setup here.
      //

      // // Complex items.
      // this.map       = new Map( this.system, this.panels.left )
      // this.mapAlarms = new MapAlarms( this.system, this.controls.map )

      //const debug = new Debug( this )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Function called should there be an error with the WebSocket connection.
    //-------------------------------------------------------------------------
    _websocketError()
    {
      // Close any open pop-up windows.
      w2popup.close()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Override settings from parameters.
    //-------------------------------------------------------------------------
    _setupParameters()
    {
      this.parameters = urlParameters()

      for ( const settingName of Object.keys( Settings ) )
        if ( settingName in this.parameters )
          Settings[ settingName ] = this.parameters[ settingName ]

      
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Setup the primary application.
    //-------------------------------------------------------------------------
    constructor()
    {
      this._setupParameters()

      // Establish WebSocket connection to server.
      webSocketConnection
      (
        $.proxy( this._websocketConnect, this ),
        $.proxy( this._websocketError, this )
      )
    }
  }

  // Create single instance of application.
    const application = new Application()

  return application
})
