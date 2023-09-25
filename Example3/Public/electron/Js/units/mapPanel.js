//-----------------------------------------------------------------------------
// Uses: Map panel on main screen.
// Date: 2020-02-05
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/svgAssist",
],
function
(
  SVG_Assist
)
{
  return class MapPanel
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Setup map panel.
    // Input:
    //   system - Instance of `System`.
    //-------------------------------------------------------------------------
    constructor( system )
    {
      $( "#hopsitalLogo" ).attr( "src", "images/cuddlesLogoBW.svg" )
      $( "#hospitalNameDiv" ).text( system.setup.facilityName )
    }

  }

})
