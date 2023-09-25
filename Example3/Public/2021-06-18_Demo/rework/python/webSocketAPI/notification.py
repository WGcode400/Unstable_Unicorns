#------------------------------------------------------------------------------
# Uses: Class that allows other objects to be signaled.
# Date: 2019-05-20
# Author: Andrew Que (https://www.DrQue.net/)
# License: MIT license (https://opensource.org/licenses/MIT)
#
#                          (C) 2019 by Andrew Que
#------------------------------------------------------------------------------
from webSocketAPI.listener import Listener

class Notification :
  """
  Class that allows other objects to be signaled.

  A notification typically happens when a value changes or process completes.
  One or more listening function can then be notified about the event.

  A notification object is the item that produces the notification.  It must
  create an instance of this class which will register it with the supplied
  name.

  Objects wishing to be notified can add listeners using the static member.

  Parameters
  ----------
    name : str
      Name of notification.
  """
  def __init__( self, name : str ) :
    self.listeners = []
    self._name = name
    Notification.instances[ name ] = self

  # Static list of instances.
  instances = {}

  #----------------------------------------------------------------------------
  def release( self ) :
    """
    Remove notification from instances.
    """
    del Notification.instances[ self._name ]

  #----------------------------------------------------------------------------
  def addListener( name : str, listener : Listener ) :
    """
    Add a listener that will be notify the `name` object when signaled.

    Parameters
    ----------
      name - Name of object.
      listener - Handler that is informed when a notification takes place.
    """
    Notification.instances[ name ].add( listener )

  #----------------------------------------------------------------------------
  def removeListener( name : str, listener : Listener  ) :
    """
    Stop listening to `name`.

    Parameters
    ----------
      name - Name of object.
      listener - Handler that is informed when a notification takes place
        previously registered using `addListener`.
    """
    if name in Notification.instances :
      Notification.instances[ name ].remove( listener )

  #----------------------------------------------------------------------------
  def add( self, listener : Listener ) :
    """
    Add a listener that will be notify when this object is signaled.

    Parameters
    ----------
      listener - Handler that is informed when a notification takes place.
    """
    self.listeners.append( listener )

  #----------------------------------------------------------------------------
  def remove( self, listener ) :
    """
    Stop listener previously setup for this object.

    Parameters
    ----------
      listener - Handler that is informed when a notification takes place.
    """
    self.listeners.remove( listener )

  #----------------------------------------------------------------------------
  def signal( self, value=None, instance=None ) :
    """
    Signal to send this notification to all listeners.

    Parameters
    ----------
      value
        Data sent to the listeners.
      instance
        Signaling object.
    """
    for listener in self.listeners :
      listener.signal( value, instance )
