//-----------------------------------------------------------------------------
// Uses: Handle establishment of WebSocket connection and handle disconnects.
// Date: 2019-12-19
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "units/settings",

  // Vendor tools.
  "vendor/webSocketAPI",
  "vendor/jquery"
],
function
(
  Settings,
  WebSocketAPI,
  svgPanZoom
)
{
  //---------------------------------------------------------------------------
  // Uses:
  //   Establish a WebSocket connection to the server.
  // Input:
  //   connectCallback( webSocketAPI ) - Callback to run after connection is made.
  //     webSocketAPI - Instance of the newly established connection.
  //   disconnectCallback - Callback should WebSocket become disconnected.
  //---------------------------------------------------------------------------
  return function( connectCallback, disconnectCallback )
  {
    var webSocketAPI

    // True if a functional connection has been established.
    // This is so error function is only run once when a failure occurs, and
    // doesn't keep running if a new connection isn't established.
    var isConnected = false

    //-------------------------------------------------------------------------
    // Uses:
    //   Connection error.  Call when connection is lost.
    //-------------------------------------------------------------------------
    function error()
    {
      if ( isConnected )
      {
        isConnected = false

        // Display error message.
        $( "#serverError" ).css( "display", "flex" )

        // Run disconnect callback.
        if ( disconnectCallback )
          disconnectCallback()
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Establish connection to WebSocket interface.
    //   This will automatically try to reconnect if connection drops.
    //-------------------------------------------------------------------------
    function connect()
    {
      // Establish WebSocket connection to server.
      webSocketAPI = new WebSocketAPI
      (
        Settings.WebSocketURL,
        Settings.WebSocketPort,
        Settings.WebSocketPath,
        function()
        {
          isConnected = true

          $( "#serverError" ).css( "display", "none" )

          // Run connect callback with new instance of connection.
          if ( connectCallback )
            connectCallback( webSocketAPI )
        },
        error,
        function()
        {
          // Run error function.
          error()

          // Attempt to connect again.
          setTimeout( connect, Settings.WebSocketReconnectTime )
        },
        function( error )
        {
          // Error function will raise an exception for a full run-time error.
          //console.error( "Error", error )
          throw new Error( "Communication error: " + error )
        }
      )
    }

    // Start trying to establish connection.
    connect()
  }
})
