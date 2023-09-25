#------------------------------------------------------------------------------
# Uses: Class to track functions shared through some transport interface.
# Date: 2019-05-20
# Author: Andrew Que (https://www.DrQue.net/)
# License: MIT license (https://opensource.org/licenses/MIT)
#
#                          (C) 2019 by Andrew Que
#------------------------------------------------------------------------------
import types
import typing
import threading
import sys
import uuid
import traceback
from webSocketAPI.notification import Notification

class WebDataClass :
  """
  Class to track functions shared through some transport interface.

  Typically, a single instance of `WebDataClass` will exist.  Class instances
  that have members to share over the interface will be added during setup.
  The interface will then use `call` to call member functions.
  """
  def __init__( self ) :
    self.table = {}

  #----------------------------------------------------------------------------
  def addFunction( self, name : str, function : typing.Callable ) :
    """
    Add a function to be shared.

    Parameters
    ----------
      name : string
        Name of function as referenced remotely.
      function :
    """

    self.table[ name ] = {
      "type" : "function",
      "function" : function
    }

  #----------------------------------------------------------------------------
  def add( self, name : str, classInstance ) :
    """
    Add a class instance to be shared.

    All the of public members of `classInstance` will be available.

    Parameters
    ----------
      name : string
        Name of class as referenced remotely.
      classInstance : object
        A class with data to share.
    """

    def addMember( memberName, member ) :
      # If a public method...
      # (Private members start with underscore.)
      if not memberName.startswith( "_" ) :
        # Name is a combination of the object's name and the member function.
        fullName = name + "." + memberName

        # Setup entry based on member function being normal or static.
        # Normal member functions require the class instance to execute.
        if isinstance( member, types.FunctionType ) :
          self.table[ fullName ] = {
            "type" : "member",
            "instance" : classInstance,
            "function" : member
          }
        elif isinstance( member, staticmethod ) :
          self.table[ fullName ] = {
            "type" : "function",
            "function" : member.__func__
          }

    # Add all inherited member functions.
    for baseClass in classInstance.__class__.__bases__ :
      for memberName, member in baseClass.__dict__.items() :
        addMember( memberName, member )

    # Loop through all the members of the class.
    for memberName, member in classInstance.__class__.__dict__.items() :
      addMember( memberName, member )

  #----------------------------------------------------------------------------
  def call( self, name, data=[] ) :
    """
    Execute and return data from specified

    Parameters
    ----------
      name : str
        Name of function.
      data : array
        Parameters to function.

    Returns
    -------
      bool
      True if the operation started successfully, False if not.
    """
    result = { "data" : None, "error" : "No such function: " + name }

    if name in self.table :
      functionData = self.table[ name ]
      function = functionData[ "function" ]

      try :

        # For static functions...
        if "function" == functionData[ "type" ] :
          # Run the action function based on how parameters were passed in.
          if isinstance( data, list ) :
            result = function( *data )
          elif isinstance( data, dict ) :
            result = function( **data )
          else :
            result = function( data )

        # For class member functions...
        if "member" == functionData[ "type" ] :
          instance = functionData[ "instance" ]
          # Run the action function based on how parameters were passed in.
          if isinstance( data, list ) :
            result = function( instance, *data )
          elif isinstance( data, dict ) :
            result = function( instance, **data )
          else :
            result = function( instance, data )

        result = { "data" : result, "error" : None }

      except Exception as exception :
        #$$$exc_type, exc_value, exc_traceback = sys.exc_info()
        print( exception, "\n", data )
        traceback.print_exc()
        result = { "data" : None, "error" : str( exception ) }

    return result


  #----------------------------------------------------------------------------
  def asynchronousCall( self, name, data, notificationName ) :
    """
    Start execution of asynchronous call.
    Similar to `call` except this function starts a thread to execute the
    requested function and then returns.  When the requested function finishes,
    the data is relayed back using a notification.

    Parameters
    ----------
      name : str
        Name of function.
      data : array
        Parameters to function.
      notificationName : str
        A name for the notification to be created once the function has finished.

    Returns
    -------
      bool
      True if the operation started successfully, False if not.
    """

    isSuccess = False
    if name in self.table :
      isSuccess = True

      # Temporary signal.
      notification = Notification( notificationName )

      def _asynchronousWrapper( notification ) :
        """
        Thread that calls requested function, signals when complete, and then
        removes signal.
        """
        results = self.call( name, data )
        notification.signal( results )
        notification.release()
        del notification

      threading.Thread( target=_asynchronousWrapper, args=[ notification ] ).start()

    return isSuccess