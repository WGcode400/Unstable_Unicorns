//-----------------------------------------------------------------------------
// Uses: WebSocket interface.
// Date: 2019-05-18
// Author: Andrew Que (https://www.DrQue.net/)
// License: MIT license (https://opensource.org/licenses/MIT)
//
//                         (C) 2019-2021 by Andrew Que
//-----------------------------------------------------------------------------

"use strict"

define(
[
],
function
(
)
{
  // Timeout period (milliseconds) to allow server to respond to any request.
  // (This does not apply to asynchronous requests.)
  const RESPONSE_TIMEOUT = 5000

  // The very first request may take longer than subsequent requests due to
  // how the server initializes.
  const FIRST_RESPONSE_TIMEOUT = 15000

  return class WebSocketAPI
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Verify the callback function, if specified, is a function.
    // Input:
    //   callback - Function to run.
    // Throws:
    //   `Error` if the parameter isn't a function.
    //-------------------------------------------------------------------------
    _checkCallback( callback )
    {
      if ( ( callback )
        && ( typeof callback !== "function" ) )
      {
        console.error( "Incorrect callback function parameter", notificationData )
        throw Error( "Incorrect callback function parameter" )
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Send data over WebSocket.
    // Input:
    //   data - Object data to be sent.  Must be JSON convertible.
    // Note:
    //   This function mainly exists for debug printing of transactions.
    //-------------------------------------------------------------------------
    _send( data )
    {
      const jsonRequest = JSON.stringify( data )

      if ( this.logTransactionsCallback )
        this.logTransactionsCallback( data, true )

      this.webSocket.send( jsonRequest )
      this.isFirstRequest = false
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Handle requests from remote side.
    // Input:
    //   data - Full data request.
    //-------------------------------------------------------------------------
    _handleRequests( data )
    {
      // Group all requests together.
      var requests = {}
      if ( data.requests )
        requests = data.requests

      if ( data.request )
        requests[ "request" ] = data.request

      // Start with an empty response.
      const response = {}

      // If there is echo-back data, echo it back.
      if ( data.echoBack )
        response[ "echoBack" ] = data.echoBack

      // For all the requests...
      for ( const request of Object.values( requests ) )
      {
        const name = request.name
        const callback = this.requestHandlers[ name ]

        // Is this a valid request?
        if ( callback )
        {
          try
          {
            const responseData = callback( request.parameters )
            response[ data.request.requestId ] = responseData
          }
          catch ( error )
          {
            response[ data.request.requestId ] =
            {
              data : null,
              error : "Error: " + error.message
            }
          }
        }
        else
          response[ data.request.requestId ] = { data : null, error: "Unknown request " + name }
      }

      this._send( response )
    }

    //-------------------------------------------------------------------------
    // $$$FUTURE
    //-------------------------------------------------------------------------
    _handleNotificationRequests( data )
    {
      console.log( "Request for notification", data.notification.name )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Handle data coming from WebSocket.  This dispatches data to handler
    //   functions.
    // Input:
    //   event - Event from WebSocket.
    //-------------------------------------------------------------------------
    _dispatch( event )
    {
      const data = JSON.parse( event.data )

      if ( this.logTransactionsCallback )
        this.logTransactionsCallback( data, false )

      const echoBack = data.echoBack

      if ( ( data.request )
        || ( data.requests ) )
      {
        this._handleRequests( data )
      }
      else
      if ( ( data.notificationRequest )
        || ( data.notificationRequests ) )
      {
        this._handleNotificationRequests( data )
      }
      else
      if ( echoBack )
      {
        const callback = this.responseHandlers[ echoBack.requestId ]
        if ( callback )
        {
          delete data.echoBack
          callback( data )
        }
        else
        if ( this.onPacketError )
          this.onPacketError( "Unknown response received", data )

      }
      else
      {
        for ( const key of Object.keys( data ) )
          if ( key in this.responseHandlers )
          {
            const callback = this.responseHandlers[ key ]
            const results = data[ key ]
            callback( results )
          }
          else
            this.onPacketError( "Unknown data received", data )
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Make a unique id number.
    // Output:
    //   Unique number.
    //-------------------------------------------------------------------------
    _getUniqueId()
    {
      const id = this.requestId
      this.requestId += 1
      return id
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Set a callback function anytime a WebSocket packet and send or
    //   received.  Debugging function.
    // Input:
    //   callback( data, isSending ) - Callback to run.
    //     data - Data send or received.
    //     isSending - True if sending, false if receiving.
    //-------------------------------------------------------------------------
    setLogTransactionsCallback( callback )
    {
      this._checkCallback( callback )
      this.logTransactionsCallback = callback
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Ask to be notified of an event.
    // Input:
    //   name - Notification for which to sign up.
    //   notificationCallback( value ) - Function to run when notification
    //     event occurs.
    //       value - Value/event data when notification occurs.
    //   requestCallback( isError ) - Function to run after notification request
    //     has been made.
    //       isError - True if there was an error signing up for the
    //         notification.
    // Output:
    //   Id of notification that can be used to cancel notification events.
    //-------------------------------------------------------------------------
    requestNotification( name, notificationCallback, requestCallback = null )
    {
      const self = this

      this._checkCallback( notificationCallback )
      this._checkCallback( requestCallback )

      // Handler for notifications.
      const notificationId = this._getUniqueId()
      this.responseHandlers[ notificationId ] =
        function( data )
        {
          notificationCallback( data.notification.data )
        }

      // Handler for request to get notifications.
      const requestId = this._getUniqueId()

      // Notification request.
      const request =
      {
        "echoBack" : { "requestId" : requestId },
        "notificationRequest" :
        {
          "name" : name,
          // Each time a notification is issued, it will send the echo back
          // data.  Included is the notification id so the dispatcher can
          // call the appropriate handler.
          "echoBack" : { "requestId" : notificationId }
        }
      }

      // Notification request response handler.
      // This function receives true if there was an error setting up the
      // notification.
      this.responseHandlers[ requestId ] = function( data )
      {
        const isError = data.notificationResponse

        // If there was a failure remove the request handler as it will never
        // receive a notification.
        if ( isError )
          delete self.responseHandlers[ notificationId ]

        if ( requestCallback )
          requestCallback( isError )

        delete self.responseHandlers[ requestId ]
        clearTimeout( self.responseTimeouts[ requestId ] )
        delete self.responseTimeouts[ requestId ]
      }

      this.responseTimeouts[ requestId ] = this._makeTimeout( "Notification request `" + name + "`" )

      this._send( request )

      return notificationId
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Cancel all notifications previously requested.
    // Input:
    //   callback - Function to run after request has been made.
    //   errorCallback - Function to run if there is an error in request.
    //     Use `null` for default `this.onPacketError`.
    // Output:
    //   Id of notification that can be used to cancel notification events.
    //-------------------------------------------------------------------------
    cancelAllNotifications( callback = null, errorCallback = null )
    {
      const id = this._getUniqueId()
      const deferment = $.Deferred()

      if ( null === errorCallback )
        errorCallback = this.onPacketError

      // Wrap the callback function.
      // The temporary request removes handler after data has been received.
      // The inner callback returns just the response data.
      const self = this
      this.responseHandlers[ id ] = function( data )
      {
        var isError = ! ( "notificationCancelAllResponse" in data )

        if ( ! isError )
          isError = ! data.notificationCancelAllResponse.status

        if ( callback )
          callback( isError )

        delete self.responseHandlers[ id ]
        clearTimeout( self.responseTimeouts[ id ] )
        delete self.responseTimeouts[ id ]
      }

      this.responseTimeouts[ id ] = this._makeTimeout( id )

      // The request packet went to the server.
      const request =
      {
        // Echo back data is used to identify the handler for this data.
        "echoBack" : { "requestId" : id },
        "notificationCancelAllRequest" : {}
      }

      this._send( request )

      return deferment
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Wrapper function that adds a listener for a response that is removed
    //   after response is received.
    // Input:
    //   id - Id of response to handle.
    //   callback - Function to run when response is received.
    //-------------------------------------------------------------------------
    _requestHandlers( id, callback )
    {
      const self = this

      return function( data )
      {
        if ( callback )
          callback( data )

        delete self.responseHandlers[ id ]
        clearTimeout( self.responseTimeouts[ id ] )
        delete self.responseTimeouts[ id ]
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Wrapper to check a data/error value pair set.
    // Input:
    //   id - Id of response to handle.
    //   callback - Function to run when response is received.
    //   deferment - Instance of jQuery `Deferred`.
    //   errorCallback - Function to run if there is an error in request.
    //     Use `null` for default `this.onPacketError`.
    // Output:
    //   Handler function.
    //-------------------------------------------------------------------------
    _checkedRequestHandlers( id, callback, deferment, errorCallback = null )
    {
      if ( null === errorCallback )
        errorCallback = this.onPacketError

      const self = this

      return this._requestHandlers
      (
        id,
        function( results )
        {
          var isError = false
          var errorString = ""

          // Validate all data loop...
          const data = {}
          for ( const [ key, value ] of Object.entries( results ) )
          {
            // Verify there are no errors with this value.
            isError |= ( null !== value.error )

            // Add error string if there is a problem.
            if ( null !== value.error )
              errorString += key + ": " + value.error + "\n"

            data[ key ] = value.data
          }

          // Run data callback if there are no problems.
          if ( ! isError )
          {
            if ( callback )
              callback( data )
          }
          else
          {
            // Run error callback.
            if ( errorCallback )
              errorCallback( errorString, results )
          }
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Wrapper function that adds temporary listener but returns only
    //   selected data.
    // Input:
    //   selectedData - Object element to return.
    //   id - Id of response to handle.
    //   callback - Function to run when response is received.
    //   deferment - Instance of jQuery `Deferred`.
    //   errorCallback - Function to run if there is an error in request.
    //     Use `null` for default `this.onPacketError`.
    // Output:
    //   Handler function.
    //-------------------------------------------------------------------------
    _selectRequestHandler( selectedData, id, callback, deferment, errorCallback )
    {
      return this._checkedRequestHandlers
      (
        id,
        function( data )
        {
          if ( deferment )
            deferment.resolve( data[ selectedData ] )

          if ( callback )
            callback( data[ selectedData ] )
        },
        deferment,
        errorCallback
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Start a timer for missing response.
    // Input:
    //   action - Description of the action that being timed.
    // Output:
    //   Timer used for timeout.  This should be canceled on receiving
    //   message response.
    //-------------------------------------------------------------------------
    _makeTimeout( action )
    {
      const self = this

      var timeout = RESPONSE_TIMEOUT
      if ( this.isFirstRequest )
        timeout = FIRST_RESPONSE_TIMEOUT

      const timer = setTimeout
      (
        function()
        {
          self.onPacketError( "Response timeout: " + action )
        },
        timeout
      )

      return timer
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Send a request to the server.
    // Input:
    //   name - What request is being issued.
    //   parameters - Additional parameters for request.
    //   callback( data ) - Function to run once data has been received.
    //     data - Data returned from request.
    //   errorCallback - Function to run if there is an error in request.
    //     Use `null` for default `this.onPacketError`.
    // Output:
    //   jQuery `Deferred` object resolved when request is complete.
    //-------------------------------------------------------------------------
    makeRequest( name, parameters = [], callback = null, errorCallback = null )
    {
      const id = this._getUniqueId()
      const deferment = $.Deferred()

      this._checkCallback( callback )
      this._checkCallback( errorCallback )

      // Wrap the callback function.
      // The temporary request removes handler after data has been received.
      // The inner callback returns just the response data.
      this.responseHandlers[ id ] =
        this._selectRequestHandler( "response", id, callback, deferment, errorCallback )

      this.responseTimeouts[ id ] = this._makeTimeout( "Request `" + name + "`" )

      // The request packet went to the server.
      const request =
      {
        // Echo back data is used to identify the handler for this data.
        "echoBack" : { "requestId" : id },
        "request" :
        {
          "name" : name,
          "parameters" : parameters
        }
      }

      this._send( request )

      return deferment
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Send multiple requests to the server.
    // Input:
    //   requestData - Object list with format:
    //     {
    //       <id1>: { name: <name1>, parameters : <parameters1> }
    //       <id2>: { name: <name2>, parameters : <parameters2> }
    //       ...
    //       <idN>: { name: <nameN>, parameters : <parametersN> }
    //     }
    //   callback( data ) - Function to run once data has been received.
    //     data - Data dictionary returned from request.  Format:
    //       {
    //         <id1>: <data1>
    //         <id2>: <data2>
    //         ...
    //         <idN>: <dataN>
    //       }
    // Output:
    //   jQuery `Deferred` object resolved when requests are complete.
    //-------------------------------------------------------------------------
    makeRequests( requestsData, callback = null )
    {
      const id = this._getUniqueId()
      const deferment = $.Deferred()

      this._checkCallback( callback )

      // Wrap the callback function.
      // The request handler must be removed after the request has completed.
      this.responseHandlers[ id ] = this._checkedRequestHandlers( id, callback, deferment )

      this.responseTimeouts[ id ] = this._makeTimeout( "Requests id: " + id )

      // The request packet went to the server.
      const requests =
      {
        // Echo back data is used to identify the handler for this data.
        "echoBack" : { "requestId" : id },
        "requests" : requestsData
      }

      this._send( requests )

      return deferment
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Send an asynchronous request to the server.
    // Input:
    //   name - What request is being issued.
    //   parameters - Additional parameters for request.
    //   finishedCallback( data ) - Callback when asynchronous request has
    //     completed.
    //     data - Requested data.
    //   requestCallback( isError ) - Callback when request has completed.
    //     isError - True if there was an error.
    //   errorCallback - Function to run if there is an error in request.
    //     Use `null` for default `this.onPacketError`.
    // Output:
    //   jQuery `Deferred` object resolved when asynchronous portion of request
    //   is complete.
    //-------------------------------------------------------------------------
    makeAsynchronousRequest
    (
      name,
      parameters = [],
      finishedCallback = null,
      requestCallback = null,
      errorCallback = null
    )
    {
      const deferment = $.Deferred()

      this._checkCallback( finishedCallback )
      this._checkCallback( requestCallback )
      this._checkCallback( errorCallback )

      // A notification is sent when the asynchronous process completes.
      // We pick a name for this notification and must register a callback to
      // run when the notification is received.
      const notificationName = this._getUniqueId()
      const self = this
      this.responseHandlers[ notificationName ] =
        function( notificationData )
        {
          const notification = notificationData.notification
          if ( ! notification.data.error )
          {
            deferment.resolve( notification.data.data )
            if ( finishedCallback )
              finishedCallback( notification.data.data )
          }
          else
          {
            if ( errorCallback )
              errorCallback( notification.data.error )
          }

          delete self.responseHandlers[ notificationName ]
        }

      // Wrap the callback function.
      // The request handler must be removed after the request has completed.
      const requestId = this._getUniqueId()
      this.responseHandlers[ requestId ] =
        this._requestHandlers
        (
          requestId,
          function( data )
          {
            deferment.resolve( data )
            if ( requestCallback )
              requestCallback( data[ "asynchronousResponse" ] )
          }
        )

      this.responseTimeouts[ requestId ] = this._makeTimeout( "AsynchronousRequest `" + name + "`" )

      // The request packet went to the server.
      const request =
      {
        // Echo back data is used to identify the handler for this data.
        "echoBack" : { "requestId" : requestId },
        "asynchronousRequest" :
        {
          "name"             : name,
          "notificationName" : notificationName,
          "echoBack"         : { "requestId" : notificationName },
          "parameters"       : parameters
        }
      }

      this._send( request )

      return deferment
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Set session data for this connection.
    // Input:
    //   values - Object with key/values to set.
    //   callback( isError ) - Function to run once data has been received.
    //     isError - True if there was an error setting the value.
    //   errorCallback - Function to run if there is an error in request.
    //     Use `null` for default `this.onPacketError`.
    // Output:
    //   jQuery `Deferred` object resolved when request is complete.
    //-------------------------------------------------------------------------
    sessionSetRequest( values, callback = null, errorCallback = null )
    {
      const id = this._getUniqueId()
      const deferment = $.Deferred()

      this._checkCallback( callback )
      this._checkCallback( errorCallback )

      // Wrap the callback function.
      // The temporary request removes handler after data has been received.
      // The inner callback returns just the response data.
      this.responseHandlers[ id ] =
        this._selectRequestHandler( id, id, callback, deferment, errorCallback )

      this.responseTimeouts[ id ] = this._makeTimeout( "Request `" + name + "`" )

      // The request packet went to the server.
      const request =
      {
        // Echo back data is used to identify the handler for this data.
        "echoBack" : { "requestId" : id },
        "sessionSetRequest" :
        {
          "values" : values,
          "responseId" : id,
        }
      }

      this._send( request )

      return deferment
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Make a request to another client.
    // Input:
    //   clientId - Which client to address.
    //   query - Full query to run.
    //   callback( data ) - Function to run once data has been received.
    //     data - Data returned from request.
    //   errorCallback - Function to run if there is an error in request.
    //     Use `null` for default `this.onPacketError`.
    // Output:
    //   jQuery `Deferred` object resolved when request is complete.
    //-------------------------------------------------------------------------
    makeClientRequests
    (
      clientId,
      query = "",
      finishedCallback = null,
      requestCallback = null,
      errorCallback = null
    )
    {
      const deferment = $.Deferred()

      this._checkCallback( finishedCallback )
      this._checkCallback( requestCallback )
      this._checkCallback( errorCallback )

      // A notification is sent when the asynchronous process completes.
      // We pick a name for this notification and must register a callback to
      // run when the notification is received.
      const responseId = this._getUniqueId()
      const self = this
      this.responseHandlers[ responseId ] =
        function( clientData )
        {
          if ( ! clientData.error )
          {
            deferment.resolve( clientData.data )
            if ( finishedCallback )
              finishedCallback( clientData.data )
          }
          else
          {
            if ( errorCallback )
              errorCallback( clientData.error )
          }

          delete self.responseHandlers[ responseId ]
        }

      // Wrap the callback function.
      // The request handler must be removed after the request has completed.
      const requestId = this._getUniqueId()
      this.responseHandlers[ requestId ] = this._requestHandlers( requestId, requestCallback )

      // The request packet went to the server.
      const request =
      {
        "clientQuery" :
        {
          "clientId"   : clientId,
          "requestId"  : requestId,
          "responseId" : responseId,
          "query"      : query
        }
      }

      this._send( request )

      return deferment
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Close WebSocket connection.
    //-------------------------------------------------------------------------
    close()
    {
      // Clear all pending timeouts.
      for ( const timer of Object.values( this.responseTimeouts ) )
        clearTimeout( timer )

      this.webSocket.close()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Register a new request handler.
    // Input:
    //   id - The request id.
    //   handlerCallback( data ) - Handler.
    //     data - Parameters to request.
    //-------------------------------------------------------------------------
    registerRequest( id, handlerCallback )
    {
      this.requestHandlers[ id ] = handlerCallback
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove a request handler.
    // Input:
    //   id - The request id previously registered `registerRequest`.
    //-------------------------------------------------------------------------
    unregisterRequest( id )
    {
      delete this.requestHandlers[ id ]
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Signal a notification.
    // Input:
    //   id - Notification id to signal.
    //   data - Data sent with the signal.
    //-------------------------------------------------------------------------
    sendNotification( id, data )
    {
      const notification =
      {
        [id] : { data: data }
      }

      this._send( notification )
    }
    //-------------------------------------------------------------------------
    // Uses:
    //   Signal a notification.
    // Input:
    //   id - Notification id to signal.
    //   data - Data sent with the signal.
    //-------------------------------------------------------------------------
      sendFirstMessage()
      {
        const message =
        {
            ["ready"]: true 
        }

        this._send(message)
    }
    //-------------------------------------------------------------------------
    // Input:
    //   address - WebSocket server for which to connect.
    //   port - Port on server.
    //   onOpenCallback - Callback to run once connection is established.
    //   onErrorCallback - Callback should there be an error.
    //   onCloseCallback - Callback if connection is closed.
    //   onPacketErrorCallback - Callback for any packet errors.
    //-------------------------------------------------------------------------
    constructor
    (
      address,
      port,
      path,
      onOpenCallback = null,
      onErrorCallback = null,
      onCloseCallback = null,
      onPacketErrorCallback = null
    )
    {
      this.requestHandlers  = {}
      this.responseHandlers = {}
      this.responseTimeouts = {}
      this.requestId = 0
      this.isFirstRequest = true
      this.logTransactionsCallback = null

      this._checkCallback( onOpenCallback )
      this._checkCallback( onErrorCallback )
      this._checkCallback( onCloseCallback )
      this._checkCallback( onPacketErrorCallback )

      this.webSocket = new WebSocket( "ws://" + address + ":" + port + path )
      this.webSocket.onopen    = onOpenCallback
      this.webSocket.onmessage = ( event ) => this._dispatch( event )
      this.webSocket.onerror   = onErrorCallback
      this.webSocket.onclose   = onCloseCallback
      this.onPacketError = onPacketErrorCallback
    }
  } // class

})
