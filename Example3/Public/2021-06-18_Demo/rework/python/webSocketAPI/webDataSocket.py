#------------------------------------------------------------------------------
# Uses: Web data socket to bridge WebDataClass to WebSocket.
# Date: 2019-05-20
# Author: Andrew Que (https://www.DrQue.net/)
# License: MIT license (https://opensource.org/licenses/MIT)
#
# This is the heart of how data is transferred between a web-based client and
# the running program.  The client makes requests that are sent in JSON.  These
# requests are executed and their data is packaged into a JSON response sent
# back to the client.
#
# WebDataSocket protocol
# ----------------------
#   All data is transferred using JSON string.  The client will always issue
# "request" message, and the server will always respond with "response"
# messages.  The server may also issue "notification" message if the client has
# requested them.  These are asynchronous.
#
# Requests
# ========
# {
#   echoBack : { ... }
#   request : { name, parameters }
#   requests : {
#     id_1 : { name_1, parameters_1 },
#     id_2 : { name_2, parameters_2 },
#     ...
#     id_n : { name_n, parameters_n },
#   }
#   requestNotification : {
#     name, echoBack
#   }
#   requestNotifications : {
#     id_1 : { name_1, echoBack_1 },
#     id_2 : { name_2, echoBack_2 },
#     ...
#     id_n : { name_n, echoBack_n },
#   }
# }
# Where:
#   echoBack - JSON data that is sent back with the reply.  Used by client to
#     track response.  Contents ignored by server.
#   request - A single request.
#     name - Name of WebData function.
#     parameters - Parameters passed to WebData function.
#   requests - Multiple requests.
#     id_* - Unique identifier for request.  Used to associate response data
#       to request because the request function names could be repeated.
#     name_* - Name of WebData function.
#     parameters_* - Parameters passed to WebData function.
#   requestNotification - Sign up to be notified when named notification is
#       signaled.
#     name - Name of notification for which to sign up.
#     echoBack - Additional data sent when notification is signaled.
#   requestNotification - Sign up for multiple notifications.
#     id_* - Unique identifier for request.
#     name_* - Notification for which to sign up.
#     echoBack_* - Additional data sent when notification is signaled.
#
# Requests can have one or multiple fields.  The `echoBack` field is optional.
# Most request will have just one of either `request`, `requests`,
# `requestNotification` or `requestNotifications`.
#
# Responses
# =========
# $$$FUTURE
#
# Normal requests make sense as-is.
# Notification requests could be modified.
# Notification pushes need to be thought through.
#
#                          (C) 2019 by Andrew Que
#------------------------------------------------------------------------------

import uuid
import json
import time
from webSocketAPI.SimpleWebSocketServer import WebSocket
from webSocketAPI.listenerConnection import ListenerConnection
from webSocketAPI.webDataClass import WebDataClass
from webSocketAPI.clientData import ClientData
from webSocketAPI.notification import Notification
from webSocketAPI.listener import Listener

DEBUG__DISPLAY_CONNECT = True
DEBUG__DISPLAY_JSON    = False

