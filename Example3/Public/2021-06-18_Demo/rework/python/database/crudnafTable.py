#!/usr/bin/env python3
#==============================================================================
# Uses: Provide CRUFNAF functions to a database table.
# Date: 2020-06-12
#==============================================================================
import mysql.connector
import threading
import json

from database.crudnaf import CRUDNAF_Interface
from database.databaseConnection import DatabaseConnection
from webSocketAPI.notification import Notification

class CRUDNAF_Table( CRUDNAF_Interface ) :
  """
  Database table with CRUDNAF interface for managing records.

  Input:
    databaseConnection - Instance of `DatabaseConnection`.
    tablePrefix - Prefix to prepended to all table names.
    table - Name of table.
  """

  #----------------------------------------------------------------------------
  def __init__( self, databaseConnection : DatabaseConnection, tablePrefix, table ) :
    self._mutex = threading.Lock()

    self._database = databaseConnection
    self._tableFullName = tablePrefix + "_" + table
    self._table = table

    # Make notification for changes to table.
    self._notification = Notification( table )

  #----------------------------------------------------------------------------
  def getTableName( self ) :
    return self._table

  #----------------------------------------------------------------------------
  def create( self, data ) :

    valuesString = ""
    parametersString = ""
    parameters = []
    for key, value in data.items() :
      # Skip fields that are null.
      if value is not None :
        if "" != valuesString :
          valuesString += ","
          parametersString += ","

        valuesString += "`" + str( key ) + "`"
        parametersString += "%s"

        value = str( value ) #json.dumps( value )
        parameters.append( value )

    queryString = """
        INSERT
        INTO `""" + self._tableFullName + """`
          ( """ + valuesString + """ )
        VALUES
          ( """ + parametersString + """ )
        """

    result = False
    with self._mutex :
      result = self._database.commitQuery( queryString, parameters )

    if result :
      record = self.read( data[ "id" ] )
      eventData = {
        "type" : "create",
        "data" : record
      }

      self._notification.signal( eventData, record )

    return result

  #----------------------------------------------------------------------------
  def read( self, id ) :
    result = None
    with self._mutex :
      result = self._database.fetchQuery(
        """
        SELECT *
        FROM `""" + self._tableFullName + """`
        WHERE id = %s
        """,
        ( id, )
      )

      if result is not None :
        result = result[ 0 ]

    return result

  #----------------------------------------------------------------------------
  def readAll( self ) :
    result = None
    with self._mutex :
      result = self._database.fetchQuery(
        """
        SELECT *
        FROM `""" + self._tableFullName + """`
        """,
        tuple()
      )

    return result

  #----------------------------------------------------------------------------
  def update( self, id, data, idField="id" ) :
    valuesString = ""
    parameters = []
    for key, value in data.items() :

      # Skip fields that are null.
      if value is not None :
        if "" != valuesString :
          valuesString += ","

        valuesString += "`" + key + "` = %s"

        value = str( value ) #json.dumps( value )
        parameters.append( value )

    parameters.append( id )

    queryString = """
        UPDATE
          `""" + self._tableFullName + """`
        SET
          """ + valuesString + """
        WHERE
          `""" + idField + """` = %s
        """

    result = False
    with self._mutex :
      result = self._database.commitQuery( queryString, parameters )

    if result :
      record = self.read( id )
      eventData = {
        "type" : "update",
        "data" : record
      }
      self._notification.signal( eventData, record )

    return result

  #----------------------------------------------------------------------------
  def delete( self, id ) :
    result = False

    oldRecord = self.read( id )

    with self._mutex :
      result = self._database.commitQuery(
        """
        DELETE
        FROM `""" + self._tableFullName + """`
        WHERE id = %s
        """,
        ( id, )
      )

    if result :
      eventData = {
        "type" : "delete",
        "data" : oldRecord
      }
      self._notification.signal( eventData, oldRecord )

    return result

  #----------------------------------------------------------------------------
  def flush( self ) :
    """
    Clear all rows in table.
    """
    result = False
    with self._mutex :
      result = not self._database.commitQuery( "TRUNCATE TABLE `" + self._tableFullName + "`", tuple() )

    if result :
      eventData = {
        "type" : "flush",
        "data" : None
      }
      self._notification.signal( eventData, None )

    return result

  #----------------------------------------------------------------------------
  def count( self ) :
    return self._database.countRows( self._tableFullName )

