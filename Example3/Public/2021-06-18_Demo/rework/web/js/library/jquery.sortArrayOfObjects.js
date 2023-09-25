//-----------------------------------------------------------------------------
// Uses: jQuery plug-in to sort an array of objects by key in each object.
// Date: 2020-02-18
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
  $.sortArrayOfObjects = function( array, key )
  {
    array.sort
    (
      function( a, b )
      {
        var result = 0

        if ( a[ key ] > b[ key ] )
          result = 1

        if ( a[ key ] < b[ key ] )
          result = -1

        return result
      }
    )

    return array
  }
})