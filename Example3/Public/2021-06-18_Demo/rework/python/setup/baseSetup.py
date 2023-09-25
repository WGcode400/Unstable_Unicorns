#!/usr/bin/env python3
#------------------------------------------------------------------------------
# Uses: Reset basic configuration.
# Date: 2019-12-19
#------------------------------------------------------------------------------
import json
import uuid

#------------------------------------------------------------------------------
def baseSetup( database, useUUID=False ) :

  # # Record ids are typically created by UUID, but to make tracing easier the id
  # # can be the field name.  Using True is how it is done in production.
  # useUUID = False

  # Path to image files.
  imagePath = 'web/images/setup/'

  # Root UUID namespace.
  # We use either a fixed namespace (which will always generate the same UUID
  # values), or a random namespace (always different UUID values each time run).
  #rootNamespace = uuid.UUID( int=0 )  # Fixed.
  rootNamespace = uuid.uuid4()       # Random.

  # UUID version 5 namespace.
  uuidNamespace = uuid.uuid5( rootNamespace, "ACU-500" )

  #------------------------------------------------------------------------------
  def getId( name, isShort = False ) :
    """
    Generate a unique id for field.  This is typically a UUID version 5, but
    to make it easier to debug it can also be a name.  Sometimes a short (8
    character) id is desired.
    """
    if useUUID :
      result = str( uuid.uuid5( uuidNamespace, name ) )

      if isShort :
        result = result[ 0:8 ]

    else :
      result = str( name )

    return result

  # Id fields.
  # These will be UUIDs in production, but can be any string for setup.
  mapA            = getId( "mapA"            )
  mapB            = getId( "mapB"            )

  areaA           = getId( "areaA"           )
  areaB           = getId( "areaB"           )

  doubleDoor      = getId( "doubleDoor"      )
  beacon          = getId( "beacon"          )
  stairs          = getId( "stairs"          )

  iconType0       = getId( "iconType0"       )
  iconType1       = getId( "iconType1"       )
  iconType2       = getId( "iconType2"       )

  view1           = getId( "view1"           )
  view2           = getId( "view2"           )
  view3           = getId( "view3"           )

  clientId1       = getId( "clientId1", True )
  clientId2       = getId( "clientId2", True )
  clientId3       = getId( "clientId3", True )

  doubleDoorIcon  = getId( "doubleDoorIcon"  )
  beaconIcon      = getId( "beaconIcon"      )
  stairsIcon      = getId( "stairsIcon"      )
  iconType1Icon   = getId( "iconType1Icon"   )

  womansHospitalMap  = getId( "womansHospitalMap"  )
  blackRiverFallsMap = getId( "blackRiverFallsMap" )

  #
  # SVG files.
  #

  mapFiles = {
    womansHospitalMap  : "WomansHospital.svg",
    blackRiverFallsMap : "BlackRiverFalls.svg",
  }

  iconFiles = {
    doubleDoorIcon : "doubleDoor.svg",
    beaconIcon     : "beacon.svg",
    stairsIcon     : "stairs.svg",
    iconType1Icon  : "zoneType1.svg",
  }

  #------------------------------------
  def idMap( data ) :
    # Add the id field (using the key) to each value.
    for [ key, value ] in data.items() :
      value[ "id" ] = key

    return data

  controllers = {
    getId( "Z1"  ) : { "address" :  1, "description" : "Z1" , "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z2"  ) : { "address" :  2, "description" : "Z2" , "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z3"  ) : { "address" :  3, "description" : "Z3" , "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z4"  ) : { "address" :  4, "description" : "Z4" , "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z5"  ) : { "address" :  5, "description" : "Z5" , "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z6"  ) : { "address" :  6, "description" : "Z6" , "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z7"  ) : { "address" :  7, "description" : "Z7" , "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z8"  ) : { "address" :  8, "description" : "Z8" , "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z9"  ) : { "address" :  9, "description" : "Z9" , "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z10" ) : { "address" : 10, "description" : "Z10", "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z11" ) : { "address" : 11, "description" : "Z11", "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z12" ) : { "address" : 12, "description" : "Z12", "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z13" ) : { "address" : 13, "description" : "Z13", "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z14" ) : { "address" : 14, "description" : "Z14", "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z15" ) : { "address" : 15, "description" : "Z15", "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z16" ) : { "address" : 16, "description" : "Z16", "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z17" ) : { "address" : 17, "description" : "Z17", "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z18" ) : { "address" : 18, "description" : "Z18", "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z19" ) : { "address" : 19, "description" : "Z19", "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z20" ) : { "address" : 20, "description" : "Z20", "areaId" : areaA, "receiverIds" : {}, "isTx": False, "isDoor": False },
    getId( "Z21" ) : { "address" : 21, "description" : "Z21", "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z22" ) : { "address" : 22, "description" : "Z22", "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z23" ) : { "address" : 23, "description" : "Z23", "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z24" ) : { "address" : 24, "description" : "Z24", "areaId" : areaA, "receiverIds" : {}, "isTx" : True, "isDoor" : True },

    getId( "Z30" ) : { "address" : 30, "description" : "Z30", "areaId" : areaB, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z32" ) : { "address" : 32, "description" : "Z32", "areaId" : areaB, "receiverIds" : {}, "isTx" : False,"isDoor" : False },
    getId( "Z34" ) : { "address" : 34, "description" : "Z34", "areaId" : areaB, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z35" ) : { "address" : 35, "description" : "Z35", "areaId" : areaB, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
    getId( "Z36" ) : { "address" : 36, "description" : "Z36", "areaId" : areaB, "receiverIds" : {}, "isTx" : True, "isDoor" : True },
  }

  # Receiver type, controller, and description.
  #   controllerId - Parent controller.
  #   channel - Which channel of parent controller (DIP 10 address).
  #   number - Number shown on legend. ($$$DEBUG - Fix this, not best way)
  #   type - Kind of receiver.
  #   description - Description of location.
  receivers = {
    # Receivers for `mapA`
    getId( "Z18.R0" ) : { "controllerId" : getId( "Z18" ), "channel" : 0, "number" : 1 , "type" : doubleDoor, "description" : "Main Entrance North" },
    getId( "Z19.R0" ) : { "controllerId" : getId( "Z19" ), "channel" : 0, "number" : 2 , "type" : doubleDoor, "description" : "Administrative Hallway Entrance" },
    getId( "Z20.R1" ) : { "controllerId" : getId( "Z20" ), "channel" : 1, "number" : 3 , "type" : beacon,     "description" : "Main Hallway / Nursery 1" },
    getId( "Z17.R0" ) : { "controllerId" : getId( "Z17" ), "channel" : 0, "number" : 4 , "type" : doubleDoor, "description" : "Atrium Entrance / Administration Hallway" },
    getId( "Z16.R0" ) : { "controllerId" : getId( "Z16" ), "channel" : 0, "number" : 5 , "type" : doubleDoor, "description" : "Postpartum Pod C and D Employee Lounge" },
    getId( "Z15.R0" ) : { "controllerId" : getId( "Z15" ), "channel" : 0, "number" : 6 , "type" : doubleDoor, "description" : "Postpartum Pod C Fire Exit" },
    getId( "Z13.R0" ) : { "controllerId" : getId( "Z13" ), "channel" : 0, "number" : 7 , "type" : doubleDoor, "description" : "Postpartum Atrium Fire Exit" },
    getId( "Z14.R0" ) : { "controllerId" : getId( "Z14" ), "channel" : 0, "number" : 8 , "type" : doubleDoor, "description" : "Postpartum Atrium Fire Exit 2" },
    getId( "Z10.R0" ) : { "controllerId" : getId( "Z10" ), "channel" : 0, "number" : 9 , "type" : stairs,     "description" : "Public Elevator Hallway Stairwell Entrance" },
    getId( "Z8.R1"  ) : { "controllerId" : getId( "Z8"  ), "channel" : 1, "number" : 10, "type" : beacon,     "description" : "Main Hallway / Nursery 2" },
    getId( "Z11.R0" ) : { "controllerId" : getId( "Z11" ), "channel" : 0, "number" : 11, "type" : doubleDoor, "description" : "Postpartum Pod A and B Employee Lounge" },
    getId( "Z12.R0" ) : { "controllerId" : getId( "Z12" ), "channel" : 0, "number" : 12, "type" : stairs,     "description" : "Postpartum Pod B Stairwell" },
    getId( "Z8.R0"  ) : { "controllerId" : getId( "Z8"  ), "channel" : 0, "number" : 13, "type" : doubleDoor, "description" : "Engineering Exit" },
    getId( "Z14.R3" ) : { "controllerId" : getId( "Z14" ), "channel" : 3, "number" : 14, "type" : beacon,     "description" : "Postpartum Pod D-1" },
    getId( "Z14.R4" ) : { "controllerId" : getId( "Z14" ), "channel" : 4, "number" : 15, "type" : beacon,     "description" : "Postpartum Pod D-2" },
    getId( "Z17.R1" ) : { "controllerId" : getId( "Z17" ), "channel" : 1, "number" : 16, "type" : beacon,     "description" : "Postpartum Pod D-4" },
    getId( "Z17.R2" ) : { "controllerId" : getId( "Z17" ), "channel" : 2, "number" : 17, "type" : beacon,     "description" : "Postpartum Pod D-3" },
    getId( "Z15.R2" ) : { "controllerId" : getId( "Z15" ), "channel" : 2, "number" : 18, "type" : beacon,     "description" : "Postpartum Pod C-1" },
    getId( "Z15.R1" ) : { "controllerId" : getId( "Z15" ), "channel" : 1, "number" : 19, "type" : beacon,     "description" : "Postpartum Pod C-2" },
    getId( "Z15.R4" ) : { "controllerId" : getId( "Z15" ), "channel" : 4, "number" : 20, "type" : beacon,     "description" : "Postpartum Pod C-4" },
    getId( "Z15.R3" ) : { "controllerId" : getId( "Z15" ), "channel" : 3, "number" : 21, "type" : beacon,     "description" : "Postpartum Pod C-3" },
    getId( "Z10.R3" ) : { "controllerId" : getId( "Z10" ), "channel" : 3, "number" : 22, "type" : beacon,     "description" : "Postpartum Pod A-1" },
    getId( "Z10.R4" ) : { "controllerId" : getId( "Z10" ), "channel" : 4, "number" : 23, "type" : beacon,     "description" : "Postpartum Pod A-2" },
    getId( "Z10.R1" ) : { "controllerId" : getId( "Z10" ), "channel" : 1, "number" : 24, "type" : beacon,     "description" : "Postpartum Pod A-4" },
    getId( "Z10.R2" ) : { "controllerId" : getId( "Z10" ), "channel" : 2, "number" : 25, "type" : beacon,     "description" : "Postpartum Pod A-3" },
    getId( "Z12.R2" ) : { "controllerId" : getId( "Z12" ), "channel" : 2, "number" : 26, "type" : beacon,     "description" : "Postpartum Pod B-1" },
    getId( "Z12.R1" ) : { "controllerId" : getId( "Z12" ), "channel" : 1, "number" : 27, "type" : beacon,     "description" : "Postpartum Pod B-2" },
    getId( "Z12.R4" ) : { "controllerId" : getId( "Z12" ), "channel" : 4, "number" : 28, "type" : beacon,     "description" : "Postpartum Pod B-4" },
    getId( "Z12.R3" ) : { "controllerId" : getId( "Z12" ), "channel" : 3, "number" : 29, "type" : beacon,     "description" : "Postpartum Pod B-3" },
    getId( "Z13.R2" ) : { "controllerId" : getId( "Z13" ), "channel" : 2, "number" : 30, "type" : beacon,     "description" : "Main Entrance North Family Waiting" },
    getId( "Z8.R2"  ) : { "controllerId" : getId( "Z8"  ), "channel" : 2, "number" : 31, "type" : beacon,     "description" : "Nursery Public Hallway" },
    getId( "Z1.R2"  ) : { "controllerId" : getId( "Z1"  ), "channel" : 2, "number" : 32, "type" : beacon,     "description" : "L&D Pod A Physicians' Entrance" },
    getId( "Z5.R0"  ) : { "controllerId" : getId( "Z5"  ), "channel" : 0, "number" : 33, "type" : doubleDoor, "description" : "NICU Fire Exit" },
    getId( "Z6.R0"  ) : { "controllerId" : getId( "Z6"  ), "channel" : 0, "number" : 34, "type" : stairs,     "description" : "NICU Stairwell" },
    getId( "Z7.R0"  ) : { "controllerId" : getId( "Z7"  ), "channel" : 0, "number" : 35, "type" : doubleDoor, "description" : "Radiology Hallway Exit Door" },
    getId( "Z3.R0"  ) : { "controllerId" : getId( "Z3"  ), "channel" : 0, "number" : 36, "type" : doubleDoor, "description" : "Triage L&D Entrance" },
    getId( "Z4.R0"  ) : { "controllerId" : getId( "Z4"  ), "channel" : 0, "number" : 37, "type" : stairs,     "description" : "NICU Hallway Stairwell Entrance" },
    getId( "Z6.R2"  ) : { "controllerId" : getId( "Z6"  ), "channel" : 2, "number" : 38, "type" : beacon,     "description" : "NICU Hallway" },
    getId( "Z6.R1"  ) : { "controllerId" : getId( "Z6"  ), "channel" : 1, "number" : 39, "type" : beacon,     "description" : "Recovery / NICU Hallway" },
    getId( "Z22.R0" ) : { "controllerId" : getId( "Z22" ), "channel" : 0, "number" : 40, "type" : doubleDoor, "description" : "Nursery Room #3 Entrance" },
    getId( "Z9.R2"  ) : { "controllerId" : getId( "Z9"  ), "channel" : 2, "number" : 41, "type" : beacon,     "description" : "Radiology Hallway" },
    getId( "Z20.R7" ) : { "controllerId" : getId( "Z20" ), "channel" : 7, "number" : 42, "type" : beacon,     "description" : "Recovery Dictation" },
    getId( "Z23.R0" ) : { "controllerId" : getId( "Z23" ), "channel" : 0, "number" : 43, "type" : doubleDoor, "description" : "Dining/Nursery Hallway Entrance" },
    getId( "Z20.R6" ) : { "controllerId" : getId( "Z20" ), "channel" : 6, "number" : 44, "type" : beacon,     "description" : "OR Pre-Op Entrance" },
    getId( "Z21.R0" ) : { "controllerId" : getId( "Z21" ), "channel" : 0, "number" : 45, "type" : doubleDoor, "description" : "Materials Management Entrance" },
    getId( "Z1.R3"  ) : { "controllerId" : getId( "Z1"  ), "channel" : 3, "number" : 46, "type" : beacon,     "description" : "L&D Pod A-1" },
    getId( "Z3.R5"  ) : { "controllerId" : getId( "Z3"  ), "channel" : 5, "number" : 47, "type" : beacon,     "description" : "L&D Pod A-2" },
    getId( "Z1.R4"  ) : { "controllerId" : getId( "Z1"  ), "channel" : 4, "number" : 48, "type" : beacon,     "description" : "L&D Pod A-4" },
    getId( "Z3.R4"  ) : { "controllerId" : getId( "Z3"  ), "channel" : 4, "number" : 49, "type" : beacon,     "description" : "L&D Pod A-3" },
    getId( "Z6.R3"  ) : { "controllerId" : getId( "Z6"  ), "channel" : 3, "number" : 50, "type" : beacon,     "description" : "NICU One" },
    getId( "Z6.R5"  ) : { "controllerId" : getId( "Z6"  ), "channel" : 5, "number" : 51, "type" : beacon,     "description" : "NICU Two" },
    getId( "Z6.R4"  ) : { "controllerId" : getId( "Z6"  ), "channel" : 4, "number" : 52, "type" : beacon,     "description" : "NICU Three" },
    getId( "Z3.R3"  ) : { "controllerId" : getId( "Z3"  ), "channel" : 3, "number" : 53, "type" : beacon,     "description" : "NICU Hallway at L&D" },
    getId( "Z3.R1"  ) : { "controllerId" : getId( "Z3"  ), "channel" : 1, "number" : 54, "type" : beacon,     "description" : "OR Entrance at L&D" },
    getId( "Z3.R2"  ) : { "controllerId" : getId( "Z3"  ), "channel" : 2, "number" : 55, "type" : beacon,     "description" : "OR Hallway Room #2" },
    getId( "Z18.R2" ) : { "controllerId" : getId( "Z18" ), "channel" : 2, "number" : 56, "type" : beacon,     "description" : "L&D Pod B-1" },
    getId( "Z18.R1" ) : { "controllerId" : getId( "Z18" ), "channel" : 1, "number" : 57, "type" : beacon,     "description" : "L&D Pod B-2" },
    getId( "Z18.R4" ) : { "controllerId" : getId( "Z18" ), "channel" : 4, "number" : 58, "type" : beacon,     "description" : "L&D Pod B-4" },
    getId( "Z18.R3" ) : { "controllerId" : getId( "Z18" ), "channel" : 3, "number" : 59, "type" : beacon,     "description" : "L&D Pod B-3" },
    getId( "Z20.R5" ) : { "controllerId" : getId( "Z20" ), "channel" : 5, "number" : 60, "type" : beacon,     "description" : "OR Room #4" },
    getId( "Z20.R4" ) : { "controllerId" : getId( "Z20" ), "channel" : 4, "number" : 61, "type" : beacon,     "description" : "OR Nurses' Station" },
    getId( "Z20.R3" ) : { "controllerId" : getId( "Z20" ), "channel" : 3, "number" : 62, "type" : beacon,     "description" : "Surgeons' Lounge" },
    getId( "Z20.R0" ) : { "controllerId" : getId( "Z20" ), "channel" : 0, "number" : 63, "type" : beacon,     "description" : "Nursery Staff Hallway" },
    getId( "Z9.R1"  ) : { "controllerId" : getId( "Z9"  ), "channel" : 1, "number" : 64, "type" : doubleDoor, "description" : "Radiology Outpatient Door" },
    getId( "Z9.R0"  ) : { "controllerId" : getId( "Z9"  ), "channel" : 0, "number" : 65, "type" : doubleDoor, "description" : "Recovery Outpatient Door" },
    getId( "Z9.R3"  ) : { "controllerId" : getId( "Z9"  ), "channel" : 3, "number" : 66, "type" : beacon,     "description" : "Recovery 1" },
    getId( "Z9.R4"  ) : { "controllerId" : getId( "Z9"  ), "channel" : 4, "number" : 67, "type" : doubleDoor, "description" : "Pre-Op Outpatient Entrance" },
    getId( "Z20.R8" ) : { "controllerId" : getId( "Z20" ), "channel" : 8, "number" : 68, "type" : beacon,     "description" : "Pre-Op Nurse Station" },
    getId( "Z8.R4"  ) : { "controllerId" : getId( "Z8"  ), "channel" : 4, "number" : 69, "type" : beacon,     "description" : "Housekeeping Hallway" },
    getId( "Z24.R0" ) : { "controllerId" : getId( "Z24" ), "channel" : 0, "number" : 70, "type" : doubleDoor, "description" : "Housekeeping Exit Door" },
    getId( "Z9.R5"  ) : { "controllerId" : getId( "Z9"  ), "channel" : 5, "number" : 71, "type" : doubleDoor, "description" : "Housekeeping Entrance" },
    getId( "Z8.R4"  ) : { "controllerId" : getId( "Z8"  ), "channel" : 4, "number" : 72, "type" : doubleDoor, "description" : "Kitchen Loading Dock" },
    getId( "Z8.R3"  ) : { "controllerId" : getId( "Z8"  ), "channel" : 3, "number" : 73, "type" : beacon,     "description" : "Materials Management" },
    getId( "Z1.R0"  ) : { "controllerId" : getId( "Z1"  ), "channel" : 0, "number" : 74, "type" : doubleDoor, "description" : "North Doctors Exit Door 44" },
    getId( "Z1.R1"  ) : { "controllerId" : getId( "Z1"  ), "channel" : 1, "number" : 75, "type" : beacon,     "description" : "POD C Nurse Station Antenna" },
    getId( "Z2.R0"  ) : { "controllerId" : getId( "Z2"  ), "channel" : 0, "number" : 76, "type" : doubleDoor, "description" : "South Doctors Exit Door 43" },

    # Receivers for `mapB`.
    getId( "Z30.R1" ) : { "controllerId" : getId( "Z30" ), "channel" : 1, "number" : 101, "type" : beacon,     "description" : "West hall" },
    getId( "Z34.R1" ) : { "controllerId" : getId( "Z34" ), "channel" : 1, "number" : 102, "type" : beacon,     "description" : "East hall" },
    getId( "Z32.R0" ) : { "controllerId" : getId( "Z32" ), "channel" : 0, "number" : 103, "type" : iconType1,  "description" : "Nurse sensor" },
    getId( "Z30.R0" ) : { "controllerId" : getId( "Z30" ), "channel" : 0, "number" : 104, "type" : doubleDoor, "description" : "West door" },
    getId( "Z34.R0" ) : { "controllerId" : getId( "Z34" ), "channel" : 0, "number" : 105, "type" : doubleDoor, "description" : "East door" },
    getId( "Z36.R0" ) : { "controllerId" : getId( "Z36" ), "channel" : 0, "number" : 106, "type" : doubleDoor, "description" : "Front West door" },
    getId( "Z35.R0" ) : { "controllerId" : getId( "Z35" ), "channel" : 0, "number" : 107, "type" : doubleDoor, "description" : "Front East door" },
  }

  # Map receivers to controllers.
  for receiverId, receiver in receivers.items() :
    controllerId = receiver[ "controllerId" ]
    channel = receiver[ "channel" ]

    controller = controllers[ controllerId ]

    receiverIds = controller[ "receiverIds" ]
    receiverIds[ channel ] = receiverId

  # Receivers located on `mapA`, their locations and labels.
  mapA_Receivers = {
    getId( "Z18.R0" ) : { "xCenter" : 919.2,   "yCenter" : 183.61, "labelRadius" : 30.956, "labelAngle" : 0.045 },
    getId( "Z19.R0" ) : { "xCenter" : 1008.01, "yCenter" : 224.45, "labelRadius" : 17.331, "labelAngle" : 0.233 },
    getId( "Z20.R1" ) : { "xCenter" : 916.33,  "yCenter" : 422.76, "labelRadius" : 33.909, "labelAngle" : 0.777 },
    getId( "Z17.R0" ) : { "xCenter" : 1031.04, "yCenter" : 255.56, "labelRadius" : 46.891, "labelAngle" : 0.824 },
    getId( "Z16.R0" ) : { "xCenter" : 1275.83, "yCenter" : 228.58, "labelRadius" : 16.770, "labelAngle" : 0.330 },
    getId( "Z15.R0" ) : { "xCenter" : 1490.52, "yCenter" : 236.33, "labelRadius" : 20.645, "labelAngle" : 0.563 },
    getId( "Z13.R0" ) : { "xCenter" : 1261.85, "yCenter" : 349.59, "labelRadius" : 30.980, "labelAngle" : 0.960 },
    getId( "Z14.R0" ) : { "xCenter" : 1288.92, "yCenter" : 349.59, "labelRadius" : 18.159, "labelAngle" : 0.570 },
    getId( "Z10.R0" ) : { "xCenter" : 997.56,  "yCenter" : 475.21, "labelRadius" : 37.492, "labelAngle" : 0.020 },
    getId( "Z8.R1"  ) : { "xCenter" : 900.98,  "yCenter" : 624.86, "labelRadius" : 38.537, "labelAngle" : 0.854 },
    getId( "Z11.R0" ) : { "xCenter" : 1276.58, "yCenter" : 468.3,  "labelRadius" : 33.461, "labelAngle" : 0.762 },
    getId( "Z12.R0" ) : { "xCenter" : 1490.52, "yCenter" : 462.86, "labelRadius" : 29.099, "labelAngle" : 0.364 },
    getId( "Z8.R0"  ) : { "xCenter" : 1027.72, "yCenter" : 670.87, "labelRadius" : 20.833, "labelAngle" : 0.143 },
    getId( "Z14.R3" ) : { "xCenter" : 1101.57, "yCenter" : 204.27, "labelRadius" : 15.325, "labelAngle" : 0.211 },
    getId( "Z14.R4" ) : { "xCenter" : 1153.81, "yCenter" : 204.27, "labelRadius" : 24.446, "labelAngle" : 0.104 },
    getId( "Z17.R1" ) : { "xCenter" : 1101.57, "yCenter" : 268.38, "labelRadius" : 29.546, "labelAngle" : 0.770 },
    getId( "Z17.R2" ) : { "xCenter" : 1153.81, "yCenter" : 268.38, "labelRadius" : 35.153, "labelAngle" : 0.843 },
    getId( "Z15.R2" ) : { "xCenter" : 1381.77, "yCenter" : 204.27, "labelRadius" : 15.080, "labelAngle" : 0.223 },
    getId( "Z15.R1" ) : { "xCenter" : 1434.01, "yCenter" : 204.27, "labelRadius" : 23.515, "labelAngle" : 0.109 },
    getId( "Z15.R4" ) : { "xCenter" : 1381.77, "yCenter" : 268.38, "labelRadius" : 29.419, "labelAngle" : 0.764 },
    getId( "Z15.R3" ) : { "xCenter" : 1434.01, "yCenter" : 268.38, "labelRadius" : 34.512, "labelAngle" : 0.839 },
    getId( "Z10.R3" ) : { "xCenter" : 1101.57, "yCenter" : 431.28, "labelRadius" : 13.036, "labelAngle" : 0.204 },
    getId( "Z10.R4" ) : { "xCenter" : 1153.81, "yCenter" : 431.28, "labelRadius" : 23.080, "labelAngle" : 0.091 },
    getId( "Z10.R1" ) : { "xCenter" : 1101.57, "yCenter" : 495.39, "labelRadius" : 31.902, "labelAngle" : 0.769 },
    getId( "Z10.R2" ) : { "xCenter" : 1153.81, "yCenter" : 495.39, "labelRadius" : 37.154, "labelAngle" : 0.837 },
    getId( "Z12.R2" ) : { "xCenter" : 1381.77, "yCenter" : 431.28, "labelRadius" : 12.746, "labelAngle" : 0.218 },
    getId( "Z12.R1" ) : { "xCenter" : 1434.01, "yCenter" : 431.28, "labelRadius" : 22.092, "labelAngle" : 0.096 },
    getId( "Z12.R4" ) : { "xCenter" : 1381.77, "yCenter" : 495.39, "labelRadius" : 31.784, "labelAngle" : 0.763 },
    getId( "Z12.R3" ) : { "xCenter" : 1434.01, "yCenter" : 495.39, "labelRadius" : 36.549, "labelAngle" : 0.833 },
    getId( "Z13.R2" ) : { "xCenter" : 919.2,   "yCenter" : 309.94, "labelRadius" : 23.222, "labelAngle" : 0.640 },
    getId( "Z8.R2"  ) : { "xCenter" : 915.87,  "yCenter" : 528.64, "labelRadius" : 44.770, "labelAngle" : 0.964 },
    getId( "Z1.R2"  ) : { "xCenter" : 388.22,  "yCenter" : 211.63, "labelRadius" : 17.788, "labelAngle" : 0.566 },
    getId( "Z5.R0"  ) : { "xCenter" : 394.18,  "yCenter" : 335.35, "labelRadius" : 17.093, "labelAngle" : 0.442 },
    getId( "Z6.R0"  ) : { "xCenter" : 385.16,  "yCenter" : 483.04, "labelRadius" : 62.227, "labelAngle" : 0.987 },
    getId( "Z7.R0"  ) : { "xCenter" : 401.76,  "yCenter" : 582.54, "labelRadius" : 43.729, "labelAngle" : 0.874 },
    getId( "Z3.R0"  ) : { "xCenter" : 618.58,  "yCenter" : 153.93, "labelRadius" : 21.104, "labelAngle" : 0.543 },
    getId( "Z4.R0"  ) : { "xCenter" : 610.74,  "yCenter" : 312.79, "labelRadius" : 28.170, "labelAngle" : 0.075 },
    getId( "Z6.R2"  ) : { "xCenter" : 611.96,  "yCenter" : 468.58, "labelRadius" : 40.834, "labelAngle" : 0.974 },
    getId( "Z6.R1"  ) : { "xCenter" : 538.57,  "yCenter" : 548.92, "labelRadius" : 16.658, "labelAngle" : 0.568 },
    getId( "Z22.R0" ) : { "xCenter" : 828.97,  "yCenter" : 380.7,  "labelRadius" : 39.290, "labelAngle" : 0.900 },
    getId( "Z9.R2"  ) : { "xCenter" : 411.13,  "yCenter" : 652.54, "labelRadius" : 37.475, "labelAngle" : 0.975 },
    getId( "Z20.R7" ) : { "xCenter" : 516.19,  "yCenter" : 652.54, "labelRadius" : 31.467, "labelAngle" : 0.820 },
    getId( "Z23.R0" ) : { "xCenter" : 821.84,  "yCenter" : 617.21, "labelRadius" : 35.486, "labelAngle" : 0.024 },
    getId( "Z20.R6" ) : { "xCenter" : 696.19,  "yCenter" : 668.77, "labelRadius" : 31.906, "labelAngle" : 0.818 },
    getId( "Z21.R0" ) : { "xCenter" : 989.24,  "yCenter" : 685.57, "labelRadius" : 43.449, "labelAngle" : 0.934 },
    getId( "Z1.R3"  ) : { "xCenter" : 457.58,  "yCenter" : 180.76, "labelRadius" : 18.790, "labelAngle" : 0.180 },
    getId( "Z3.R5"  ) : { "xCenter" : 509.82,  "yCenter" : 180.76, "labelRadius" : 24.400, "labelAngle" : 0.123 },
    getId( "Z1.R4"  ) : { "xCenter" : 457.58,  "yCenter" : 244.87, "labelRadius" : 33.142, "labelAngle" : 0.789 },
    getId( "Z3.R4"  ) : { "xCenter" : 509.82,  "yCenter" : 244.87, "labelRadius" : 36.615, "labelAngle" : 0.829 },
    getId( "Z6.R3"  ) : { "xCenter" : 394.18,  "yCenter" : 407.3,  "labelRadius" : 19.824, "labelAngle" : 0.650 },
    getId( "Z6.R5"  ) : { "xCenter" : 508.16,  "yCenter" : 365.27, "labelRadius" : 42.106, "labelAngle" : 0.945 },
    getId( "Z6.R4"  ) : { "xCenter" : 478.24,  "yCenter" : 459.3,  "labelRadius" : 17.341, "labelAngle" : 0.564 },
    getId( "Z3.R3"  ) : { "xCenter" : 618.58,  "yCenter" : 240.84, "labelRadius" : 37.401, "labelAngle" : 0.933 },
    getId( "Z3.R1"  ) : { "xCenter" : 694.09,  "yCenter" : 240.84, "labelRadius" : 43.875, "labelAngle" : 0.975 },
    getId( "Z3.R2"  ) : { "xCenter" : 694.09,  "yCenter" : 327.75, "labelRadius" : 46.725, "labelAngle" : 0.939 },
    getId( "Z18.R2" ) : { "xCenter" : 783.85,  "yCenter" : 180.76, "labelRadius" : 18.999, "labelAngle" : 0.176 },
    getId( "Z18.R1" ) : { "xCenter" : 836.09,  "yCenter" : 180.76, "labelRadius" : 24.745, "labelAngle" : 0.121 },
    getId( "Z18.R4" ) : { "xCenter" : 783.85,  "yCenter" : 244.87, "labelRadius" : 33.261, "labelAngle" : 0.791 },
    getId( "Z18.R3" ) : { "xCenter" : 836.09,  "yCenter" : 244.87, "labelRadius" : 36.846, "labelAngle" : 0.831 },
    getId( "Z20.R5" ) : { "xCenter" : 748.94,  "yCenter" : 372.39, "labelRadius" : 31.243, "labelAngle" : 0.813 },
    getId( "Z20.R4" ) : { "xCenter" : 697.65,  "yCenter" : 467.37, "labelRadius" : 43.838, "labelAngle" : 0.971 },
    getId( "Z20.R3" ) : { "xCenter" : 691.24,  "yCenter" : 572.8,  "labelRadius" : 40.105, "labelAngle" : 0.961 },
    getId( "Z20.R0" ) : { "xCenter" : 829.44,  "yCenter" : 528.64, "labelRadius" : 35.451, "labelAngle" : 0.023 },
    getId( "Z9.R1"  ) : { "xCenter" : 411.71,  "yCenter" : 738.87, "labelRadius" : 42.931, "labelAngle" : 0.916 },
    getId( "Z9.R0"  ) : { "xCenter" : 457.68,  "yCenter" : 778.85, "labelRadius" : 20.298, "labelAngle" : 0.676 },
    getId( "Z9.R3"  ) : { "xCenter" : 560.23,  "yCenter" : 752.97, "labelRadius" : 13.552, "labelAngle" : 0.576 },
    getId( "Z9.R4"  ) : { "xCenter" : 593.83,  "yCenter" : 842,    "labelRadius" : 29.675, "labelAngle" : 0.725 },
    getId( "Z20.R8" ) : { "xCenter" : 696.19,  "yCenter" : 803.96, "labelRadius" : 21.799, "labelAngle" : 0.117 },
    getId( "Z8.R4"  ) : { "xCenter" : 782.71,  "yCenter" : 752.97, "labelRadius" : 22.067, "labelAngle" : 0.643 },
    getId( "Z24.R0" ) : { "xCenter" : 771.66,  "yCenter" : 869.99, "labelRadius" : 58.295, "labelAngle" : 0.982 },
    getId( "Z9.R5"  ) : { "xCenter" : 783.07,  "yCenter" : 893.07, "labelRadius" : 29.372, "labelAngle" : 0.645 },
    getId( "Z8.R4"  ) : { "xCenter" : 881.47,  "yCenter" : 799.75, "labelRadius" : 37.780, "labelAngle" : 0.966 },
    getId( "Z8.R3"  ) : { "xCenter" : 958.07,  "yCenter" : 752.97, "labelRadius" : 32.028, "labelAngle" : 0.815 },
    getId( "Z1.R0"  ) : { "xCenter" : 316.85,  "yCenter" : 126.35, "labelRadius" : 31.420, "labelAngle" : 0.817 },
    getId( "Z1.R1"  ) : { "xCenter" : 315.22,  "yCenter" : 211.13, "labelRadius" : 36.610, "labelAngle" : 0.967 },
    getId( "Z2.R0"  ) : { "xCenter" : 316.35,  "yCenter" : 298.51, "labelRadius" : 19.709, "labelAngle" : 0.139 },
  }

  # Receivers located on `mapB`, their locations and labels.
  mapB_Receivers = {
    getId( "Z30.R1" ) : { "xCenter" : 280.4 , "yCenter" : 85.25 , "labelRadius" : 19.709, "labelAngle" : 0.139 },
    getId( "Z34.R1" ) : { "xCenter" : 768.18, "yCenter" : 85.25 , "labelRadius" : 19.709, "labelAngle" : 0.139 },
    getId( "Z32.R0" ) : { "xCenter" : 544.7 , "yCenter" : 52.10 , "labelRadius" : 19.709, "labelAngle" : 0.139 },
    getId( "Z30.R0" ) : { "xCenter" : 64.96 , "yCenter" : 68.00 , "labelRadius" : 19.709, "labelAngle" : 0.139 },
    getId( "Z34.R0" ) : { "xCenter" : 938.25, "yCenter" : 68.00 , "labelRadius" : 19.709, "labelAngle" : 0.139 },
    getId( "Z36.R0" ) : { "xCenter" : 615.87, "yCenter" : 174.32, "labelRadius" : 19.709, "labelAngle" : 0.139 },
    getId( "Z35.R0" ) : { "xCenter" : 437.99, "yCenter" : 170.01, "labelRadius" : 19.709, "labelAngle" : 0.139 },
  }

  # Event grouping.
  eventGroups = [
    { "id" : 0,  "receiver" : None, "event": 0,  "description" : "Tag Not Present"  , "severity" : 0, "action" : 1 },
    { "id" : 1,  "receiver" : None, "event": 1,  "description" : "Lost ZONE Comms"  , "severity" : 2, "action" : 0 },
    { "id" : 2,  "receiver" : None, "event": 2,  "description" : "Duplicate Receiver ID", "severity" : 2, "action" : 0 },
    { "id" : 3,  "receiver" : "*",  "event": 3,  "description" : "Exit Alarm"       , "severity" : 0, "action" : 1 },
    { "id" : 4,  "receiver" : "*",  "event": 4,  "description" : "Perimeter Alarm"  , "severity" : 0, "action" : 1 },
    { "id" : 5,  "receiver" : "*",  "event": 5,  "description" : "Door Ajar"        , "severity" : 2, "action" : 1 },
    { "id" : 6,  "receiver" : "*",  "event": 6,  "description" : "Loiter"           , "severity" : 1, "action" : 1 },
    { "id" : 7,  "receiver" : "*",  "event": 7,  "description" : "Band Alarm"       , "severity" : 0, "action" : 1 },
    { "id" : 8,  "receiver" : "*",  "event": 8,  "description" : "Band"             , "severity" : 0, "action" : 1 },
    { "id" : 9,  "receiver" : "*",  "event": 9,  "description" : "Lock Disabled"    , "severity" : 2, "action" : 0 },
    { "id" : 10, "receiver" : "*",  "event": 10, "description" : "Receiver Reset"       , "severity" : 2, "action" : 0 },
    { "id" : 11, "receiver" : "*",  "event": 11, "description" : "Battery Low"      , "severity" : 0, "action" : 0 },
    { "id" : 12, "receiver" : "*",  "event": 12, "description" : "Receiver Error"   , "severity" : 2, "action" : 0 },
    { "id" : 13, "receiver" : "*",  "event": 13, "description" : "Controller Reset" , "severity" : 2, "action" : 0 },
    { "id" : 14, "receiver" : "*",  "event": 14, "description" : "Low RTC Battery"  , "severity" : 2, "action" : 0 },
    { "id" : 15, "receiver" : "*",  "event": 15, "description" : "Tamper"           , "severity" : 2, "action" : 0 },

    { "id" : 16, "receiver" : 5,   "event": 7,  "description" : "Band Alarm"       , "severity" : 1, "action" : 1 },
    { "id" : 17, "receiver" : 5,   "event": 15, "description" : "Tamper"           , "severity" : 1, "action" : 0 },

    { "id" : 18, "receiver" : 6,   "event": 6,  "description" : "Loiter"           , "severity" : 1, "action" : 1 },
    { "id" : 19, "receiver" : 6,   "event": 7,  "description" : "Band Alarm"       , "severity" : 0, "action" : 1 },
    { "id" : 20, "receiver" : 6,   "event": 8,  "description" : "Band"             , "severity" : 0, "action" : 1 },
    { "id" : 21, "receiver" : 6,   "event": 9,  "description" : "Lock Disabled"    , "severity" : 2, "action" : 0 },
  ]

  # Areas are groups of receivers that operate independent of one another.
  areas = {
    areaA : { "description" : "Area A" },
    areaB : { "description" : "Area B" },
  }

  maps = {

      mapA : {
        "name"  : "Woman's Hospital at Renaissance",
        "image" : womansHospitalMap,
        "area"  : areaA,
        "receivers" : idMap( mapA_Receivers ),
        "iconSize" : 20,
        "fontSize" : 20,
      },

      mapB : {
        "name"  : "Black River Memorial Hospital",
        "image" : blackRiverFallsMap,
        "area"  : areaB,
        "receivers" : idMap( mapB_Receivers ),
        "iconSize" : 20,
        "fontSize" : 20,
      },
  }

  # View views.
  # An view defines a map, pan, zoom and rotation.  There is also a text
  # label to describe
  views = {
    view1 : {
      "mapId" : mapA,
      "label": "Main floor",
      "scale": 1,
      "xOffset": 0,
      "yOffset": 0,
      "rotation": 0
    },
    view2 : {
      "mapId" : mapA,
      "label": "Main floor - West wing",
      "scale": 1.9379719860697036,
      "xOffset": -498.2390564678734,
      "yOffset": -1538.0950605097564,
      "rotation": 90
    },
    view3 : {
      "mapId" : mapB,
      "label": "Building 2",
      "scale": 1,
      "xOffset": 0,
      "yOffset": 0,
      "rotation": 0
    },
  }

  clientViews = {
    clientId1 : {
      "name"  : "Nurse desk 1",
      "views" : [ view1, view2, view3 ]
    },
    clientId2 : {
      "name"  : "Nurse desk 2",
      "views" : [ view1 ]
    },
    clientId3 : {
      "name"  : "Security station",
      "views" : [ view3, view1 ]
    },
  }

  iconTypes = {
    doubleDoor  : { "icon" : doubleDoorIcon, "description": "Double doors"  },
    beacon      : { "icon" : beaconIcon,     "description": "Receiver"      },
    stairs      : { "icon" : stairsIcon,     "description": "Stair access"  },
    iconType1   : { "icon" : iconType1Icon,  "description": "Nurse station" },
  }

  # Global configuration.
  setup = {
    "facilityName" : "General Hospital Upstate Anytown Pediatrics Division",
    "defaultClient" : clientId1,
    "topologyTimestamp" : 0,
  }

  #------------------------------------
  def addConfiguration( id, data ) :
    #database.setConfiguration( id, data )
    data = json.dumps( data )
    database.query(
      """
      INSERT
      INTO `""" + database._table + """_config`
        ( `id`, `data` )
      VALUES
        ( %s, %s )
      ON DUPLICATE KEY UPDATE
        `data` = %s
      """,
      ( id, data, data )
    )

    database.mysqlDatabase.commit()
    result = ( database.sqlCursor.rowcount != 0 )

    return result


  #------------------------------------
  def addConfigurationWithId( id, data ) :
    """
    Same as `addConfiguration` but first modifies the data such that the
    `id` field of each child dictionary is set to the key of the parent.
    """

    idMap( data )
    addConfiguration( id, data )

  #------------------------------------
  def addFile( id, fileName ) :
    with open( fileName, 'r' ) as inputFile :
      data = inputFile.read()

    addConfiguration( id, data )

  #------------------------------------
  def addSVG( id, name ) :
    addFile( id, imagePath + name )

  #------------------------------------

  addConfiguration( "setup",        setup )
  addConfiguration( "eventGroups",  eventGroups )

  addConfigurationWithId( "iconTypes",    iconTypes )
  addConfigurationWithId( "controllers",  controllers )
  addConfigurationWithId( "receivers",        receivers )
  addConfigurationWithId( "areas",        areas )
  addConfigurationWithId( "maps",         maps )
  addConfigurationWithId( "views", views )
  addConfigurationWithId( "clientViews",  clientViews )

  # All all map file images.
  for key, value in mapFiles.items() :
    addSVG( key, value )

  # All receiver icon images.
  for key, value in iconFiles.items() :
    addSVG( key, value )
