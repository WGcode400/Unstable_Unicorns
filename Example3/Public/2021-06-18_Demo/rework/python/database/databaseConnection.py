#!/usr/bin/env python3
#==============================================================================
# Uses: Basic connection to database.
# Date: 2020-06-12
#==============================================================================
import mysql.connector
import threading
import json

from database.crudnaf import CRUDNAF_Interface
from webSocketAPI.notification import Notification

class DatabaseConnection :
  """
  Interface to database.

  Parameters
  ----------
    host - Address of database.
    user - User name in database.
    password - Password for user.
    database - Database to use.
    table - Table prefix.
  """

  #----------------------------------------------------------------------------
  def __init__( self, host, user, password, database, table ) :

    # Database cursors are not thread safe, so a mutex is used.
    self._mutex = threading.Lock()

    self._host     = host
    self._user     = user
    self._password = password
    self._database = database
    self._table    = table

    self._connect()

  #----------------------------------------------------------------------------
  def registerToWebSocket( webSocket ) :
    pass

  #----------------------------------------------------------------------------
  def __init__( self, host, user, password, database, table ) :

    # Database cursors are not thread safe, so a mutex is used.
    self._mutex = threading.Lock()

    self._host     = host
    self._user     = user
    self._password = password
    self._database = database
    self._table    = table

    self._connect()

  #----------------------------------------------------------------------------
  def _connect( self ) :
    self.mysqlDatabase = mysql.connector.connect(
      host=self._host,
      user=self._user,
      passwd=self._password,
      database=self._database
    )

    self.sqlCursor = self.mysqlDatabase.cursor( dictionary=True )

  #----------------------------------------------------------------------------
  def query( self, query, parameters ) :
    retries = 3
    tryAgain = True
    while tryAgain :
      try :
        self.sqlCursor.execute( query, parameters )
        tryAgain = False
      except ( BrokenPipeError, mysql.connector.errors.InterfaceError, mysql.connector.errors.DatabaseError ) :
        retries -= 1
        if retries <= 0 :
          raise

        print( "Broken SQL connection." )
        self._connect()

        tryAgain = retries > 0

  #----------------------------------------------------------------------------
  def fetchQuery( self, query, parameters ) :
    result = None
    with self._mutex :
      self.query( query, parameters )
      result = self.sqlCursor.fetchall()

    return result

  #----------------------------------------------------------------------------
  def commitQuery( self, query, parameters ) :
    result = False
    with self._mutex :
      self.query( query, parameters )
      self.mysqlDatabase.commit()
      result = ( self.sqlCursor.rowcount != 0 )

    return result

  #----------------------------------------------------------------------------
  def addTable( self, table, tableSetup ) :
    tableName = self._table + "_" + table
    self.query( "DROP TABLE IF EXISTS `" + tableName + "`", tuple() )
    self.query(
      """
      CREATE TABLE `""" + tableName + """`
      (
      """ + tableSetup + """
      )
      """,
      tuple()
    )

  #----------------------------------------------------------------------------
  def getDatabaseTable( self, name ) :
    return self._tables[ name ]

  #----------------------------------------------------------------------------
  def drop( self, table ) :
    """
    Drop table.
    """
    result = False
    with self._mutex :
      self.query( "DROP TABLE `" + self._table + "_" + table + "`", tuple() )
      self.mysqlDatabase.commit()
      result = ( self.sqlCursor.rowcount == 0 )

    return result

# Test code.
if __name__ == "__main__":

  import uuid
  import time
  import datetime
  import random
  import string

  TABLE_PRIFIX = "webUI"
  TEST_TABLE = "testTable"

  #----------------------------------------------------------------------------
  def comparePatient( a, b ) :
    del a[ "createTime" ]
    del a[ "modifiedTime" ]
    return ( a == b )

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

  #
  # $$$FUTURE - Test query functions.
  #

  #
  # Drop database table.
  # Checks `database.drop`.
  #
  assert( database.drop( TEST_TABLE ) == True )
