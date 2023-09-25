//-----------------------------------------------------------------------------
// Uses: Class for holding a set of objects keyed by a field from that object.
// Date: 2020-03-23
//-----------------------------------------------------------------------------

"use strict"

define(
[
],
function
(
)
{
  return class KeyedArray
  {
    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    add( item )
    {
      if ( this._baseClass )
        item = new baseClass( item )

      this[ item[ this._keyField ] ] = item
    }

    //-------------------------------------------------------------------------
    // Uses:
    //
    //-------------------------------------------------------------------------
    rekey( newKey )
    {
      //const objects = {}
      //for ( const item of this
    }

    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    export()
    {
      // Make a copy of objects.
      const objects = $.extend( {}, this )

      // Assume all objects are like the first object.
      const firstObject = Object.values( objects )[ 0 ]
      const keys = Object.keys( firstObject )

      // Make a list of private date members.
      const removeList = []
      for ( const key of keys )
        if ( key.match( /^_.+/ ) )
          removeList.push( key )

      // Remove private data members for objects copy.
      for ( const receiver of Object.values( objects ) )
      {
        for ( const removeItem of removeList )
          delete objects[ removeItem ]
      }

      // Return results.
      return objects
    }

    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    constructor( array, keyField="id", baseClass )
    {
      if ( typeof array === "object" )
        array = Object.values( array )

      if ( ! $.isArray( array ) )
        throw "Unsupported type for `KeyedArray` input"

      this._keyField = keyField
      if ( baseClass )
        this._baseClass = baseClass

      for ( const item of array )
        this.add( item )
    }
  }
})
