###############################################################################
# Uses: Compute and update version information based on hash of file set.
# Date: 2016-05-13
###############################################################################

import json
import re
import os
import datetime
from libraries.hash import Hash

class VersionException( Exception ) :
  """
  Exception raised when there is a critical version mismatch.
  """
  pass

class Version :
  """
  Software version checking.

  Python (and other languages like Javascript) do not require compiling.  This
  prevents including a version number in the binary that reflects the program
  as a whole.  This system addresses the issue by using a version file that
  includes a hash.  The hash is of all the files that make a complete software
  package.  Should any file change, the hash changes.  This can be used to
  track versions.

  Version information is stored in a JSON file.  The version string is
  of the form <major>.<minor>.<build> where the major and minor fields are
  user define, but the build field is reserved for the build number.  This
  number increments each time the version is updated.

  Input:
    versionFileName - Name of version file.
    path - Path to data files.
    includeMask - Mask of all files to include in version hash.
    excludeMask - Mask of files to exclude in version hash.
    initialUpdate - True to force the version to update on creation.
    verify - True to force validation of version number.

  Raises:
    VersionException - If `verify` is set to True and the version hash does
      not match.
  """

  #-------------------------------------------------------------------
  def __init__(
    self,
    versionFileName,
    path=".",
    includeMask=".*",
    excludeMask="^$",
    initialUpdate=False,
    verify=False
  ) :

    self._fileName = os.path.abspath( versionFileName )
    self._path = os.path.abspath( path )
    self._includeMask = includeMask
    self._excludeMask = excludeMask
    self._computedHash = None
    self._isValid = False   # Isn't valid until checked.

    try :
      with open( versionFileName ) as inputFile :
        self._data = json.load( inputFile )
    except FileNotFoundError :
      self._data = {
        "string" : "0.0.0",
        "hash" : "",
        "date" : ""
      }

    if initialUpdate :
      self.update()

    if verify :
      self.verify( exception=True )

  #---------------------------------------------------------------------
  def update( self ) :
    """
    Update the version information.  Computes the hash and increments version
    number if has does not match.

    Returns:
      True if the version has changed, False if not.
    """
    hasChanged = not self.verify()
    if hasChanged :
      versionString = self._data[ "string" ]
      major, minor, build = versionString.split( "." )
      build = int( build ) + 1
      versionString = str( major ) + "." + str( minor ) + "." + str( build )
      self._data[ "string" ] = versionString
      self._data[ "hash"   ] = self._computedHash
      self._data[ "date"   ] = str( datetime.datetime.now() )
      self._isValid = True
      self.save()

    return hasChanged

  #---------------------------------------------------------------------
  def getHash( self ) :
    """
    Return the version hash.

    Returns:
      Hash value string for version.
    """
    return self._data[ "hash" ]

  #---------------------------------------------------------------------
  def getVersion( self ) :
    """
    Return version string.

    Returns:
      Version string in m.n.b (major, minor, build) notation.
    """
    return self._data[ "string" ]

  #---------------------------------------------------------------------
  def getDate( self ) :
    """
    Return the build timestamp.

    Returns:
      Build timestamp in yyyy-mm-dd hh:mm:ss.uuuuuu format.
    """
    return self._data[ "date" ]

  #---------------------------------------------------------------------
  def compute( self ) :
    """
    Compute a hash value for all files.

    Returns:
      Hash string value for version.
    """

    # Get a list of all the files.
    fileList = []
    for root, directoryNames, fileNames in os.walk( self._path ):
      for fileName in fileNames :
        if re.match( self._includeMask, fileName ) \
          and not re.match( self._excludeMask, fileName ) :
            fullName = os.path.join( root, fileName )
            fileList.append( fullName )

    # Sort the list.
    # This keeps file disk order from effecting the results.
    fileList.sort()

    hashValue = Hash()
    for fullName in fileList :
      with open( fullName, 'rb' ) as inputFile :
        buffer = inputFile.read()

        # Line-ending workaround.
        # Manually convert DOS-style carriage return/line feed into just
        # a line feed by removing the carriage return.
        # This fixes the fact the version control software can change
        # line ending types upon checkout which would otherwise cause a
        # different hash.
        buffer = buffer.replace( b"\r", b"" )

        hashValue += buffer

    # Turn hash into string.
    self._computedHash = str( hashValue )

    return self._computedHash

  #---------------------------------------------------------------------
  def verify( self, exception=False ) :
    """
    Check to see if the version information on disk matches the computed hash.

    Returns:
      True if the hash matches, False if not.
    """
    versionHash = self.compute()
    self._isValid = ( versionHash == self.getHash() )

    if exception and not self._isValid :
      raise VersionException()

    return self._isValid

  #---------------------------------------------------------------------
  def isValid( self ) :
    """
    Check to see if the version information is valid.

    Returns:
      True if the hash matches, False if not.

    Notes:
      Does not do any calculations, so 'verify' must be called at some point
      prior.  Otherwise, this function will return False.
    """
    return self._isValid

  #---------------------------------------------------------------------
  def save( self ) :
    """
    Write the version data to disk.
    """
    with open( self._fileName, "w" ) as outputFile :
      jsonData = json.dumps( self._data, indent=4 )
      outputFile.write( jsonData )
