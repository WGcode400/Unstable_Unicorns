//-----------------------------------------------------------------------------
// Uses: Interface to Accutech server.
// Date: 2019-12-18
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "units/tag",
  "units/webSocketCRUDNAF",
],
function
(
  Tag,
  WebSocketCRUDNAF,
)
{
  const SystemStates =
    Object.freeze
    (
      {
        events : "events.get",
        tags   : "tags.get"
      }
    )

  return class AccutechAPI
  {

    //-------------------------------------------------------------------------
    // Uses:
    //   Load from configuration.
    // Input:
    //   item - Configuration item id.
    //   callback( data ) - Callback to run after data has loaded.
    //     data - Requested data.
    // Output:
    //   jQuery `Deferred` object.
    //-------------------------------------------------------------------------
    load( item, callback )
    {
      // Request system configuration.
      return this.webSocketAPI.makeRequest( "database.getConfiguration", [ item ], callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Save configuration item.
    // Input:
    //   item - Configuration item id.
    //   data - Data to be saved.
    //   callback - Callback to run after data has saved.
    //-------------------------------------------------------------------------
    save( id, data, callback )
    {
      return this.webSocketAPI.makeRequest( "database.setConfiguration", [ id, data ], callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Save configuration item.
    // Input:
    //   dataSet - Object of objects with key as configuration item id and value
    //     as data to be saved.
    //   callback - Callback to run after data has saved.
    //-------------------------------------------------------------------------
    saveMultiple( dataSet, callback )
    {
      // Construct a request to save each item.
      const request = {}
      for ( const [ item, data ] of Object.entries( dataSet ) )
        request[ item ] = { name : "database.setConfiguration", parameters: [ item, data ] }

      // Issue request.
      return this.webSocketAPI.makeRequests( request, callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Save a set of asserts (files) to server.
    // Input:
    //   assets - Key/value object set of assets.
    //   callback - Callback to run after saving.
    // Output:
    //   jQuery `Deferred` object.
    //-------------------------------------------------------------------------
    saveAssetSet( assets, callback = null )
    {
      const request = {}

      // Construct a series of requests that save each asset.
      for ( const [ id, data ] of Object.entries( assets ) )
        request[ id ] = { name : "database.setConfiguration", parameters : [ id, data ] }

      const self = this
      const result = this.webSocketAPI.makeRequests( request, callback )

      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Load multiple items from configuration.
    // Input:
    //   callback( data ) - Callback to run after loading.
    //     data
    // Output:
    //   jQuery `Deferred` object.
    //-------------------------------------------------------------------------
    loadMultipleConfiguration( fields, callback )
    {
      // Construct a request to get every loadable field from database.
      const request = {}
      for ( const field of fields )
        request[ field ] = { name : "database.getConfiguration", parameters: field }

      // Issue request.
      const deferred = this.webSocketAPI.makeRequests( request, callback )

      return deferred

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Save multiple configuration items to database.
    // Input:
    //   callback - Function to run after saving is complete.
    //-------------------------------------------------------------------------
    saveMultipleConfiguration( dataSet, callback )
    {
      const self = this

      const requests = {}

      // Build request for all data fields...
      for ( const [ field, data ] of Object.entries( dataSet ) )
        requests[ field ] =
        {
          name : "database.setConfiguration",
          parameters: [ field, data ]
        }

      // Request system configuration.
      return this.webSocketAPI.makeRequests( requests, callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add an asset (image or audio) to configuration.
    // Input:
    //   id - Unique asset id value.
    //   data - Text data for asset.
    // Output:
    //   jQuery `Deferred` object.
    // Notes:
    //   For binary data, base-64 encode the data before calling this function.
    //-------------------------------------------------------------------------
    addAsset( id, data, callback )
    {
      return this.save( id, data, callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Save view views.
    // Input:
    //   views - View data.
    //   callback - Callback to run after saving.
    // Output:
    //   jQuery `Deferred` object.
    //
    // $$$DEP - Use `save( "views", callback ) instead.
    //-------------------------------------------------------------------------
    saveView( views, callback=null )
    {
      // Save views to database.
      return this.webSocketAPI.makeRequest
      (
        "database.setConfiguration",
        [ "views", views ],
        callback
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Setup a callback to run when a reload notification takes place.
    // Input:
    //   callback( event ) - Callback to run.
    //-------------------------------------------------------------------------
    signupForReloadNotification( callback )
    {
      // Sign up for notifications of alarm changes.
      this.webSocketAPI.requestNotification( "reload", callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Setup a callback to run when an event notification takes place.
    // Input:
    //   callback( event ) - Callback to run.
    //-------------------------------------------------------------------------
    signupForEventNotification( callback )
    {
      // Sign up for notifications of alarm changes.
      this.webSocketAPI.requestNotification( "events", callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get software version information.
    // Input:
    //   callback( data ) - Callback to run after loading.
    // Output:
    //   jQuery `Deferred` object.
    //-------------------------------------------------------------------------
    getVersions( callback )
    {
      return this.webSocketAPI.makeRequest( "version.all", [], callback )
    }

    //-------------------------------------------------------------------------
    // $$$TEMPORARY
    //-------------------------------------------------------------------------
    recomputeClientVersion( callback )
    {
      return this.webSocketAPI.makeRequest( "version.clientRecompute", [], callback )
    }

    //-------------------------------------------------------------------------
    // $$$DEBUG
    //-------------------------------------------------------------------------
    setMissingTagPeriod( value, callback )
    {
      return this.webSocketAPI.makeRequest
      (
        "server.system.set",
        { missing_tag_period__ms: value },
        callback
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Save event group configuration.
    // Input:
    //   data - Event group data.
    //   callback - Callback to run after saving.
    // Output:
    //   jQuery `Deferred` object.
    // Output:
    //   jQuery `Deferred` object.
    //
    // $$$DEP - Use `save( "eventGroups", callback ) instead.
    //-------------------------------------------------------------------------
    saveEventGroups( data, callback )
    {
      // Load views from database.
      return this.webSocketAPI.makeRequest
      (
        "database.setConfiguration",
        [ "eventGroups", data ],
        callback
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Register a function to be called if communications to server drops.
    // Input:
    //   callback - Function to be called.
    //-------------------------------------------------------------------------
    addErrorHandler( callback )
    {
      this.errorHandlers.push( callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Signal an error communicating to server has taken place.
    //   This will run all registered error handlers.
    //-------------------------------------------------------------------------
    error()
    {
      this.errorHandlers.forEach( ( callback ) => callback() )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Flush the entire configuration.
    // Input:
    //   callback - Callback to run once flush has completed.
    // Output:
    //   jQuery `Deferred` object.
    // $$$DEBUG - May be deprecated.  This is mostly a debug function.  Not
    // sure if this is useful in production.
    //-------------------------------------------------------------------------
    flushConfiguration( callback )
    {
      return this.webSocketAPI.makeRequest( "database.flushConfiguration", [], callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Commit the topology to the control system.
    //-------------------------------------------------------------------------
    commitTopology( areas, controllers, timestamp, callback, bringOnline = true )
    {
      // Start with the floor plan.
      const requests =
      {
        0 : { name : "system.setMode", parameters: [ 0 ] },
        1 : { name : "system.setTopology", parameters: [ areas, controllers, timestamp ] }
      }

      if ( bringOnline )
        requests[ 3 ] = { name : "system.setMode", parameters: [ 1 ] }

      return this.webSocketAPI.makeRequests( requests, callback )
    }

    //-------------------------------------------------------------------------
    // Input:
    //   webSocketAPI - WebSocket to use for transactions to server.
    //-------------------------------------------------------------------------
    constructor( webSocketAPI )
    {
      this.webSocketAPI = webSocketAPI
      this.errorHandlers = []

      this.tags     = new WebSocketCRUDNAF( webSocketAPI, "tags", "tags" )
      this.events   = new WebSocketCRUDNAF( webSocketAPI, "events", "events" )
      this.patients = new WebSocketCRUDNAF( webSocketAPI, "patients", "database" )
      this.facility = new WebSocketCRUDNAF( webSocketAPI, "facility", "database" )
    }

  }
})