# Test code.
if __name__ == "__main__":

  import uuid
  import time
  import datetime
  import random
  import string

  TABLE_PRIFIX = "webUI"
  TEST_TABLE = "testTable"

  #
  # A few random test functions.
  #

  #----------------------------------------------------------------------------
  def randomString( min=2, max=8 ) :
    length = random.randint( min, max )
    return ''.join( random.choice( string.ascii_lowercase ) for _ in range( length ) )

  #----------------------------------------------------------------------------
  def randomName( min=2, max=8 ) :
    return randomString( min, max ).capitalize()

  #----------------------------------------------------------------------------
  def randomWords( min=4, max=16 ) :
    length = random.randint( min, max )
    return ' '.join( randomString() for _ in range( length ) )

  #----------------------------------------------------------------------------
  def randomSentence( min=4, max=16 ) :
    return randomWords( min, max ).capitalize() + "."

  #----------------------------------------------------------------------------
  def randomParagraph( min=3, max=32 ) :
    length = random.randint( min, max )
    return '  '.join( randomSentence() for _ in range( length ) )

  #----------------------------------------------------------------------------
  def randomRecord() :
    return {
      "id"    : str( uuid.uuid4() ),
      "tag"   : random.randrange( 255 ),
      "room"  : str( random.randrange( 10000 ) ),
      "first" : randomName(),
      "middle": randomName(),
      "last"  : randomName(),
      "notes" : randomParagraph(),
    }

  #----------------------------------------------------------------------------
  def compareRecord( a, b ) :
    del a[ "createTime" ]
    del a[ "modifiedTime" ]
    return ( a == b )

  from webSocketAPI.listener import Listener

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
  # Setup the database.
  #

  # Connect to database.
  database = DatabaseConnection(
    "localhost",
    "bb7",
    "bb7Madison",
    "ACU-500",
    TABLE_PRIFIX
  )

  database.addTable(
    TEST_TABLE,
    """
    `id`   tinytext  NOT NULL,
    `first`  text,
    `last`   text,
    `middle` text,
    `room`   text,
    `tag`    int ,
    `notes`  text,
    `createTime` datetime DEFAULT CURRENT_TIMESTAMP,
    `modifiedTime` datetime default now() on update now(),
    PRIMARY KEY (`id`(32))
    """
  )

  #------------------------------------

  databaseTable = CRUDNAF_Table( database, TABLE_PRIFIX, TEST_TABLE )

  # Add listener that receives notifications when test table is changed.
  Notification.addListener( TEST_TABLE, EventListener() )
  #EventListener.printEnable = True

  #$$$ databaseTable = database.getDatabaseTable( TEST_TABLE )

  #
  # Test 1: Add a record.
  # Checks `database.create`.
  #

  # Make a new record record.
  record = {
    "id"    : str( uuid.uuid4() ),
    "tag"   : 123,
    "room"  : "A5",
    "first" : "Jane",
    "middle": "Plain",
    "last"  : "Doe",
    "notes" : "Notes."
  }

  # Add the record
  EventListener.isSignal = False
  databaseTable.create( record )

  # Verify the create notification worked.
  assert( EventListener.isSignal )
  assert( EventListener.lastNotification[ "type" ] == "create" )
  assert( compareRecord( EventListener.lastNotification[ "data" ], record ) )

  #
  # Test 2: Update a record.
  # Checks `database.update` and `database.read`.
  #

  # Changes to apply.
  change = {
    "first" : "Alice",
    "last"  : "Hack"
  }

  # Structure of resulting record.
  changedRecord = {
    "id"    : record[ "id" ],
    "tag"   : 123,
    "room"  : "A5",
    "first" : "Alice",
    "middle": "Plain",
    "last"  : "Hack",
    "notes" : "Notes."
  }

  # Make changes.
  EventListener.isSignal = False
  databaseTable.update( record[ "id" ], changedRecord )

  # Check the change notification worked.
  assert( EventListener.isSignal )
  assert( EventListener.lastNotification[ "type" ] == "update" )
  assert( compareRecord( EventListener.lastNotification[ "data" ], changedRecord ) )

  # Read the record from database.
  data = databaseTable.read( record[ "id" ] )

  # Verify record is what we expect.
  assert( compareRecord( data, changedRecord ) )

  #
  # Test 3: Remove record.
  # Checks `database.delete`.
  #

  # Remove record.
  EventListener.isSignal = False
  databaseTable.delete( record[ "id" ] )

  # Check the remove notification worked.
  assert( EventListener.isSignal )
  assert( EventListener.lastNotification[ "type" ] == "delete" )
  assert( compareRecord( EventListener.lastNotification[ "data" ], changedRecord ) )

  #
  # Test 4: Read all test.
  # Checks `database.readAll`.
  #

  # Create a bunch of random records.
  records = {}
  for count in range( 100 ) :
    record = randomRecord()
    id = record[ "id" ]
    records[ id ] = record

  # Add records to database.
  for record in records.values() :
    EventListener.isSignal = False
    databaseTable.create( record )
    assert( EventListener.isSignal )
    assert( EventListener.lastNotification[ "type" ] == "create" )
    assert( compareRecord( EventListener.lastNotification[ "data" ], record ) )

  # Read all records.
  output = databaseTable.readAll()

  # Verify each record.
  for record in output :
    id = record[ "id" ]
    assert( compareRecord( record, records[ id ] ) )

  #
  # Test 5: Flush the entire table.
  # Checks `database.flush`.
  #

  # Do flush.
  EventListener.isSignal = False
  databaseTable.flush()

  # Check the flush notification worked.
  assert( EventListener.isSignal )
  assert( EventListener.lastNotification[ "type" ] == "flush" )
  assert( EventListener.lastNotification[ "data" ] == None )

  #
  # Test 6: Drop database table.
  # Checks `database.drop`.
  #
  assert( database.drop( TEST_TABLE ) == True )
