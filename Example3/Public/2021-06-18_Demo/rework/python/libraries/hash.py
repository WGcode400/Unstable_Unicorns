###############################################################################
# Uses: Interface to make a hash out of data.
# Date: 2016-10-03
# Example:
#   hash = Hash()
#   hash += "String to hash"
#   hash += "An other string to hash"
#   print str( hash )
###############################################################################

import hashlib
import base64
import re

class Hash :

  # Selected hashing algorithm.
  ALGORITHM = hashlib.md5

  # Current system uses this format:
  FORMATS = {
  # Bits  Format
    8   : "nn",
    16  : "nn-nn",
    24  : "nn-nnn-n",
    32  : "nn-nnn-nnn",
    40  : "nn-nnn-nnnn-n",
    48  : "nn-nnn-nnnn-nnn",
    56  : "nn-nnn-nnnn-nnn-nn",
    64  : "nn-nnn-nnnn-nnn-nnnn",
    80  : "nn-nnn-nnnn-nnn-nnnnnn-nn",
    96  : "nn-nnn-nnnn-nnn-nnnnnn-nnnnnn",
    112 : "nn-nnn-nnnn-nnn-nnnnnn-nnnnnn-nnnn",
    128 : "nn-nnn-nnnn-nnn-nnnnnn-nnnnnn-nnnnnn-nn",
  }

  FORMAT = 32

  #-------------------------------------------------------------------
  @staticmethod
  def singleLine( line ) :
    """
    Return hash of a single line of data.

    Args:
      line: Line to be hashed.

    Returns:
      Hash string of line.
    """
    hash = Hash()
    hash += line
    return str( hash )

  #-------------------------------------------------------------------
  def __init__( self ) :
    """
    Constructor.
    """

    # Instance of hashing algorithm.
    self._hashValue = Hash.ALGORITHM()

  #-------------------------------------------------------------------
  def __add__( self, data ) :
    """
    Add data to hash.

    Args:
      data: String or binary data to add.

    Returns:
      Instance of self.

    Notes:
      Modifies internals by hash.
    """
    self._hashValue.update( data )
    return self

  #-------------------------------------------------------------------
  def __str__( self ) :
    """
    Convert hash to a string.

    Returns:
      String of hash.
    """
    hex = self._hashValue.hexdigest()

    #
    # Create a regular expression to produce the desired output format.
    #
    pattern = Hash.FORMATS[ Hash.FORMAT ]
    inPattern = r""
    outPattern = ""
    index = 1
    spacer = ""
    for segment in pattern.split( "-" ) :
      count = len( segment )
      inPattern  += r"(.{" + str( count ) + r"})"
      outPattern += spacer + "\\" + str( index )
      spacer = "-"
      index += 1

    inPattern += r".*"

    # Convert hash to formatted string.
    hexString = re.sub( inPattern, outPattern, hex ).upper()

    return hexString
