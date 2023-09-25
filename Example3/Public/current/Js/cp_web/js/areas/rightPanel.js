//-----------------------------------------------------------------------------
// Uses:
// Date: 2020-02-05
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/svgAssist",
  "units/settings",
],
function
(
  SVG_Assist,
  Settings
)
{
  return class RightPanel
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Setup right panel used for tags.
    //-------------------------------------------------------------------------
    constructor()
    {
      SVG_Assist.getSVG_InObject( "#tagListButton" )
        .off()
        .click
        (
          function()
          {
            $( "#rightPanel" ).toggle( "slide", { direction: "right" }, Settings.panelSpeed )
          }
        )

    }

  }

})
