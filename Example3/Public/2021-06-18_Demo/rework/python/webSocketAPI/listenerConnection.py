#------------------------------------------------------------------------------
# Uses: Connection that allows WebListener to be created and removed when
#       connection is closed.
# Date: 2019-05-20
# Author: Andrew Que (https://www.DrQue.net/)
# License: MIT license (https://opensource.org/licenses/MIT)
#
#                          (C) 2019 by Andrew Que
#------------------------------------------------------------------------------
import uuid
from webSocketAPI.SimpleWebSocketServer import WebSocket
from webSocketAPI.notification import Notification
from webSocketAPI.webListener import WebListener

class ListenerConnection :
  """
  Parameters
  ----------
    webSocket : WebSocket
      WebSocket used to transport data.
  """
  def __init__( self, webSocket : WebSocket ) :
    self.notification = {}
    self.webSocket = webSocket
    self._id = uuid.uuid4()

  #----------------------------------------------------------------------------
  def __del__( self ) :
    """
    Called as object is freed and used to remove all listeners created by
    this connection.
    """
    for name, listener in self.notification.items() :
      Notification.removeListener( name, listener )

  #----------------------------------------------------------------------------
  def setId( self, id ) :
    self._id = id

  #----------------------------------------------------------------------------
  def getId( self ) :
    return self._id

  #----------------------------------------------------------------------------
  def listen( self, name, parameters = None ) :
    """
    Add a WebListener that be notified when `name` is signaled.

    Parameters
    ----------
      name : str
        Name of notification to listen.
      parameters : array or None
        Additional parameters to pass back when notification is sent.

    Returns
    -------
      bool
      True if there was an error, False if not.
    """
    isError = True
    if name in Notification.instances :
      self.notification[ name ] = WebListener( name, parameters, self.webSocket )
      Notification.addListener( name, self.notification[ name ] )
      isError = False

    return isError
