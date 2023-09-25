//-----------------------------------------------------------------------------
// Uses: Class for base configuration.
// Date: 2019-10-30
//-----------------------------------------------------------------------------

"use strict"

define(
[
  //"units/tag",
  //"units/patient",
  //"units/event",
  "units/controller",
  "units/receiver",
  "units/deltaRecordSet",
],
function
(
  //Tag,
  //Patient,
  //Event,
  Controller,
  Receiver,
  DeltaRecordSet,
)
{
  return class System
  {
    // All the loadable fields in configuration.
    // Note that assets are not in this list as they are loaded on demand.
    static get LoadFields()
    {
      return Object.freeze
      (
        [
          "areas",
          "controllers",
          "setup",
          "receivers",
          "iconTypes",
          "maps",
          "views",
          "clientViews",
          "topologyTimestamp",
        ]
      )
    }

    static get ConfigurationFields()
    {
      return Object.freeze
      (
        [
          "areas",
          "controllers",
          "setup",
          "receivers",
          "iconTypes",
          "maps",
          "views",
          "clientViews"
        ]
      )
    }

    // All the fields relating to topology.
    static get TopologyFields()
    {
      return Object.freeze
      (
        [
          "areas",
          "controllers",
          "receivers"
        ]
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get a controller by the address number.
    // Input:
    //   address - Address number.
    // Output:
    //   A controller record or `null` if requested controller is not found.
    //-------------------------------------------------------------------------
    controllerByAddress( address )
    {
      var result = null
      for ( const controller of Object.values( this.controllers ) )
        if ( address == controller.address )
          result = controller

      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get a receiver by receiver number.
    // Input:
    //   number - Receiver number.
    // Output:
    //   A receiver record or `null` if requested receiver number is not found.
    //-------------------------------------------------------------------------
    receiverByNumber( number )
    {
      var result = null
      for ( const receiver of Object.values( this.receivers ) )
        if ( number == receiver.number )
          result = receiver

      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the parent controller for specified receiver.
    // Input:
    //   receiver - Instance of `Receiver`.
    // Output:
    //   Instance of `Controller`.
    //-------------------------------------------------------------------------
    getReceiverController( receiver )
    {
      const controllerName = receiver.getControllerName()
      return this.controllers[ controllerName ]
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Flush the entire configuration.
    //-------------------------------------------------------------------------
    flush()
    {
      this.areas        = {}
      this.controllers  = {}
      this.setup        = {}
      this.receivers    = {}
      this.iconTypes    = {}
      this.maps         = {}
      this.views        = {}
      this.clientViews  = {}
      this.svgFiles     = {}
      this.topologyTimestamp = 0
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Make a set of classes from a set of objects and store in
    //   configuration.
    // Input:
    //   objects - Source objects used to create new instances.
    //   classType - The class to create with object data.
    //   keyField - The key to be used for indexing.  Defaults to "id".
    // Output:
    //   Set of class instances constructed from data.
    // Example:
    //   Input:
    //     input =
    //     {
    //       123: { id: 123, id2: 234, value: 10 },
    //       124: { id: 124, id2: 345, value: 20 },
    //       125: { id: 125, id2: 456, value: 30 }
    //     }
    //   Call:
    //     _classFromObject( input, OutputObject, "id2" )
    //   Returns:
    //     {
    //       234: new OutputObject( { id: 123, id2: 234, value: 10 } ),
    //       345: new OutputObject( { id: 124, id2: 345, value: 20 } ),
    //       456: new OutputObject( { id: 125, id2: 456, value: 30 } )
    //     }
    //-------------------------------------------------------------------------
    _classFromObject( objects, classType, keyField )
    {
      if ( undefined == keyField )
        keyField = "id"

      const classSet = {}
      for ( var item of Object.values( objects ) )
      {
        const key = item[ keyField ]
        classSet[ key ] = new classType( item )
      }
      return classSet
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Set the function to run if a configuration reload is requested.
    //   Should be called only once form a high-level function.
    // Input:
    //   callback - Function that will reload recreate configuration.
    //-------------------------------------------------------------------------
    setReload( callback )
    {
      this.reloadFunction = callback
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Request the entire configuration be reloaded.
    //   Done if configuration changes form external source.
    //-------------------------------------------------------------------------
    reload()
    {
      if ( this.reloadFunction )
        this.reloadFunction()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Update data structure from old system to current.
    // Input:
    //   data - Object with configuration data.
    // Output:
    //   `data` is modified.
    //-------------------------------------------------------------------------
    _portData( data )
    {
      // $$$DEBUG - Patch for older versions.
      if ( "orientations" in data )
      {
        console.log( "Old views" )
        data.views = data.orientations
        delete data.orientations
      }

      if ( "zones" in data )
      {
        console.log( "Old receivers" )
        data.receivers = data.zones
        delete data.zones

        for ( const map of Object.values( data.maps ) )
          if ( "zones" in map )
          {
            console.log( "Remap map", map.id )
            map.receivers = map.zones
            delete map.zones
          }
      }

      if ( "zoneTypes" in data )
      {
        console.log( "Old icon types" )
        data.iconTypes = data.zoneTypes
        delete data.zoneTypes
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Load entire configuration from a data object.
    // Input:
    //   data - Object with configuration data.
    // Notes:
    //   Loads as much data as the data object holds.  Unmentioned data is
    //   unchanged.
    //-------------------------------------------------------------------------
    loadFromData( data, timestamp = false )
    {
      // $$$ this._portData( data )

      if ( data.areas )
        this.areas = data.areas

      if ( data.controllers )
        this.controllers = this._classFromObject( data.controllers, Controller )

      if ( data.setup )
        this.setup = data.setup

      if ( data.receivers )
        this.receivers = this._classFromObject( data.receivers, Receiver )

      if ( data.iconTypes )
        this.iconTypes = data.iconTypes

      if ( data.maps )
        this.maps = data.maps

      if ( data.views )
        this.views = data.views

      if ( data.clientViews )
        this.clientViews  = data.clientViews

      if ( data.svgFiles )
        this.svgFiles = data.svgFiles

      if ( data.topologyTimestamp )
        this.topologyTimestamp = data.topologyTimestamp

      if ( timestamp )
        this.topologyTimestamp = Date.now() / 1000
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   The configuration needs a dictionary of SVG files for both the maps
    //   and map icons.
    //-------------------------------------------------------------------------
    _setupSVG_Configuration( data )
    {
      // Need to make a collection of SVG files.
      // SVG files come from two locations: maps and icons
      this.svgFiles = {}

      // Add each map file.
      for ( const [ mapId, map ] of Object.entries( this.maps ) )
        this.svgFiles[ map.image ] = data[ map.image ]

      // Add a request for each of the icon type icons.
      for ( const iconType in this.iconTypes )
      {
        const icon = this.iconTypes[ iconType ]
        this.svgFiles[ icon.icon ] = data[ icon.icon ]
      }
    }

    // $$$DEP //-------------------------------------------------------------------------
    // $$$DEP // Uses:
    // $$$DEP //   Load all SVG files for given configuration.
    // $$$DEP // Input:
    // $$$DEP //   _accutechAPI - Instance of `AccutechAPI`.
    // $$$DEP //   callback - Callback to run after loading.
    // $$$DEP // Output:
    // $$$DEP //   jQuery `Deferred` object.
    // $$$DEP //-------------------------------------------------------------------------
    // $$$DEP _loadAssets( callback )
    // $$$DEP {
    // $$$DEP   const assets = []
    // $$$DEP
    // $$$DEP   // Add each map file.
    // $$$DEP   for ( const [ mapId, map ] of Object.entries( this.maps ) )
    // $$$DEP     assets.push( map.image )
    // $$$DEP
    // $$$DEP   // Add a request for each of the icon type icons.
    // $$$DEP   for ( const iconType in this.iconTypes )
    // $$$DEP   {
    // $$$DEP     const icon = this.iconTypes[ iconType ]
    // $$$DEP     assets.push( icon.icon )
    // $$$DEP   }
    // $$$DEP
    // $$$DEP   const self = this
    // $$$DEP   return this._accutechAPI.loadMultipleConfiguration
    // $$$DEP   (
    // $$$DEP     assets,
    // $$$DEP     function( svgData )
    // $$$DEP     {
    // $$$DEP       // Store SVG files.
    // $$$DEP       self.svgFiles = {}
    // $$$DEP       for ( const [ assetId, svg ] of Object.entries( svgData ) )
    // $$$DEP         self.svgFiles[ assetId ] = svg
    // $$$DEP
    // $$$DEP       if ( callback )
    // $$$DEP         callback()
    // $$$DEP     }
    // $$$DEP   )
    // $$$DEP }

    //-------------------------------------------------------------------------
    // Uses:
    //   Save a specific configuration item.
    // Input:
    //   item - Name of item to be saved.
    //   callback - Callback to run after save finishes.
    // Output:
    //   jQuery `Deferred` object.
    //-------------------------------------------------------------------------
    saveItem( item, callback = null )
    {
      return this.saveItems( [ item ], callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Save specified configuration items.
    // Input:
    //   items - Array of the name of items to be saved.
    //   callback - Callback to run after save finishes.
    // Output:
    //   jQuery `Deferred` object.
    //-------------------------------------------------------------------------
    saveItems( items, callback = null )
    {
      this.topologyTimestamp = Date.now() / 1000

      var updateTimestamp = false

      // Create object set with the items to be saved with key as item name
      // and value as the item's data.
      const itemsSet = {}
      for ( const item of items )
      {
        itemsSet[ item ] = $.removePrivate( this[ item ] )
        if ( System.TopologyFields.includes( item ) )
          updateTimestamp = true
      }

      if ( updateTimestamp )
        itemsSet[ "topologyTimestamp" ] = this.topologyTimestamp

      return this._accutechAPI.saveMultiple( itemsSet, callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Save entire configuration, including assets.
    // Input:
    //   callback - Callback to run after save finishes.
    // Output:
    //   jQuery `Deferred` object.
    //-------------------------------------------------------------------------
    saveAll( callback = null )
    {
      const requests = {}

      // Set all configuration fields.
      for ( const field of System.LoadFields )
        requests[ field ] = $.removePrivate( this[ field ] )

      // Add each SVG image.
      for ( const [ id, data ] of Object.entries( this.svgFiles ) )
        requests[ id ] = data

      return this._accutechAPI.saveMultipleConfiguration( requests, callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Validate configuration and remove orphaned items.
    // Output:
    //   True if errors have been found, false it not.
    //-------------------------------------------------------------------------
    validate()
    {
      // $$$ console.log( JSON.parse( JSON.stringify( this ) ) )

      var haveErrorsBeenFound = false
      for ( const controller of Object.values( this.controllers ) )
        if ( ! ( controller.areaId in this.areas ) )
        {
          console.log( "Removed controller", controller.id, "for non-exist area", controller.areaId )
          delete this.controllers[ controller.id ]
          haveErrorsBeenFound = true
        }

      // Remove receivers that do not have a valid controller.
      for ( const receiver of Object.values( this.receivers ) )
        if ( ! ( receiver.controllerId in this.controllers ) )
        {
          console.log( "Removed receiver", zone.id, "for non-existent controller", zone.controllerId )
          delete this.receivers[ receiver.id ]
          haveErrorsBeenFound = true
        }

      // Search for non-existent receivers in controller list.
      for ( const controller of Object.values( this.controllers ) )
      {
        for ( const [ key, receiverId ] of Object.entries( controller.receiverIds ) )
          if ( ! ( receiverId in this.receivers ) )
          {
            console.log( "Removed receiver", receiverId, "form controller", controller.id )
            delete controller.receiverIds[ key ]
            haveErrorsBeenFound = true
          }
      }

      // Remove any non-existant receivers from maps.
      for ( const map of Object.values( this.maps ) )
      {
        // $$$ // $$$DEBUG - Port zones to receivers.
        // $$$ if ( "zones" in map )
        // $$$ {
        // $$$   console.log( "Old map zones moved.", map.id )
        // $$$   map.receivers = map.zones
        // $$$ }

        // $$$DEBUG - Remove.
        if ( "zones" in map )
          map.receivers = map.zones

        for ( const receiverId of Object.keys( map.receivers ) )
          if ( ! ( receiverId in this.receivers ) )
          {
            console.log( "Removed receiver", receiverId, "from map", map.id )
            delete map.receivers[ receiverId ]
            haveErrorsBeenFound = true
          }
      }

      // Check to make sure all views have a map.
      for ( const view of Object.values( this.views ) )
      {
        if ( ! ( view.mapId in this.maps ) )
        {
          console.log( "Removed view", view.mapId, "from client view", view )
          delete this.views[ view.id ]
          haveErrorsBeenFound = true
        }
      }

      // Check to make sure all client views have views that exist.
      for ( const clientView of Object.values( this.clientViews ) )
      {
        // Make copy of array.
        // We cannot modify the array we are iterating over without causing
        // problems.
        const viewList = clientView.views.slice()

        for ( const viewId of viewList )
        {
          if ( ! ( viewId in this.views ) )
          {
            console.log( "Removed view", viewId, "from client view", clientView.id )

            const removeIndex = clientView.views.indexOf( viewId );
            if ( removeIndex > -1 )
              clientView.views.splice( removeIndex, 1 )

            // $$$ delete clientView.views[ viewId ]
            haveErrorsBeenFound = true
          }
        }
      }

      return haveErrorsBeenFound
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Make the current topology active.
    // Input:
    //   callback - Callback to run after complete.
    //   bringOnline - True if the control system should begin operation
    //     after the topology is loaded (true by default).
    //-------------------------------------------------------------------------
    commitTopology( callback, bringOnline=true )
    {
      // Make a list of all the area ids.
      const areas = []
      for ( const area of Object.values( this.areas ) )
        areas.push( area.id )

      // Make a list of all the controllers and their receivers.
      const controllers = []
      for ( const controller of Object.values( this.controllers ) )
      {
        // Start a new controller record.
        // This is a truncated version of the configuration record.
        const controllerRecord =
        {
          id : controller.id,
          number : controller.address,
          areaId : controller.areaId,
          isTx : controller.isTx,
          isDoor : controller.isDoor,
          receivers : [],
        }

        // Make a list of receivers assigned to this controller.
        // The receivers list is keyed by channel number.
        for ( const [ channel, receiverId ] of Object.entries( controller.receiverIds ) )
        {
          // New record for receiver.
          const receiverRecord =
          {
            id : receiverId,
            channel : channel
          }

          // Add this record to receiver list.
          controllerRecord.receivers.push( receiverRecord )
        }

        // Add this record to controller list.
        controllers.push( controllerRecord )
      }

      const timestamp = this.topologyTimestamp
      this._accutechAPI.commitTopology
      (
        areas,
        controllers,
        this.topologyTimestamp,
        callback,
        bringOnline
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the assigned area for a controller.
    // Input:
    //   controllerId - The controller id to use.
    // Output:
    //   Instance of `Area` or null if the controller doesn't exist.
    //-------------------------------------------------------------------------
    getControllerArea( controllerId )
    {
      var result
      const controller = this.controllers[ controllerId ]
      if ( controller )
        result = this.areas[ controller.areaId ]

      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get all the controllers in the given area.
    // Input:
    //   areaId - The area id to use.
    // Output:
    //   Array of `Controller`.
    //-------------------------------------------------------------------------
    getAreaControllers( areaId )
    {
      var result = []
      for ( const controller of Object.values( this.controllers ) )
        if ( areaId == controller.areaId )
          result.push( controller )

      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the assigned controller for a receiver.
    // Input:
    //   receiverId - The receiver id to use.
    // Output:
    //   Instance of `Controller` or null if the receiver doesn't exist.
    //-------------------------------------------------------------------------
    getReceiverController( receiverId )
    {
      var result
      const receiver = this.receivers[ receiverId ]
      if ( receiver )
        result = this.controllers[ receiver.controllerId ]

      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the assigned area for a receiver.
    // Input:
    //   receiverId - The receiver id to use.
    // Output:
    //   Instance of `Area` or null if the receiver doesn't exist.
    //-------------------------------------------------------------------------
    getReceiverArea( receiverId )
    {
      var result
      const controller = this.getReceiverController( receiverId )
      if ( controller )
        result = getControllerArea( controller.id )

      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Will remove a receiver controller and all associated receivers.
    // Input:
    //   controllerId - Controller to remove.
    // Note:
    //   Changes to "receivers" and "controllers" are not saved.
    //-------------------------------------------------------------------------
    deleteController( controllerId )
    {
      // Get requested controller.
      const controller = this.controllers[ controllerId ]

      // Remove any connected receivers records.
      for ( const receiverId of Object.values( controller.receiverIds ) )
        delete this.receivers[ receiverId ]

      // Delete controller record.
      delete this.controllers[ controllerId ]
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Will remove an area and all associated receiver controller and receivers.
    // Input:
    //   areaId - Area to remove.
    // Note:
    //   Changes to "areas", "receivers" and "controllers" are not saved.
    //-------------------------------------------------------------------------
    deleteArea( areaId )
    {
      // Get list of controllers for this area.
      const controllers = this.getAreaControllers( areaId )

      // Remove all controllers in this area.
      for ( const controller of controllers )
        this.deleteController( controller.id )

      // Delete area record.
      delete this.areas[ areaId ]
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Find a patient record by assigned tag.
    // Input:
    //   tagNumber - Tag number being searched for.
    // Output:
    //   Instance of `Patient`, or `null` if no patient is assigned this
    //   tag.
    //-------------------------------------------------------------------------
    patientByTag( tagNumber )
    {
      var result = null
      for ( const patient of Object.values( this.patients ) )
        if ( patient.tag == tagNumber )
          result = patient

      return result
    }

    // $$$ //-------------------------------------------------------------------------
    // $$$ // Uses:
    // $$$ //   Create CRUDNAF object.
    // $$$ // Input:
    // $$$ //   name - Name of object set.
    // $$$ //   classType - Class that should be created for new object.
    // $$$ // Notes:
    // $$$ //   Creates three objects:
    // $$$ //     this[ name ] - Object set of instances.
    // $$$ //     this.crud[ name ] - The CRUD interface to the objects.
    // $$$ //     this.deltaSet[ name ] - Deltaset for Objects.
    // $$$ //-------------------------------------------------------------------------
    // $$$ _makeCRUDNAF_DeltaSet( name, classType )
    // $$$ {
    // $$$   const crudnafObject = this._accutechAPI[ name ]
    // $$$
    // $$$   this.crud[ name ] = crudnafObject
    // $$$   this.deltaSets[ name ] = new DeltaRecordSet
    // $$$   (
    // $$$     $.proxy( crudnafObject.notification, crudnafObject ),
    // $$$     $.proxy( crudnafObject.readAll,      crudnafObject ),
    // $$$     classType,
    // $$$     crudnafObject
    // $$$   )
    // $$$
    // $$$   this[ name ] = this.deltaSets[ name ].getRecords()
    // $$$ }

    //-------------------------------------------------------------------------
    // Uses:
    //   Object with complete configuration.
    //-------------------------------------------------------------------------
    constructor( accutechAPI, data/*, clientId, callback*/ )
    {
      this._accutechAPI = accutechAPI
      //$$$ this.clientId = clientId

      this.flush()

      // $$$ const self = this
      // $$$ this._accutechAPI.loadMultipleConfiguration
      // $$$ (
      // $$$   System.LoadFields,
      // $$$   function( results )
      // $$$   {
      // $$$     // Use this data.
      // $$$     self.loadFromData( results )
      // $$$
      // $$$     self.validate()
      // $$$
      // $$$     // We now have a list of the assets, so those can be loaded.
      // $$$     self._loadAssets( callback )
      // $$$   }
      // $$$ )

      this.loadFromData( data )
      this.validate()
      this._setupSVG_Configuration( data )

      this.deltaSets = {}
      // $$$ this.crud = {}

      // Fake the facility data.
      this.facility = { 0: { topologyTimestamp: 0 } }
      this.deltaSets.facility = {}
      this.deltaSets.facility.onUpdate = function() {}

      console.log( this )

      // $$$ this._makeCRUDNAF_DeltaSet( "tags", Tag )
      // $$$ this._makeCRUDNAF_DeltaSet( "events", Event )
      // $$$ this._makeCRUDNAF_DeltaSet( "patients", Patient )
      // $$$ this._makeCRUDNAF_DeltaSet( "facility" )
      // $$$
      // $$$ // Setup callback from configuration reload.
      // $$$ this._accutechAPI.signupForReloadNotification( $.proxy( this.reload, this ) )
    }

  } // class

})
