#!/usr/bin/env python3
#==============================================================================
# Uses: CRUDNAF exporter for class.
# Date: 2020-05-13
# Notes:
#   This class will wrap a export Create, Read, Update, Delete, Notify,
#   read All, Flush (CRUDNAF) for a class.
#   Class is assumed to be something kept as a set, keyed by a unique id, and
#   has the method `set` that can upset itself from a dictionary.
#==============================================================================

from webSocketAPI.notification import Notification

#==============================================================================
class CRUDNAF_ObjectInterface :

  #----------------------------------------------------------------------------
  def __init__( self, data : dict ) :
    self.setTo( data )

  #----------------------------------------------------------------------------
  def setTo( self, data : dict ) -> bool :
    raise NotImplementedError( "The method not implemented" )

  #----------------------------------------------------------------------------
  def set( self, data : dict ) -> bool :
    raise NotImplementedError( "The method not implemented" )

#==============================================================================
class CRUDNAF_GenericObject( CRUDNAF_ObjectInterface ) :
  #----------------------------------------------------------------------------
  def setTo( self, data : dict ) -> bool :
    self._data = data
    return True

  #----------------------------------------------------------------------------
  def set( self, data : dict ) -> bool :

    result = True
    for key, value in data.items() :
      if key in self._data :
        self._data[ key ] = value
      else:
        result = False

    return result

  #----------------------------------------------------------------------------
  def get( self ) :
    return self._data

  #----------------------------------------------------------------------------
  def setItem( self, id, value ) :
    self._data[ id ] = value

  #----------------------------------------------------------------------------
  def getItem( self, id ) :
    result = None
    if id in self._data :
      result = self._data[ id ]

    return result

  #----------------------------------------------------------------------------
  def toDictionary( self ) :
    return self._data

#==============================================================================
class CRUDNAF_PrivateObject( CRUDNAF_GenericObject ) :
  """
  CRUFNAF generic object with private members removed from `get` requests.
  Can still set private elements.
  """

  #----------------------------------------------------------------------------
  @staticmethod
  def filter( record ) :
    """
    Return a record with only the public results (i.e. names not starting with
    underscore)
    """
    result = record
    if isinstance( record, dict ) :
      result = {}
      for key, value in record.items() :
        if not key.startswith( "_" ) :
          result[ key ] = CRUDNAF_PrivateObject.filter( value )
    elif isinstance( record, list ) :
      result = []
      for value in record :
        result.append( CRUDNAF_PrivateObject.filter( value ) )

    return result

  #----------------------------------------------------------------------------
  def get( self ) :
    return CRUDNAF_PrivateObject.filter( CRUDNAF_GenericObject.get( self ) )

  #----------------------------------------------------------------------------
  def getAll( self ) :
    return CRUDNAF_GenericObject.get( self )

#==============================================================================
class CRUDNAF_Interface :
  """
  A CRUDNAF interface must implement the basic CRUD functions.
  """

  #----------------------------------------------------------------------------
  def create( self, data : dict ) -> object :
    """
    Create a new instance of record.

    Input:
      data - Dictionary of data the represents the new object.
    Output:
      Object that is the result of the creation.  None if object was not
      created.
    """
    raise NotImplementedError( "The method not implemented" )

  #----------------------------------------------------------------------------
  def read( self, id ) -> object :
    """
    Read a single record.

    Input:
      id - Record id to read.
    Output:
      Requested data object.  None if object was not found.
    """
    raise NotImplementedError( "The method not implemented" )

  #----------------------------------------------------------------------------
  def readAll( self ) -> dict :
    """
    Read all records.

    Output:
      Object set keyed by id with all records in value.
    """
    raise NotImplementedError( "The method not implemented" )

  #----------------------------------------------------------------------------
  def update( self, id, data : dict ) -> object :
    """
    Modify existing record.

    Input:
      id - Record id to update.
      data - Key/value pair of items to be updated.
    Output:
      Updated record.
    """
    raise NotImplementedError( "The method not implemented" )

  #----------------------------------------------------------------------------
  def delete( self, id ) -> object :
    """
    Remove a record.

    Input:
      id - Record id to remove.
    Output:
      Record as it existed prior to being removed.
    """
    raise NotImplementedError( "The method not implemented" )

  #----------------------------------------------------------------------------
  def flush( self ) -> bool :
    """
    Remove all records.

    Output:
      True if flush was successful.
    """
    raise NotImplementedError( "The method not implemented" )