class _WebDataSocketBase( WebSocket ) :
  """
  A base class that handles a WebSocket.

  Most of the work in done in the message handler that takes requests from the
  client, performs the requests, and packages the data to be sent in return.
  """

  _responseHandlers = {}

  #----------------------------------------------------------------------------
  def handleEchoBack( self, data, results ) :
    results[ "echoBack" ] = data

  #----------------------------------------------------------------------------
  def handleRequests( self, requests, results ) :

    # Loop to handle each request.
    for id, request in requests.items() :
      parameters = []
      if "parameters" in request :
        parameters = request[ "parameters" ]

      results[ id ] = self._webDataClass.call( request[ "name" ], parameters )

  #----------------------------------------------------------------------------
  def handleRequest( self, request, results ) :

    id = "response"
    if "requestId" in request :
      id = request[ "requestId" ]

    requests = { id : request }
    self.handleRequests( requests, results )

  #----------------------------------------------------------------------------
  def handleAsynchronousRequests( self, requests, results ) :
    # Loop to handle each request.
    for id, request in requests.items() :
      parameters = []
      if "parameters" in request :
        parameters = request[ "parameters" ]

      echoBack = []
      if "echoBack" in request :
        echoBack = request[ "echoBack" ]

      if "name" in request and "notificationName" in request :
        results[ id ] = self._webDataClass.asynchronousCall(
          request[ "name" ],
          parameters,
          request[ "notificationName" ]
        )

        listenerConnection = self._clientData.get( self._id, "_listener" )
        listenerConnection.listen( request[ "notificationName" ], echoBack )
      else :
        # Malformed request.
        results[ id ] = False

  #----------------------------------------------------------------------------
  def handleAsynchronousRequest( self, request, results ) :
    requests = { "asynchronousResponse" : request }
    self.handleAsynchronousRequests( requests, results )

  #----------------------------------------------------------------------------
  def handleNotificationRequests( self, requests, results ) :
    # Loop to handle each notification request.
    for id, request in requests.items() :
      echoBack = []
      if "echoBack" in request :
        echoBack = request[ "echoBack" ]

      if "name" in request :
        listenerConnection = self._clientData.get( self._id, "_listener" )
        results[ id ] = listenerConnection.listen( request[ "name" ], echoBack )
      else :
        # Malformed request.
        results[ id ] = False

  #----------------------------------------------------------------------------
  def handleNotificationRequest( self, request, results ) :
    requests = { "notificationResponse" : request }
    self.handleNotificationRequests( requests, results )

  #----------------------------------------------------------------------------
  def handleNotificationCancelAllRequest( self, request, results ) :

    print( "NotificationCancelAllRequest" )

    # Drop current listening connections.
    del self.listenerConnection

    # Reinitialize listening connections.
    self.listenerConnection = ListenerConnection( self )

    if "notificationCancelAllRequestId" in request :
      notificationCancelAllRequestId = request[ "notificationCancelAllResponse" ]
    else :
      notificationCancelAllRequestId = "notificationCancelAllResponse"

    results[ notificationCancelAllRequestId ] = { "status" : True }

  #--------------------------------------------------------------------------
  def handleSessionSetRequest( self, request, results ) :

    values = request[ "values" ]
    for key, value in values.items() :
      self._clientData.set( self._id, key, value )

    id = "sessionSetResponse"
    if "responseId" in request :
      id = request[ "responseId" ]

    results[ id ] = {
      "data" : self._clientData.getAll( self._id ),
      "error" : None
    }

  #--------------------------------------------------------------------------
  def handleSessionGetRequest( self, request, results ) :
    results = self._clientData.getAll()

  #--------------------------------------------------------------------------
  def handleClientQuery( self, request, results ) :
    """
    Handle a request to another connected client.

    This is a two-part process.  The first part checks to see that the requested
    client is connected, forwards the request to it, and replies with the
    status of that attempt.  If the first part is successful, the second part
    sets up a temporary response handler for the data returned by the other
    client.  This handler will send a second message to the requesting client
    with the data returned by the other client.
    """
    localId    = str( uuid.uuid4() )
    responseId = request[ "responseId" ]
    requestId  = request[ "requestId" ]

    connection = None
    clientId   = request[ "clientId" ]
    connection = self._clientData.get( clientId, "_connection" )

    # Make sure this client exists, and a query has been specified.
    if connection is not None and "query" in request :

      # Callback to run when data from other client has been received.
      def _callback( data, webDataSocket ) :

        # Place returned data into an object keyed with response id.
        clientResponse = { responseId : data }

        # Send response back to client.
        jsonString = json.dumps( clientResponse, default=_WebDataSocketBase._toDictionary )
        # $$$ print( "Sending back", jsonString )
        webDataSocket.sendMessage( jsonString )

      # Setup handler for response from other client.
      self.addResponseHandler( localId, _callback, self )

      # Send message to selected client.
      query = request[ "query" ]

      # $$$ print( "Pre-request", query )
      for item in query.keys() :
        query[ item ][ "requestId" ] = localId

      jsonString = json.dumps( query, default=_WebDataSocketBase._toDictionary )
      # $$$ print( "Client request", jsonString )
      connection.sendMessage( jsonString )

      # Successful attempt.
      results[ requestId ] = True
    else:
      # Failed attempt.
      results[ requestId ] = False

  #--------------------------------------------------------------------------
  def _toDictionary( data ) :
    toDictionaryFunction = getattr( data, "toDictionary", None )
    if callable( toDictionaryFunction ):
      result = data.toDictionary()
    else :
      result = str( data )

    return result

  #----------------------------------------------------------------------------
  def handleMessage( self ) :
    """
    Handle a message from the client.

    The client always issues requests.
    """

    if DEBUG__DISPLAY_JSON :
      print( "<", self.data )

    data = json.loads( self.data )

    HANDLER_TABLE = {
      "echoBack"                      : self.handleEchoBack,
      "request"                       : self.handleRequest,
      "requests"                      : self.handleRequests,
      "asynchronousRequest"           : self.handleAsynchronousRequest,
      "asynchronousRequests"          : self.handleAsynchronousRequests,
      "notificationRequest"           : self.handleNotificationRequest,
      "notificationRequests"          : self.handleNotificationRequests,
      "notificationCancelAllRequest"  : self.handleNotificationCancelAllRequest,
      "sessionSetRequest"             : self.handleSessionSetRequest,
      "clientQuery"                   : self.handleClientQuery,
    }

    results = {}

    # For all the operations in the packet...
    for operation, data in data.items() :
      if operation in HANDLER_TABLE :
        HANDLER_TABLE[ operation ]( data, results )
      elif operation in _WebDataSocketBase._responseHandlers :
        responseHandlers = _WebDataSocketBase._responseHandlers[ operation ]
        if "callback" in responseHandlers and "parameters" in responseHandlers :
          callback  = responseHandlers[ "callback" ]
          parameter = responseHandlers[ "parameters" ]
          callback( data, parameter )
          results = None
        else :
          print( "No response handler", operation )
      else:
        print( "Unknown", operation, _WebDataSocketBase._responseHandlers )
        results = None

    if results is not None :
      jsonString = json.dumps( results, default=_WebDataSocketBase._toDictionary )

      if DEBUG__DISPLAY_JSON :
        print( ">", jsonString )

      self.sendMessage( jsonString )

  #----------------------------------------------------------------------------
  def addResponseHandler( self, id, callback, callbackParameters ) :
    """
    Add a response handler function.

    Parameters
    ----------
    id - str
      Unique id for handler.
    callback( responseData ) - func
      Function to run when response is received.
    """
    id = str( id )
    _WebDataSocketBase._responseHandlers[ id ] = {
      "callback"   : callback,
      "parameters" : callbackParameters
    }

  #----------------------------------------------------------------------------
  def removeResponseHandler( self, id ) :
    """
    Remove a response handler function.

    Parameters
    ----------
    id - str
      Unique id for handler previously registered with `addResponseHandler`
    """
    id = str( id )
    del _WebDataSocketBase._responseHandlers[ id ]

  #----------------------------------------------------------------------------
  def dateTimeString(self):
        """Return the current time formatted for logging."""
        """Copied from: https://github.com/enthought/Python-2.7.3/blob/master/Lib/BaseHTTPServer.py"""

        monthname = [None,
                 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        now = time.time()
        year, month, day, hh, mm, ss, x, y, z = time.localtime(now)
        s = "%02d/%3s/%04d %02d:%02d:%02d" % (
                day, monthname[month], year, hh, mm, ss)

        return s

  #----------------------------------------------------------------------------
  def handleConnected( self ):
    """
    New connection handler.
    """

    if DEBUG__DISPLAY_CONNECT :
      ipAddress = self.address[ 0 ].replace( "::ffff:", "" )
      timestamp = self.dateTimeString()

      print( ipAddress, "- - [" + timestamp + "] WebSocket connection established." )

    self._id = str( uuid.uuid4() )

    listenerConnection = ListenerConnection( self )
    record = {
      "_listener"     : listenerConnection,
      "_webDataClass" : self._webDataClass,
      "_connection"   : self
    }

    self._clientData.register( self._id, record )

  #----------------------------------------------------------------------------
  def handleClose( self ):
    """
    End of connection.
    """

    if DEBUG__DISPLAY_CONNECT :
      ipAddress = self.address[ 0 ].replace( "::ffff:", "" )
      timestamp = self.dateTimeString()

      print( ipAddress, "- - [" + timestamp + "] WebSocket connection closed." )

    # Remove listeners.
    listenerConnection = self._clientData.get( self._id, "_listener" )
    del listenerConnection

    self._clientData.unregister( self._id )

  #----------------------------------------------------------------------------
  def __init__( self, *args, **kwargs ) :
    WebSocket.__init__( self, *args, **kwargs )
    # $$$ self._responseHandlers = {}

class WebDataSocket :
  """
  Bridge between WebDataClass and WebSocket that allows shared WebDataClass
  functions through a WebSocket.

  Example:

    # Setup shared web data.
    webDataClass = WebDataClass()
    webDataClass.add( ... )
    webDataClass.add( ... )
    webDataClass.add( ... )
    ...

    # Make an instance of `WebDataSocket` to tie into an instance of
    # `WebDataClass`.
    webDataSocket = WebDataSocket( webDataClass )

    # Get the class as parameter to `WebSocketServer`.
    webDataSocketClass = webDataSocket.get()

    # Setup `WebSocket` server.
    server = ThreadedWebSocketServer( ..., webDataSocket )

  This class exists in two parts because an intermediate is needed in order to
  pass parameters to the instance of the handler.

  Parameters
  ----------
    webDataClass : WebDataClass
      Instance of `WebDataClass` that is used to share data using the WebSocket.
    clientData : ClientData
      Instance of `ClientData` that for holding additional client/session data.
  """
  def __init__( self, webDataClass : WebDataClass, clientData : ClientData ) :
    self._webDataClass = webDataClass
    self._clientData = clientData

  #----------------------------------------------------------------------------
  def _makeWebDataHandlerClass( self, webDataClass : WebDataClass, clientData : ClientData ) :
    """
    Wrapper class so additional parameter can be setup in WebDataSocket.
    """
    class CustomHandler( _WebDataSocketBase ) :
      def __init__( self, *args, **kwargs ) :
        super( CustomHandler, self ).__init__( *args, **kwargs )
        self._webDataClass = webDataClass
        self._clientData = clientData

    return CustomHandler

  #----------------------------------------------------------------------------
  def get( self ) :
    """
    Get the WebData handler class.

    Due to how the handler is used an intermediate class must be created so
    parameters can be passed to the handler.

    Use this function to get the class passed to `WebSocketServer`.
    """
    return self._makeWebDataHandlerClass( self._webDataClass, self._clientData )
