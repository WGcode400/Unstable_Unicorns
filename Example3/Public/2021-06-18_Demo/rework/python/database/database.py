#!/usr/bin/env python3
#==============================================================================
# Uses: Interface to query database.
# Date: 2019-10-28
#==============================================================================
import mysql.connector
import threading
import json

from database.databaseConnection import DatabaseConnection
from database.crudnaf import CRUDNAF_Interface
from database.crudnafTable import CRUDNAF_Table
from webSocketAPI.notification import Notification

class Database( DatabaseConnection ) :
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
    DatabaseConnection.__init__( self, host, user, password, database, table )
    self.tableSetup()

  #----------------------------------------------------------------------------
  def tableSetup( self ) :
    self.sqlCursor.execute( "SHOW TABLES" )
    tables = self.sqlCursor.fetchall()

    self._tables = {}
    for item in tables :
      names = list( item.values() )
      tableName = names[ 0 ].replace( self._table + "_", "" )

      databaseTable = CRUDNAF_Table( self, self._table, tableName )
      self._tables[ tableName ] = databaseTable

    self.sqlCursor.execute( """SELECT VERSION() as data""" )
    row = self.sqlCursor.fetchone()
    if row is not None and "data" in row :
      self.mySQL_Version = row[ "data" ]
    else:
      self.mySQL_Version = None

  #----------------------------------------------------------------------------
  def getTables( self ) :
    return self._tables

  #----------------------------------------------------------------------------
  def getTable( self, name ) :
    return self._tables[ name ]

  #----------------------------------------------------------------------------
  def addTable( self, table, tableSetup ) :
    super().addTable( table, tableSetup )

    databaseTable = CRUDNAF_Table( self, self._table, table )
    self._tables[ table ] = databaseTable

  #----------------------------------------------------------------------------
  def getJSON_Table( self, tableName ) :
    """
    Load all configuration value.
    """

    rows = self.fetchQuery(
      "SELECT * FROM `" + self._table + "_" + tableName + "`",
      tuple()
    )

    results = {}
    for row in rows :
      id = row[ "id" ]
      jsonData = json.loads( row[ "data" ] )
      results[ id ] = jsonData

    return results

  #----------------------------------------------------------------------------
  def drop( self, table ) :
    """
    Drop table.
    """
    result = super().drop( table )

    if result :
      tableName = self._table + "_" + table
      eventData = {
        "type" : "drop",
        "data" : None
      }

      self._tables[ table ]._notification.signal( eventData, None )

    return result

  #----------------------------------------------------------------------------
  def countRows( self, table ) :
    self.sqlCursor.execute( "SELECT COUNT(*) as `count` FROM `" + table + "`" )
    row = self.sqlCursor.fetchone()
    if row is not None and "count" in row :
      count = row[ "count" ]
    else:
      count = None

    return count

  #============================================================================
  # Deprecated functions
  #============================================================================

  #----------------------------------------------------------------------------
  def getConfiguration( self, id ) :
    """
    Load configuration value.
    $$$DEP - Use configuration table instead.
    """
    with self._mutex :

      self.query(
        """
        SELECT `data`
        FROM `""" + self._table + """_config`
        WHERE id = %s
        """,
        ( id, )
      )

      row = self.sqlCursor.fetchone()
      if row is not None and "data" in row :
        results = json.loads( row[ "data" ] )
      else:
        results = None

    return results

  #----------------------------------------------------------------------------
  def setConfiguration( self, id, data ) :
    """
    Set configuration value.
    $$$DEP - Use configuration table instead.
    """

    result = False
    with self._mutex :
      data = json.dumps( data )
      self.query(
        """
        INSERT
        INTO `""" + self._table + """_config`
          ( `id`, `data` )
        VALUES
          ( %s, %s )
        ON DUPLICATE KEY UPDATE
          `data` = %s
        """,
        ( id, data, data )
      )

      self.mysqlDatabase.commit()
      result = ( self.sqlCursor.rowcount != 0 )

    return result

  #----------------------------------------------------------------------------
  def deleteConfiguration( self, id ) :
    """
    Set configuration value.
    $$$DEP - Use configuration table instead.
    """

    result = False
    with self._mutex :
      self.query(
        """
        DELETE
        FROM `""" + self._table + """_config`
        WHERE
          `id` = %s
        """,
        ( id, )
      )

      self.mysqlDatabase.commit()
      result = ( self.sqlCursor.rowcount != 0 )

    return result

  #----------------------------------------------------------------------------
  def flushConfiguration( self ) :
    """
    Clear all configuration values.
    $$$DEP - Use configuration table instead.
    """
    result = False
    with self._mutex :
      self.query( "TRUNCATE TABLE `" + self._table + "_config`", tuple() )

      self.mysqlDatabase.commit()
      result = ( self.sqlCursor.rowcount != 0 )

    return result
