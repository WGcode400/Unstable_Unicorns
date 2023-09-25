//-----------------------------------------------------------------------------
// Uses: jQuery plug-in for picking random item from array.
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
  $.random = function( array )
  {
    var result
    if ( $.isArray( array ) )
      result = array[ $.random( array.length ) ]
    else
    if ( typeof array === "number" )
      result = Math.floor( Math.random() * array )
    else
      result = Math.random()

    return result
  }
})