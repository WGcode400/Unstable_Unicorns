#==============================================================================
# Uses: Software version
# Date: 2020-01-15
#==============================================================================

import libraries.version
from units.uuidNamespace import UUID_Namespace


from database.crudnaf import CRUDNAF_GenericObject, CRUDNAF_Class, CRUDNAF_ObjectInterface

class ClientVersion( CRUDNAF_ObjectInterface, libraries.version.Version ) :
  SERVER_VERSION_FILE = "serverVersion.json"
  WEB_VERSION_FILE = "clientVersion.json"

  # Controlled files.
  SERVER_FILES = ".*\.py$"
  WEB_FILES = ".*\.html$|.*\.css$|.*\.js$"

  #-------------------------------------------------------------------
  def __init__( self, *ignoredArray, **ignoredDict ) :
    """
    Establish software version and verify.

    Raises:
      VersionException - If version does not match.
    """
    #self.clientVersion = libraries.version.Version(
    libraries.version.Version.__init__(
      self,
      Version.WEB_VERSION_FILE,
      ".",
      includeMask=Version.WEB_FILES,
      initialUpdate=True,
      verify=True )
    CRUDNAF_ObjectInterface.__init__( self, dict() )

  def setTo( self, data ) :
    pass

  #-------------------------------------------------------------------
  def getId( *ignoredArray, **ignoredDict ) :
    return UUID_Namespace.getId( "clientVersion" )

  #-------------------------------------------------------------------
  def toDictionary( self ) :
    self.verify()
    return {
      "id"      : self.getId(),
      "_type"   : "ClientVersion",
      "string"  : self.getVersion(),
      "hash"    : self.getHash(),
      "date"    : self.getDate(),
      "isValid" : self.isValid()
    }

class ServerVersion( CRUDNAF_ObjectInterface, libraries.version.Version ) :

  #-------------------------------------------------------------------
  def __init__( self, *ignoredArray, **ignoredDict ) :

    #self.serverVersion = libraries.version.Version(
    libraries.version.Version.__init__(
      self,
      Version.SERVER_VERSION_FILE,
      ".",
      includeMask=Version.SERVER_FILES,
      initialUpdate=True,
      verify=True )
    CRUDNAF_ObjectInterface.__init__( self, dict() )

  #-------------------------------------------------------------------
  def setTo( self, data ) :
    pass

  #-------------------------------------------------------------------
  def getId( *ignoredArray, **ignoredDict ) :
    return UUID_Namespace.getId( "serverVersion" )

  #-------------------------------------------------------------------
  def toDictionary( self ) :
    return {
      "id"      : self.getId(),
      "_type"   : "ServerVersion",
      "string"  : self.getVersion(),
      "hash"    : self.getHash(),
      "date"    : self.getDate(),
      "isValid" : self.isValid()
    }



class Version( CRUDNAF_Class ) :
  """
  $$$
  """

  SERVER_VERSION_FILE = "serverVersion.json"
  WEB_VERSION_FILE = "clientVersion.json"

  # Controlled files.
  SERVER_FILES = ".*\.py$"
  WEB_FILES = ".*\.html$|.*\.css$|.*\.js$"

  def __init__( self, database ) :
    super().__init__( "version", CRUDNAF_GenericObject )

    mySQL_Version = "N/A"
    if database is not None :
      mySQL_Version = database.mySQL_Version

    self.databaseVersion = {
      "id" : UUID_Namespace.getId( "databaseVersion" ),
      "string" : mySQL_Version
    }
    self.create( self.databaseVersion )
    self.create( {}, ClientVersion )
    self.create( {}, ServerVersion )

    self.serverVersion = self.read( ServerVersion.getId() )
    self.clientVersion = self.read( ClientVersion.getId() )

  #-------------------------------------------------------------------
  def client( self ) :
    return self.clientVersion

  #-------------------------------------------------------------------
  def server( self ) :
    return self.serverVersion

  def all( self ) :
    return {
      "server" : self.serverVersion,
      "client" : self.clientVersion,
      "database" : self.databaseVersion
    }

  #-------------------------------------------------------------------
  def clientRecompute( self ) :
    self.clientVersion.update()

if __name__ == "__main__":

  import json

  #--------------------------------------------------------------------------
  def toDictionary( data ) :
    toDictionaryFunction = getattr( data, "toDictionary", None )
    if callable( toDictionaryFunction ):
      result = data.toDictionary()
    else :
      result = str( data )

    return result

  def printResult( data ) :
    jsonString = json.dumps( data, default=toDictionary, indent=2 )
    print( jsonString )

  class Database :
    def __init__( self ) :
      self.mySQL_Version = "1.0.0"
  #database = {
  #  "mySQL_Version" : "1.0.0"
  #}
  database = Database()

  version = Version( database )

  print( "\nAll:" )
  printResult( version.readAll() )

  print( "\nClient:" )
  id = ClientVersion.getId()
  printResult( version.read( id ) )
