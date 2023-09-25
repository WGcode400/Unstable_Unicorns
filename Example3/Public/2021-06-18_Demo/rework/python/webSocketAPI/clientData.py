#------------------------------------------------------------------------------
# Uses: Data storage specific to connected client.
# Date: 2021-05-24
# Author: Andrew Que (https://www.DrQue.net/)
# License: MIT license (https://opensource.org/licenses/MIT)
#
#                          (C) 2021 by Andrew Que
#------------------------------------------------------------------------------
import uuid
import json
from database.crudnaf import CRUDNAF_Class, CRUDNAF_Interface, CRUDNAF_GenericObject, CRUDNAF_PrivateObject
from webSocketAPI.notification import Notification

#==============================================================================
class ClientData( CRUDNAF_Class ) :
  #----------------------------------------------------------------------------
  def __init__( self ) :
    CRUDNAF_Class.__init__( self, "clientData", CRUDNAF_PrivateObject )

  #----------------------------------------------------------------------------
  def register( self, clientId, record = {} ) :
    record[ "id" ] = clientId
    self.create( record )

  #----------------------------------------------------------------------------
  def unregister( self, clientId ) :
    self.delete( clientId )

  #----------------------------------------------------------------------------
  def setMultiple( self, clientId, values ) :
    record = self.read( clientId ).getAll()
    for key, data in values.items() :
      record[ key ] = data

    return CRUDNAF_PrivateObject.filter( self.update( clientId, record ) )

  #----------------------------------------------------------------------------
  def set( self, clientId, key, data ) :
    return self.setMultiple( clientId, { key: data } )

  #----------------------------------------------------------------------------
  def get( self, clientId, key ) :
    result = None
    record = self.read( clientId )
    if record is not None :
      data = record.getAll()
      if key in data :
        result = data[ key ]

    return result

  #----------------------------------------------------------------------------
  def getAll( self, clientId ) :
    return self.read( clientId ).get()

  #----------------------------------------------------------------------------
  def remove( self, clientId, key ) :
    record = self.read( clientId )
    del record[ key ]
    return self.update( clientId, record )

  #----------------------------------------------------------------------------
  def getCleintData( self ) :
    return self.readAll()

#==============================================================================
class ClientDataWeb( CRUDNAF_Interface ) :
  #----------------------------------------------------------------------------
  def __init__( self, clientData : ClientData ) :
    self._clientData = clientData
    self._notifications = {}

  #----------------------------------------------------------------------------
  def queryCallback( self, responseData, id ) :
    jsonString = json.dumps( responseData )
    print( "queryCallback", responseData, id )

  #----------------------------------------------------------------------------
  def query( self, id, query, responseId ) :
    connection = self._clientData.get( id, "_connection" )

    def _handler( responseData, id ) :
      self.queryCallback( responseData, id )
      connection.removeResponseHandler( responseId )

    connection.addResponseHandler( responseId, _handler, responseId )

    jsonString = json.dumps( query )
    connection.sendMessage( jsonString )

  #----------------------------------------------------------------------------
  def _makeSignal( self, notificationId ) :
    def _signal( data, _ ) :
      self.signalNotification( notificationId, data )

    return _signal

  #----------------------------------------------------------------------------
  def makeNotification( self, clientId, name ) :

    # If notification already exists, remove it.
    if name in self._notifications :
      del self._notifications[ name ]

    # Create notification.
    self._notifications[ name ] = Notification( name )

    connection = self._clientData.get( clientId, "_connection" )
    connection.addResponseHandler( name, self._makeSignal( name ), None )

  #----------------------------------------------------------------------------
  def signalNotification( self, name, data ) :

    if name in self._notifications :
      self._notifications[ name ].signal( data )
      isError = False
    else :
      isError = True

    # $$$ print( "Signaling", name, isError )

    return isError

  #----------------------------------------------------------------------------
  def read( self, id ) :
    """
    Read a single record.
    """
    result = None
    if id in self._clientData :
      result = self._clientData[ id ]

    return result

  #----------------------------------------------------------------------------
  def readAll( self ) :
    """
    Read all records.
    """
    records = self._clientData.readAll()
    result = {}
    for clientId, clientData in records.items() :
      result[ clientId ] = {}
      for key, value in clientData.get().items() :
        if not key.startswith( "_" ) :
          result[ clientId ][ key ] = value

    return result

  #----------------------------------------------------------------------------
  def getClients( self ) :
    return list( self._clientData.getCleintData().keys() )