#==============================================================================
class CRUDNAF_Class( CRUDNAF_Interface ) :
  """
  CRUDNAF interface for class objects.
  """

  #----------------------------------------------------------------------------
  def __init__( self, name : str, classType : CRUDNAF_ObjectInterface, idField = "id" ) :
    self._instances = {}
    self._idField = idField
    self._class = classType
    self._notification = Notification( name )

  #----------------------------------------------------------------------------
  def create( self, data : dict, classOverride=None ) :
    """
    Create a new instance of record.
    """
    result = None

    instance = None
    if classOverride is not None :
      instance = classOverride( data )
      id = instance.getId()

    if self._idField in data :
      id = data[ self._idField ]
      instance = self._class( data )

    if instance is not None :
      self._instances[ id ] = instance

      eventData = {
        "type" : "create",
        "data" : self._instances[ id ]
      }

      self._notification.signal( eventData, self._instances[ id ] )

      result = self._instances[ id ]

    return result

  #----------------------------------------------------------------------------
  def read( self, id ) :
    """
    Read a single record.
    """
    result = None
    if id in self._instances :
      result = self._instances[ id ]

    return result

  #----------------------------------------------------------------------------
  def readAll( self ) :
    """
    Read all records.
    """
    return self._instances

  #----------------------------------------------------------------------------
  def update( self, id, data ) :
    """
    Modify existing record.
    """

    result = None
    if id in self._instances :
      self._instances[ id ].set( data )

      eventData = {
        "type" : "update",
        "data" : self._instances[ id ]
      }
      self._notification.signal( eventData, self._instances[ id ] )
      result = self._instances[ id ]

    return result

  #----------------------------------------------------------------------------
  def delete( self, id ) :
    """
    Remove a record.
    """

    result = None
    if id in self._instances :

      eventData = {
        "type" : "delete",
        "data" : self._instances[ id ]
      }
      self._notification.signal( eventData, self._instances[ id ] )

      result = self._instances[ id ]

      del self._instances[ id ]

    return result

  #----------------------------------------------------------------------------
  def flush( self ) :
    """
    Remove all records.
    """
    eventData = {
      "type" : "flush",
      "data" : None
    }
    self._notification.signal( eventData, None )

    self._instances = {}

