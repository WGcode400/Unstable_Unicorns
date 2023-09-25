//-----------------------------------------------------------------------------
// Uses: Create/Read/Update/Delete/Notify/readAll/Flush interface over WebSocket.
// Date: 2020-05-21
//-----------------------------------------------------------------------------

"use strict"

define(
[
],
function
(
)
{
  return class WebSocketCRUDNAF
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Create a new record.
    // Input:
    //   data - Data of new record.
    //   callback( record ) - Callback to run once record has been created.
    //     record - Instance with data of newly created record.
    // Output:
    //   jQuery `Deferred` object.
    //-------------------------------------------------------------------------
    create( data, callback )
    {
      const parameters = { data: data }
      const result =
        this._webSocketAPI.makeRequest( this._source + ".create", parameters, callback )

      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Read a record.
    // Input:
    //   id - Record id to read.
    //   callback( record ) - Callback once record has been read.
    //     record - Instance of record.
    // Output:
    //   jQuery `Deferred` object.
    //-------------------------------------------------------------------------
    read( id, callback )
    {
      const parameters = [ id ]
      const result =
        this._webSocketAPI.makeRequest( this._source + ".read", parameters, callback )
      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Update a record.
    // Input:
    //   id - Record id to update.
    //   data - Object with data items to be modified.
    //   callback( record ) - Callback once record has been changed.
    //     record - Instance of record.
    // Output:
    //   jQuery `Deferred` object.
    // Example:
    //   // Assume record is { a: 0, b: 1, c: 2 }
    //   record.update( "id123", { a: 1, b: 2 } )
    //   // Resulting record will be { a: 1, b: 2, c: 2 }.  Note that `c` is
    //   // unchanged because it was not specified.
    //-------------------------------------------------------------------------
    update( id, data, callback )
    {
      const parameters = [ id, data ]
      const result =
        this._webSocketAPI.makeRequest( this._source + ".update", parameters, callback )
      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove record.
    // Input:
    //   id - Record id to remove.
    //   callback( record ) - Callback just before removal.
    //     record - Instance of record.
    // Output:
    //   jQuery `Deferred` object.
    //-------------------------------------------------------------------------
    delete( id, callback )
    {
      const parameters = [ id ]
      const result =
        this._webSocketAPI.makeRequest( this._source + ".delete", parameters, callback )
      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Sign up for notification when any records in this set change.
    // Input:
    //   callback( changeRecord ) - Callback to run for modifications to
    //       record set.
    //     changeRecord - Object with two keys:
    //        type - Type of change.
    //        data - Record data.
    // Output:
    //   jQuery `Deferred` object.
    //-------------------------------------------------------------------------
    notification( callback )
    {
      const result =
        this._webSocketAPI.requestNotification( this._source, callback )
      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Read all records in set.
    // Input:
    //   callback( records ) - Callback after data has been read.
    //     records - Object set (keyed by record id) of all records.
    // Output:
    //   jQuery `Deferred` object.
    //-------------------------------------------------------------------------
    readAll( callback )
    {
      const parameters = []
      const result =
        this._webSocketAPI.makeRequest( this._source + ".readAll", parameters, callback )
      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove all records.
    // Input:
    //   callback - Callback after records have been removed.
    // Output:
    //   jQuery `Deferred` object.
    //-------------------------------------------------------------------------
    flush( callback )
    {
      const parameters = []
      const result =
        this._webSocketAPI.makeRequest( this._source + ".flush", parameters, callback )
      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Replace all records in set with a new set of records.
    // Input:
    //   data - New records to create.
    //   callback - Function to run after records have been created.
    // Output:
    //   jQuery `Deferred` object.
    // Note:
    //   Callback does not receive new data, but notifications will.
    //-------------------------------------------------------------------------
    replace( data, callback )
    {
      const request =
      {
        0 : { name : this._source + ".flush", parameters : [] }
      }

      // Construct a series of requests that save each asset.
      for ( const item of Object.values( data ) )
      {
        const id = item.id
        request[ id ] =
        {
          name : this._source + ".create",
          parameters : [ { data: item } ]
        }
      }

      const result = this._webSocketAPI.makeRequests( request, callback )
      return result
    }

    //-------------------------------------------------------------------------
    // Input:
    //   webSocketAPI - Instance of `WebSocketAPI`.
    //   source - Name of table/source the record set resides.
    //-------------------------------------------------------------------------
    constructor( webSocketAPI, source )
    {
      this._webSocketAPI = webSocketAPI
      this._source = source
    }
  }
})
