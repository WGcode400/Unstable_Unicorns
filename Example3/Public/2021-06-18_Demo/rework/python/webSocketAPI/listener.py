#------------------------------------------------------------------------------
# Uses: Object that can be signaled.
# Date: 2019-05-20
# Author: Andrew Que (https://www.DrQue.net/)
# License: MIT license (https://opensource.org/licenses/MIT)
#
#                          (C) 2019 by Andrew Que
#------------------------------------------------------------------------------
class Listener :
  """
  An object that can be notified.

  This is an abstract class as a base `Listener` object isn't useful.
  """

  #----------------------------------------------------------------------------
  def signal( self, data, instance=None ) :
    """
    Signal a change has taken place.

    Parameters
    ----------
      data
        Data associated with the notification.
      instance
        Signaling object.
    """
    pass
