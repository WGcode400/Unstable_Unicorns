//-----------------------------------------------------------------------------
// Uses: Record set that tracks changes.
// Date: 2020-05-06
// Notes:
//   A delta record set is a collection of records that has an initial load
//   function and change notifications so that the current state of the set of
//   objects is always known.
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "units/tag",
  "units/event",
],
function
(
  Tag,
  Event
)
{
  return class DeltaRecordSet
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Add a callback function that is run when a new record is created.
    // Input:
    //   callback( record ) - Callback to run.
    //     record - Newly created record.
    //-------------------------------------------------------------------------
    onCreate( callback )
    {
      this._onCreate.push( callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a callback function that is run when a record is changed.
    // Input:
    //   callback( record ) - Callback to run.
    //     record - Modified record.
    //-------------------------------------------------------------------------
    onUpdate( callback )
    {
      this._onUpdate.push( callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a callback function that is run when a record is removed.
    // Input:
    //   callback( record ) - Callback to run.
    //     record - Record about to be removed.
    //-------------------------------------------------------------------------
    onDelete( callback )
    {
      this._onDelete.push( callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a callback function that is run when all records are loaded.
    // Input:
    //   callback( records ) - Callback to run.
    //     records - All records.
    // Note:
    //   If the data is already loaded, the callback is run immediately.
    //-------------------------------------------------------------------------
    onLoad( callback )
    {
      // If loading has already finished...
      if ( this._isLoaded )
        // Just run the callback.
        callback( this.records )
      else
        // Add callback to list.
        this._onLoad.push( callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove a callback function from array.
    // Input:
    //   array - Array to remove from.
    //   callback - Callback to be removed.
    //-------------------------------------------------------------------------
    _removeCallback( array, callback )
    {
      const index = array.indexOf( callback )
      if ( index > -1 )
        array.splice( index, 1 )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove a callback function previously registered with `onAdd`.
    // Input:
    //   callback - Callback to be removed.
    //-------------------------------------------------------------------------
    removeCreate( callback )
    {
      this._removeCallback( this._onCreate, callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove a callback function previously registered with `onChange`.
    // Input:
    //   callback - Callback to be removed.
    //-------------------------------------------------------------------------
    removeUpdate( callback )
    {
      this._removeCallback( this._onUpdate, callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove a callback function previously registered with `onDelete`.
    // Input:
    //   callback - Callback to be removed.
    //-------------------------------------------------------------------------
    removeDelete( callback )
    {
      this._removeCallback( this._onDelete, callback )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a new record.
    // Input:
    //   notificationRecord - Notification data.
    //-------------------------------------------------------------------------
    _create( notificationRecord )
    {
      // Make a new storage class for this record.
      const newRecord = new this._objectClass( notificationRecord, this._objectParameters )

      // We must have an id field to store the record.
      if ( ! ( "id" in newRecord ) )
      {
        console.log( notificationRecord, newRecord )
        throw "DeltaRecordSet: New record contains no id field."
      }

      // If the record doesn't already exist...
      if ( ! ( newRecord.id in this.records ) )
      {
        // Add record to list.
        this.records[ newRecord.id ] = newRecord

        // Run the add callbacks.
        for ( const callback of this._onCreate )
          callback( newRecord )
      }

      // NOTE: If the record already exists, the add is completely ignored.
      // This is a work-around for the change/add chase condition where a
      // change could add a record and the add would then try and replace the
      // record with stale data.

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Modify existing record.
    // Input:
    //   notificationRecord - Notification data.
    //-------------------------------------------------------------------------
    _update( notificationRecord )
    {
      const id = notificationRecord.id

      // If we have this record...
      if ( id in this.records )
      {
        const record = this.records[ id ]

        // Update all fields of record.
        for ( const [ key, value ] of Object.entries( notificationRecord ) )
        {
          // If this value has changed...
          if ( record[ key ] != value )
          {
            // Construct name of set function.
            const uppercaseKey = key.charAt( 0 ).toUpperCase() + key.slice( 1 )
            const setFunctionName = "set" + uppercaseKey

            // If there is a set function, call it.
            // If not, simply set the new value.
            if ( setFunctionName in record )
              record[ setFunctionName ]( value )
            else
              record[ key ] = value
          }
        }

        // Run the change callbacks.
        for ( const callback of this._onUpdate )
          callback( record )
      }
      else
        // We don't actually have this record, so add it.
        this._create( notificationRecord )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove record.
    // Input:
    //   notificationRecord - Notification data.
    //-------------------------------------------------------------------------
    _delete( notificationRecord )
    {
      const id = notificationRecord.id

      // If we have this record...
      if ( id in this.records )
      {
        const record = this.records[ id ]

        // Remove the record.
        delete this.records[ id ]

        // Run the remove callbacks.
        for ( const callback of this._onDelete )
          callback( record )
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Callback run when notification arrives.
    // Input:
    //   notificationData - Data returned by notification.
    //-------------------------------------------------------------------------
    _handleNotification( notificationData )
    {
      switch ( notificationData.type )
      {
        case "create" :
        {
          this._create( notificationData.data )
          break
        }

        case "update" :
        {
          this._update( notificationData.data )
          break
        }

        case "delete" :
        {
          this._delete( notificationData.data )
          break
        }

        case "flush" :
        {
          for ( const record of Object.values( this.records ) )
            this._delete( record )

          break;
        }

        default :
        {
          console.error( "Unknown notification type", notificationData )
          throw Error( "Unknown notification type" )
          break;
        }
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Callback to run when initial data is loaded.
    // Input:
    //   record - Record data.
    //-------------------------------------------------------------------------
    _handleLoad( records )
    {
      // Add earch record.
      for ( const record of Object.values( records ) )
        this._create( record )

      // Run callbacks.
      for ( const callback of this._onLoad )
        callback( this.records )

      this._isLoaded = true
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get records.
    // Output:
    //   Record set.  An object containing zero or more `objectClass` members
    //   keyed by the object's id field.
    // Note:
    //   The record set pointer will never change so it is safe to use this
    //   for the lifespan of the `DataRecordSet`.
    //-------------------------------------------------------------------------
    getRecords()
    {
      return this.records
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get initial and setup to monitor system state.
    // Input:
    //   notificationFunction - Callback for notifications.
    //   getFunction - Callback for initial load.
    //   objectClass - Class to create for new object.
    //   objectParameters - Additional parameters to class.
    //   loadCallback - Callback after initial data has been loaded.
    //-------------------------------------------------------------------------
    constructor
    (
      notificationFunction,
      getFunction,
      objectClass=Object,
      objectParameters=null,
      loadCallback=null
    )
    {
      this.records = {}

      this._objectClass = objectClass
      this._objectParameters = objectParameters

      this._isLoaded = false
      this._onCreate = []
      this._onUpdate = []
      this._onDelete = []
      this._onLoad   = []

      if ( loadCallback )
        this._onLoad.push( loadCallback )

      // Sign up for notifications first.
      notificationFunction( $.proxy( this._handleNotification, this ) )

      // Request initial state.
      getFunction( $.proxy( this._handleLoad, this ) )
    }

  } // class

})
