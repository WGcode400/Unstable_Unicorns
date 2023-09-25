#------------------------------------------------------------------------------
# Uses: A Listener that when signaled sends the data to a WebSocket.
# Date: 2019-05-20
# Author: Andrew Que (https://www.DrQue.net/)
# License: MIT license (https://opensource.org/licenses/MIT)
#
#                          (C) 2019 by Andrew Que
#------------------------------------------------------------------------------
import json
from webSocketAPI.listener import Listener
from webSocketAPI.SimpleWebSocketServer import WebSocket

class WebListener( Listener ) :
  """
  A `Listener` that when signaled sends the data to a `WebSocket`.

  Parameters
  ----------
    name : str
      Item for which to listen.
    echoBack
      Additional data to send with notification.
    webSocket : WebSocket
      `WebSocket` used to transmit notifications.
  """
  def __init__( self, name : str, echoBack, webSocket : WebSocket ) :
    self.name = name
    self.echoBack = echoBack
    self.webSocket = webSocket

  #--------------------------------------------------------------------------
  def _toDictionary( data ) :
    toDictionaryFunction = getattr( data, "toDictionary", None )
    if callable( toDictionaryFunction ):
      result = data.toDictionary()
    else :
      result = str( data )

    return result

  #----------------------------------------------------------------------------
  def signal( self, data, instance ) :
    """
    Signal this event has taken place and send notification.

    Parameters
    ----------
      data
        Data associated with the notification.
    """

    # Construct data to be sent.
    # The `echoBack` are the parameters requested to be sent by the client.
    payload = {
      "echoBack" : self.echoBack,
      "notification" :
      {
        "name" : self.name,
        "data" : data
      }
    }
    jsonString = json.dumps( payload, default=WebListener._toDictionary )
    self.webSocket.sendMessage( jsonString )
