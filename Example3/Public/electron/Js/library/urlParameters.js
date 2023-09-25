//-----------------------------------------------------------------------------
// Uses: Fetch all parameters from URL.
// Date: 2020-01-07
//-----------------------------------------------------------------------------

"use strict"

define(
[
],
function
(
)
{
  return function()
  {
    const parameters = {}

    window.location.href.replace
    (
      /[?&]+([^=&]+)(?:=([^&]*))?/gi,
      function( fullMatch, key, value )
      {
        if ( undefined === value )
          value = true

        parameters[ key ] = value
      }
    )

    return parameters
  }
})
