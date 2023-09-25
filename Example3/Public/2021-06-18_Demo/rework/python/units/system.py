#!/usr/bin/env python3
#==============================================================================
# Uses: Web-facing interface for system control/configuration.
# Date: 2020-03-30
#==============================================================================

class System :
  """
  $$$
  """
  #----------------------------------------------------------------------------
  def setMode( self, mode ) :
    pass

  #----------------------------------------------------------------------------
  def setTopology( self, areas, controllers, timestamp ) :
    if timestamp is not None :
      tables = self._database.getTables()
      table = tables[ "facility" ]
      records = table.readAll()
      record = records[ 0 ]
      table.update( record[ "id" ], { "topologyTimestamp" : timestamp } )

  #----------------------------------------------------------------------------
  def getTopology( self ) :
    return {
      "areas" : [],
      "controllers" : []
    }

  #----------------------------------------------------------------------------
  def __init__( self, database ) :
    self._database = database