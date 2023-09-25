#------------------------------------------------------------------------------
# Uses: Thread to run the WebDataSocket.
# Date: 2019-07-18
# Author: Andrew Que (https://www.DrQue.net/)
# License: MIT license (https://opensource.org/licenses/MIT)
#
#                          (C) 2019 by Andrew Que
#------------------------------------------------------------------------------
import os
import http.server
import socketserver
import threading

from webSocketAPI.SimpleWebSocketServer import WebSocket, SimpleWebSocketServer, WebSocketException

class ThreadedWebSocketServer :
  """
  A `SimpleWebSocketServer` updated via thread.

  Parameters
  ----------
    shutdownEvent : threading.Event
      Event to notify thread of shutdown.
    networkInterface : str
      Network interface to bind.  Use '' for all interfaces (default).
    port : int
      Port to bind. 8000 is default.
    webDataSocket : WebDataSocket
      WebSocket data
    maxBlockTime : float
      Time to block waiting for request.  Default is 0.1 or 100 ms.
  """
  def __init__(
    self,
    shutdownEvent,
    networkInterface='',
    port=8000,
    webDataSocket=None,
    maxBlockTime=0.1
  ) :

    self._webSocketServer = SimpleWebSocketServer(
      networkInterface,
      port,
      webDataSocket,
      maxBlockTime
    )

    self._updateThread = ThreadedWebSocketServer.UpdateThread(
      shutdownEvent,
      self._webSocketServer
    )

    self._updateThread.start()

  #==============================================================================
  class UpdateThread( threading.Thread ) :
    """
    Thread the signals a notification once a second.
    """
    def __init__( self, shutdownEvent, server, *args, **kwargs ) :
      super( ThreadedWebSocketServer.UpdateThread, self ).__init__( *args, **kwargs )
      self._server = server
      self._shutdown = shutdownEvent

    #--------------------------------------------------------------------------
    def run( self ):
      while not self._shutdown.is_set() :
        try :
          self._server.serveonce()
        except WebSocketException as exception :
          # Web socket exceptions are ignored.
          pass
