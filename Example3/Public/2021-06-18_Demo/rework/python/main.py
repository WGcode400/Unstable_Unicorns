#!/usr/bin/env python3
#==============================================================================
# Uses: Server.
# Date: 2019-10-21
#==============================================================================

import signal
import sys
import os
import threading
import socket
import errno

from webSocketAPI.threadedHTTP_Server import ThreadedHTTP_Server
from webSocketAPI.threadedWebSocketServer import ThreadedWebSocketServer
from webSocketAPI.webDataSocket import WebDataSocket
from webSocketAPI.webDataClass import WebDataClass
from webSocketAPI.clientData import ClientData, ClientDataWeb

from database.database import Database
from setup.databaseConfiguration import DatabaseConfiguration
from setup.databaseTableSetup import DatabaseTableSetup
from setup.generateRecord import GenerateRecord

from units.version import Version
from units.parameters import Parameters
from units.system import System

#------------------------------------------------------------------------------
# $$$
#------------------------------------------------------------------------------
def main():

  print( "AQ WebSocket Demo Server" )

  # Command-line set parameters.
  parameters = Parameters()

  # Event for shutdown.
  shutdown = threading.Event()

  # $$$
  clientData = ClientData()

  # Web data for sharing information.
  webDataClass = WebDataClass()

  # Open connection to database.
  database = Database(
    parameters.host,
    parameters.user,
    parameters.password,
    parameters.database,
    parameters.table
  )

  #------------------------------------
  # Database setup.

  if parameters.isCreate :
    DatabaseTableSetup.create( database, parameters.table )

  if parameters.isInit :
    DatabaseTableSetup.setup( database )

  if parameters.isExit :
    sys.exit( 0 )

  #------------------------------------

  # Add the database interface, and all database tables.
  webDataClass.add( "database", database )
  for databaseTable in database.getTables().values() :
    tableName = databaseTable.getTableName()
    webDataClass.add( tableName, databaseTable )

    #generateRecord = GenerateRecord( database )
    #webDataClass.add( "generateRecord", generateRecord )

  clientDataWeb = ClientDataWeb( clientData )
  webDataClass.add( "clientData", clientDataWeb )

  # Software version.
  version = Version( database )
  webDataClass.add( "version", version )

  # System control and configuration.
  system = System( database )
  webDataClass.add( "system", system )

  # Set web data socket.
  webDataSocket = WebDataSocket( webDataClass, clientData ).get()

  if parameters.isListCommands :
    print( "WebSocket commands:" )
    for item in webDataClass.table.keys() :
      print( "\t", item )

  print( "\tVersion..:", version.serverVersion.getVersion() )
  print( "\tBuilt....:", version.serverVersion.getDate() )
  print( "\tHash.....:", version.serverVersion.getHash() )

  try :
    # Setup WebSocket connection.
    server = ThreadedWebSocketServer(
      shutdown,
      parameters.interface,
      parameters.websocketPort,
      webDataSocket
    )

    # Setup HTML server.
    httpd = ThreadedHTTP_Server(
      shutdown,
      parameters.interface,
      parameters.httpPort,
      "./web/"
    )
  except OSError as exception :
    if exception.errno == errno.EADDRINUSE :
      print( "Socket already in use." )
    elif exception.errno == errno.EACCES :
      print( "Unable to access listening port." )
    else :
      raise
    sys.exit( -1 )

  # Display listening IP address.
  with socket.socket( socket.AF_INET, socket.SOCK_DGRAM ) as addressSocket :
    # Open dummy connection so the local IP address used can be determined.
    addressSocket.connect( ( '8.8.8.8', 1 ) )
    local_ip_address = addressSocket.getsockname()[ 0 ]
    print( "Listening on: http://" + local_ip_address + ":" + str( parameters.httpPort ) + "/" )

  # Handler for shutdown signal.
  def signalHandler( _1, _2 ):
    print( "Shutting down" )
    shutdown.set()

  # Install shutdown signal handler.
  signal.signal( signal.SIGINT, signalHandler )

  # Suspect main thread until program has been requested to stop.
  print( "Running" )
  shutdown.wait()

  print( "Done" )

if __name__ == "__main__":
  main()
