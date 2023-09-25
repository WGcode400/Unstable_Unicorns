//-----------------------------------------------------------------------------
// Uses: jQuery plug-in to remove private data from object set.
// Date: 2020-03-23
// Notes:
//   Object set of objects are basically an array of the same kind of objects
//   but keyed.  Private data is marked with the object key being an
//   underscore.
//   Example:
//     {
//       "key1" : { "_privateData": ..., "publicData" : ... },
//       "key2" : { "_privateData": ..., "publicData" : ... },
//       ...
//       "key3" : { "_privateData": ..., "publicData" : ... },
//     }
//   The resulting object will be:
//     {
//       "key1" : { "publicData" : ... },
//       "key2" : { "publicData" : ... },
//       ...
//       "key3" : { "publicData" : ... },
//     }
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "vendor/jquery"
],
function
(
)
{
  //---------------------------------------------------------------------------
  // Uses:
  //   Recursively prune private data out of objects.
  // Input:
  //   object - Objects to prune.
  //---------------------------------------------------------------------------
  function prune( objects )
  {
    // Make a copy of the keys from object.
    // Note: We need a copy because we are going to remove some keys which
    // would mess up the iterator.
    const keys = Object.keys( objects ).slice()

    // Remove keys starting with underscore.
    for ( const key of keys )
      if ( key.match( /^_.+/ ) )
        delete objects[ key ]

    // Loop through all values looking for object to prune recursively.
    for ( const instance of Object.values( objects ) )
    {
      // If this instance is an object, and not `null` (which is also an
      // object), prune it.
      if ( ( typeof instance == "object" )
        && ( null !== instance ) )
      {
        prune( instance )
      }
    }
  }

  $.removePrivate = function( inputObjects )
  {
    var objects = inputObjects
    if ( typeof inputObjects == "object" )
    {
      // Make a copy of objects.
      objects = $.extend( true, {}, inputObjects )
      prune( objects )
    }

    // Return results.
    return objects
  }
})