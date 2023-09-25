#------------------------------------------------------------------------------
# Uses: HTTP server setup that runs in its own thread.
# Date: 2019-05-20
# Author: Andrew Que (https://www.DrQue.net/)
# License: MIT license (https://opensource.org/licenses/MIT)
#
#                          (C) 2019 by Andrew Que
#------------------------------------------------------------------------------
import os
import http.server
import socketserver
import threading

class ThreadedHTTP_Server :
  """
  A `SimpleHTTPRequestHandler` with a path to served files and services via
  thread.

  HTTP data is serviced by a thread.  A timeout on the socket is used to
  prevent the handler from blocking for a long time which allows faster
  shutdown once the server is signaled to stop.

  Parameters
  ----------
    shutdownEvent : threading.Event
      Event to notify thread of shutdown.
    networkInterface : str
      Network interface to bind.  Use '' for all interfaces (default).
    port : int
      Port to bind. 8000 is default.
    webDirectory : str
      Root path to serve files from.
    maxBlockTime : float
      Time to block waiting for request.  Default is 0.1 or 100 ms.
  """
  def __init__(
    self,
    shutdownEvent,
    networkInterface='',
    port=8000,
    webDirectory=".",
    maxBlockTime=0.1
  ) :

    # Setup HTML server.
    self._httpd = ThreadedHTTP_Server.ThreadedHTTPServer(
      webDirectory,
      ( networkInterface, port ),
      ThreadedHTTP_Server.WebServer
    )

    # Setup the blocking timeout on the socket.
    # This allows the thread to check for shutdown requests.
    self._httpd.socket.settimeout( maxBlockTime )

    self._updateThread = ThreadedHTTP_Server.UpdateThread( shutdownEvent, self._httpd )
    self._updateThread.start()

  #============================================================================
  class WebServer( http.server.SimpleHTTPRequestHandler ):
    """
    Basic HTTP server, but with a path.
    """

    #---------------------------------------------------------------------
    def translate_path( self, path ):
      """
      Translate paths using server.webDirectory.  Allows server to run from
      one directory and serve pages from another.
      """
      path = http.server.SimpleHTTPRequestHandler.translate_path( self, path )
      relpath = os.path.relpath( path, os.getcwd() )
      fullpath = os.path.join( self.server.webDirectory, relpath )
      return fullpath

  #============================================================================
  class ThreadedHTTPServer( socketserver.ThreadingMixIn, http.server.HTTPServer ):
    """
    Class to handle HTTP requests in a separate thread.

    Parameters
    ----------
      webDirectory : str
        Path from current directory to web page directory.
      serverAddress : tuple
        Two element tuple with interface and port to bind.
      requestHandlerClass
        Request handler class type.
    """
    def __init__( self, webDirectory, serverAddress, requestHandlerClass ):
      http.server.HTTPServer.__init__( self, serverAddress, requestHandlerClass )
      self.webDirectory = webDirectory

  #==============================================================================
  class UpdateThread( threading.Thread ) :
    """
    Thread the signals a notification once a second.

    Parameters
    ----------
      server : ThreadedHTTPServer
        Instance of `ThreadedHTTPServer` to poll via thread.
    """
    def __init__( self, shutdownEvent, server, *args, **kwargs ) :
      super( ThreadedHTTP_Server.UpdateThread, self ).__init__( *args, **kwargs )

      # Server to poll.
      self._server = server

      # Event to signify shutdown.
      self._shutdownEvent = shutdownEvent

    #--------------------------------------------------------------------------
    def run( self ) :
      """
      Thread body.

      Just polls the handler.
      """

      # Loop while not requested to shutdown.
      while not self._shutdownEvent.is_set() :
        self._server.handle_request()
