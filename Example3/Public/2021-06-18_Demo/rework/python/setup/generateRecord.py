#==============================================================================
# Uses: Generate record.
# Date: 2021-05-22
#==============================================================================
import uuid
import random
from demo.randomName import RandomName
import demo.images as images

class GenerateRecord :

  #----------------------------------------------------------------------------
  def __init__( self, database ) :

    self._databaseTable = database.getTable( "records" )
    self._maleIndex   = 0
    self._femaleIndex = 0

    random.shuffle( images.FEMALE_IMAGES )
    random.shuffle( images.MALE_IMAGES )
    #self.imageSets = [
    #  images.MALE_IMAGES,
    #  images.FEMALE_IMAGES
    #]

  #----------------------------------------------------------------------------
  def _count( self ) :
    pass

  #----------------------------------------------------------------------------
  def add( self, number=1 ) :

    count = self._databaseTable.count()

    for _ in range( number ) :
      isFemale = bool( random.getrandbits( 1 ) )
      if isFemale :
        image = images.FEMALE_IMAGES[ self._femaleIndex ]
        self._femaleIndex += 1
        if self._femaleIndex >= len( images.FEMALE_IMAGES ) :
          random.shuffle( images.FEMALE_IMAGES )
          self._femaleIndex = 0
      else:
        image = images.MALE_IMAGES[ self._maleIndex ]
        self._maleIndex += 1
        if self._maleIndex >= len( images.MALE_IMAGES ) :
          random.shuffle( images.MALE_IMAGES )
          self._maleIndex = 0

      name = RandomName.fullName( isFemale )
      state = RandomName.state()
      record = {
        "id"        : str( uuid.uuid4() ),
        "order"     : count,
        "first"     : name[ 0 ],
        "middle"    : name[ 1 ],
        "last"      : name[ 2 ],
        "address"   : RandomName.streetName( state ),
        "city"      : RandomName.city(),
        "state"     : state,
        "homePhone" : RandomName.phoneNumber( state ),
        "cellPhone" : RandomName.phoneNumber( state ),
        "workPhone" : RandomName.phoneNumber( state ),
        "notes"     : RandomName.paragraph( max=3 ),
        "photo"     : image
      }

      count += 1

      self._databaseTable.create( record )
