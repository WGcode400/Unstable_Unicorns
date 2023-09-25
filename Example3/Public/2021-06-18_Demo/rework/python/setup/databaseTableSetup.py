import json
import uuid
from database.database import Database
from setup.baseSetup import baseSetup

class DatabaseTableSetup :

  #----------------------------------------------------------------------------
  def create( database, table ) :
    database.query( "DROP TABLE IF EXISTS `" + table + "_config`", tuple() )
    database.query(
      """
      CREATE TABLE `""" + table + """_config`
      (
       `id`   tinytext  NOT NULL,
       `data` json      NOT NULL,
       PRIMARY KEY (`id`(32))
      )
      """,
      tuple()
    )

    database.query( "DROP TABLE IF EXISTS `" + table + "_patients`", tuple() )
    database.query(
      """
      CREATE TABLE `""" + table + """_patients`
      (
       `id`     tinytext  NOT NULL,
       `first`  text,
       `last`   text,
       `middle` text,
       `photo`  mediumtext,
       `room`   text,
       `tag`    int ,
       `notes`  text,
       `createTime`     datetime DEFAULT CURRENT_TIMESTAMP,
       `modifiedTime`   datetime default now() on update now(),
       `dischargedTime` datetime,
       PRIMARY KEY (`id`(32))
      )
      """,
      tuple()
    )

    # database.query( "DROP TABLE IF EXISTS `" + table + "_facility`", tuple() )
    # database.query(
    #   """
    #   CREATE TABLE `""" + table + """_facility`
    #   (
    #     `id` TINYTEXT NOT NULL ,
    #     `topologyTimestamp` DOUBLE NOT NULL ,
    #     PRIMARY KEY (`id`(32))
    #   )
    #   """,
    #   tuple()
    # )
    #
    # database.tableSetup()
    #
    # facility = {
    #   "id" : str( uuid.uuid4() ),
    #   "topologyTimestamp" : 0
    # }
    # tables = database.getTables()
    # print( tables[ "facility" ].create( facility ) )

  #----------------------------------------------------------------------------
  def setup( database, useUUID = False ) :
    baseSetup( database, useUUID )

  #----------------------------------------------------------------------------
  def setupTags( database ) :

    with open( "python/setup/tags.json", 'r' ) as inputFile :
      tagData = inputFile.read()
      tags = json.loads( tagData )
      database.setConfiguration( "tags", tags )