if __name__ == "__main__":

  import json
  import string
  import uuid
  import random
  RECORD_COUNT = 100

  from webSocketAPI.listener import Listener

  #
  # A few random test functions.
  #

  #------------------------------------
  def randomString( min=2, max=8 ) :
    length = random.randint( min, max )
    return ''.join( random.choice( string.ascii_lowercase ) for _ in range( length ) )

  #------------------------------------
  def randomName( min=2, max=8 ) :
    return randomString( min, max ).capitalize()

  #
  # Event handler to listen for database events.
  # This class will be used to check and see that events take place.
  #
  class EventListener( Listener ) :
    printEnable = False
    isSignal = False
    lastNotification = None

    #--------------------------------------------------------------------------
    def toDictionary( data ) :
      toDictionaryFunction = getattr( data, "toDictionary", None )
      if callable( toDictionaryFunction ):
        result = data.toDictionary()
      else :
        result = str( data )

      return result

    #--------------------------------------------------------------------------
    def signal( self, data, event ) :
      EventListener.isSignal = True
      EventListener.lastNotification = data
      jsonString = json.dumps( data, default=EventListener.toDictionary, indent=2 )
      if EventListener.printEnable :
        print( "Notification:", jsonString )

  #
  # Some simple class for testing.
  #
  class SimpleClass( CRUDNAF_GenericObject ) :
    pass

  simpleClassCRUDNAF = CRUDNAF_Class( "SimpleClass", SimpleClass )

  Notification.addListener( "SimpleClass", EventListener() )

  #
  # Create
  #
  records = {}
  for _ in range( RECORD_COUNT ) :
    id = str( uuid.uuid4() )
    records[ id ] = {
      "id"    : id,
      "first" : randomName(),
      "last"  : randomName(),
      "value" : random.randint( 0, 1000 )
    }
    EventListener.isSignal = False
    record = simpleClassCRUDNAF.create( records[ id ] )
    assert( EventListener.isSignal )
    assert( EventListener.lastNotification[ "type" ] == "create" )
    assert( record.get() == records[ id ] )

  #
  # Read
  #
  for ( id, recordData ) in records.items() :
    record = simpleClassCRUDNAF.read( id )
    assert( record.get() == recordData )

  #
  # Modify
  #
  ids = list( records.keys() )
  for _ in range( RECORD_COUNT ) :
    id = random.choice( ids )
    records[ id ][ "first" ] = randomName()
    records[ id ][ "last"  ] = randomName()
    records[ id ][ "value" ] = random.randint( 0, 1000 )

    EventListener.isSignal = False
    record = simpleClassCRUDNAF.update( id, records[ id ] )
    assert( EventListener.isSignal )
    assert( EventListener.lastNotification[ "type" ] == "update" )
    assert( record.get() == records[ id ] )

  #
  # Delete
  #
  ids = list( records.keys() )
  for id in ids :
    oldRecord = records[ id ]
    EventListener.isSignal = False
    record = simpleClassCRUDNAF.delete( id )
    assert( EventListener.isSignal )
    assert( EventListener.lastNotification[ "type" ] == "delete" )
    assert( record.get() == oldRecord )

  #
  # Create (second set)
  #
  records = {}
  for _ in range( RECORD_COUNT ) :
    id = str( uuid.uuid4() )
    records[ id ] = {
      "id"    : id,
      "first" : randomName(),
      "last"  : randomName(),
      "value" : random.randint( 0, 1000 )
    }
    EventListener.isSignal = False
    record = simpleClassCRUDNAF.create( records[ id ] )
    assert( EventListener.isSignal )
    assert( EventListener.lastNotification[ "type" ] == "create" )
    assert( record.get() == records[ id ] )

  #
  # Read all
  #
  returnedRecord = simpleClassCRUDNAF.readAll()
  for ( id, record ) in returnedRecord.items() :
    assert( record.get() == records[ id ] )

  #
  # Flush
  #
  EventListener.isSignal = False
  simpleClassCRUDNAF.flush()
  assert( EventListener.isSignal )
  assert( EventListener.lastNotification[ "type" ] == "flush" )
  assert( EventListener.lastNotification[ "data" ] == None )

  returnedRecord = simpleClassCRUDNAF.readAll()
  assert( 0 == len( returnedRecord ) )

  #------------------------------------
  # Private object.
  #------------------------------------

  privateClassCRUDNAF = CRUDNAF_Class( "SimpleClass", CRUDNAF_PrivateObject ) #CRUDNAF_PrivateClass( "SimplePrivateClass", CRUDNAF_GenericObject )

  #
  # Create
  #
  records = {}
  privateRecords = {}
  for _ in range( RECORD_COUNT ) :
    id = str( uuid.uuid4() )
    records[ id ] = {
      "id"    : id,
      "first" : randomName(),
      "last"  : randomName(),
      "value" : random.randint( 0, 1000 ),
      "_private" : 1234,
      "array" :
      [
        {
          "a"  : 1,
          "_b" : 2,
          "_c" :
          {
            "c.a" : 11,
            "c.b" : 12,
            "c.c" : 13
          }
        },
        {
          "d" :
          {
            "d.a"  : 21,
            "_d.b" : 22,
            "d.c"  : 23
          }
        },
      ],
      "dictionary" :
      {
        "c" : 3,
        "_d" : 4
      }
    }

    record = privateClassCRUDNAF.create( records[ id ] )
    data = record.get()
    assert( "_private" not in data  )
    assert( "_d" not in data[ "dictionary" ]  )
    assert( "_b" not in data[ "array" ][ 0 ]  )
    assert( "_c" not in data[ "array" ][ 0 ]  )
    assert( "_d.b" not in data[ "array" ][ 1 ][ "d" ]  )
