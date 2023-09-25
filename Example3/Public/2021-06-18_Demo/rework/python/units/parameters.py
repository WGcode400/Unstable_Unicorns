#==============================================================================
# Uses: Parameter's parser.
# Date: 2020-05-21
#==============================================================================
import argparse
from setup.databaseConfiguration import DatabaseConfiguration

class Parameters  :

  #----------------------------------------------------------------------------
  def __init__( self ) :
    # Command line arguments setup.
    self._parser = argparse.ArgumentParser()

    #
    # Startup
    #
    self._parser.add_argument(
      '--list-commands',
      '-l',
      dest='isListCommands',
      action='store_true',
      help='List the all registered WebSocket commands.'
    )

    #
    # Running parameters.
    #
    self._parser.add_argument(
      '--http-port',
      '-p',
      dest = 'httpPort',
      type=int,
      default = 8000,
      help='HTML port number to run server.'
    )

    self._parser.add_argument(
      '--interface',
      '-n',
      dest = 'interface',
      type=str,
      default = "0.0.0.0",
      help='Network interface to use.'
    )

    self._parser.add_argument(
      '--websocketPort',
      '-w',
      dest = 'websocketPort',
      type=int,
      default = 8001,
      help='WebSocket port number to run server.'
    )

    #
    # Database settings.
    #

    self._parser.add_argument(
      '--use-database',
      dest = 'useDatabase',
      action='store_true',
      help='Use a MySQL database.'
    )

    self._parser.add_argument(
      '--database',
      dest = 'database',
      type=str,
      default = DatabaseConfiguration.database,
      help='MySQL database to use.'
    )

    self._parser.add_argument(
      '--host',
      dest = 'host',
      type=str,
      default = DatabaseConfiguration.host,
      help='MySQL database host server.'
    )

    self._parser.add_argument(
      '--user',
      dest = 'user',
      type=str,
      default = DatabaseConfiguration.user,
      help='Database user.'
    )

    self._parser.add_argument(
      '--password',
      dest = 'password',
      type=str,
      default = DatabaseConfiguration.password,
      help='Database password.'
    )

    self._parser.add_argument(
      '--table',
      dest = 'table',
      type=str,
      default = DatabaseConfiguration.table,
      help='MySQL table to use.'
    )

    #
    # Setup functions.
    #

    self._parser.add_argument(
      '--create',
      dest = 'isCreate',
      action='store_true',
      help='Create database tables.'
    )

    self._parser.add_argument(
      '--init',
      dest = 'isInit',
      action='store_true',
      help='Initialize database tables.'
    )

    self._parser.add_argument(
      '--exit',
      dest = 'isExit',
      action='store_true',
      help='Exit after setup complete.'
    )

    self._arguments = vars( self._parser.parse_args() )

  #----------------------------------------------------------------------------
  def __getattr__( self, name ):
    return self._arguments[ name ]


if __name__ == "__main__":
  parameters = Parameters()

  print( parameters.httpPort )
  print( parameters.websocketPort )
  print( parameters.table )
