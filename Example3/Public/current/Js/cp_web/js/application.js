//-----------------------------------------------------------------------------
// Uses: Start the application.
// Date: 2019-12-18
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/urlParameters",
  "units/webSocketConnection",
  "units/accutechAPI",
  "units/system",
  "units/settings",

  "areas/eventsList",
  "areas/view",
  "areas/map",
  "areas/mapAlarms",
  "areas/menu",
  "areas/leftPanel",
  "areas/mapPanel",
  "areas/rightPanel",
  "areas/tagList",

  "debug/debug",

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
  AccutechAPI,
  System,
  Settings,
  EventsList,
  View,
  Map,
  MapAlarms,
  Menu,
  LeftPanel,
  MapPanel,
  RightPanel,
  TagList,
  Debug,
  WebSocketAPI,
  w2ui
)
{
  class Application
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Add callback to run after application has initialized.
    // Notes:
    //   This is a debug function for extending the primary application.
    //-------------------------------------------------------------------------
    whenReady( callback )
    {
      this.callbacks.push( callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Reload all configuration data.
    //   This is called if something major changes, like topology.
    //-------------------------------------------------------------------------
    reloadConfiguration()
    {
      this.webSocketAPI.cancelAllNotifications( $.proxy( this._loadConfiguration, this ) )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Setup all user interface objects.  Call after configuration is loaded.
    //-------------------------------------------------------------------------
    _setupUserInterface()
    {
      this.panels = {}

      // Items that need only the loaded configuration.
      this.panels.left  = new LeftPanel()
      this.panels.map   = new MapPanel( this.system )
      this.panels.right = new RightPanel()

      this.controls = {}

      // Complex items.
      this.controls.map       = new Map( this.system, this.panels.left )
      this.controls.mapAlarms = new MapAlarms( this.system, this.controls.map )
      this.controls.tagList   = new TagList( this.system, this.controls.map )

      this.controls.eventsList  =
        new EventsList
        (
          this.system,
          this.controls.mapAlarms,
          this.panels.left,
          this.controls.tagList
        )

      this.controls.view = new View( this.system, this.controls.map )

      this.menu = new Menu
      (
        this.accutechAPI,
        this.system,
        this.controls.map,
        this.controls.view
      )

      this.debug = new Debug( this )

      //
      // Start user interface.
      //

      // Hide the loading indication.
      $( "#loadingDiv" ).fadeOut( 1000 )

      // Run additional callbacks.
      for ( const callback of this.callbacks )
        callback( this )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Load configuration and system state.
    //-------------------------------------------------------------------------
    _loadConfiguration()
    {
      // Load current configuration.
      this.system = new System
      (
        this.accutechAPI,
        this.parameters.clientId,
        $.proxy( this._setupUserInterface, this )
      )

      // Register reload function.
      this.system.setReload( $.proxy( this.reloadConfiguration, this ) )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Use WebSocket to setup the Accutech API, and then load configuration.
    // Input:
    //   webSocketAPI - Instance of `WebSocketAPI`.
    //-------------------------------------------------------------------------
    _websocketConnect( webSocketAPI )
    {
      this.webSocketAPI = webSocketAPI

      if ( this.parameters.logwebsocket )
        this.webSocketAPI.setLogTransactionsCallback
        (
          function( data, isSending )
          {
            const direction = isSending ? "Sent" : "Received"
            const dataCopy = $.extend( true, {}, data )
            console.log( direction, dataCopy )
          }
        )

      // Use WebSocket connect to establish Accutech API.
      this.accutechAPI = new AccutechAPI( this.webSocketAPI )

      this._loadConfiguration()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Function called should there be an error with the WebSocket connection.
    //-------------------------------------------------------------------------
    _websocketError()
    {
      // Close any open pop-up windows.
      w2popup.close()

      // Run error function.
      this.accutechAPI.error()
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
      this.callbacks = []

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
