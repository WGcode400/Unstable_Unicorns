//-----------------------------------------------------------------------------
// Uses: Panel on left side of screen.
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
  return class LeftPanel
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Panel on left side of screen for map legend and alarms.
    //-------------------------------------------------------------------------
    constructor()
    {
      this.panelVisible  = false
      this.legendVisible = false
      this.alarmsVisible = false

      this.update()

      const self = this

      SVG_Assist.getSVG_InObject( "#alarmBellImage" )
        .off()
        .click
        (
          function()
          {
            self.alarmsVisible = ! self.alarmsVisible
            self.update()
          }
        )

      SVG_Assist.getSVG_InObject( "#mapButton" )
        .off()
        .click
        (
          function()
          {
            self.legendVisible = ! self.legendVisible
            self.update()
          }
        )

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Update the panel visibility.
    //-------------------------------------------------------------------------
    update()
    {
      //$$$const panelVisible  = $( "#leftPanel" ).first().is( ":visible" )

      if ( ( ! this.panelVisible )
        && ( this.legendVisible || this.alarmsVisible ) )
      {
        $( "#leftPanel" ).show( "slide", { direction: "left" }, Settings.panelSpeed )
        this.panelVisible = true
      }

      if ( ( this.panelVisible )
        && ( ! ( this.legendVisible || this.alarmsVisible ) ) )
      {
        $( "#leftPanel" ).hide( "slide", { direction: "left" }, Settings.panelSpeed )
        this.panelVisible = false
      }

      if ( this.panelVisible )
      {
        const panelHeight = $( "#leftSubPanel" ).height()

        var legendHeight = 0
        if ( this.legendVisible )
        {
          legendHeight = "100%"
          $( "#mapLegendHeaderDiv" ).show( Settings.panelSpeed )
        }
        else
          $( "#mapLegendHeaderDiv" ).hide( Settings.panelSpeed )

        $( "#mapLegendDiv" ).css( "max-height", legendHeight )

        if ( ! this.alarmsVisible )
          $( "#alarmDiv" ).css( "height", 0 )

      }

      if ( this.legendCallback )
        this.legendCallback( this.legendVisible )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Show alarms panel.
    //-------------------------------------------------------------------------
    showAlarms()
    {
      if ( ! this.alarmsVisible )
      {
        this.alarmsVisible = true

        // //const panelVisible  = $( "#leftPanel" ).first().is( ":visible" )
        // if ( this.panelVisible )
        //   $( "#alarmDiv" ).show( "slide", { direction: "down" }, Settings.panelSpeed )
        // else
        //   $( "#alarmDiv" ).show( 0 )

        this.update()
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Hide alarms panel.
    //-------------------------------------------------------------------------
    hideAlarms()
    {
      if ( this.alarmsVisible )
      {
        this.alarmsVisible = false

        // //const panelVisible  = $( "#leftPanel" ).first().is( ":visible" )
        // if ( this.panelVisible )
        //   $( "#alarmDiv" ).hide( "slide", { direction: "down" }, Settings.panelSpeed )
        // else
        //   $( "#alarmDiv" ).show( 0 )
        this.update()
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Set callback to run when legend visibility is changed.
    // Input:
    //   callback( isVisible ) - Callback to run.
    //     isVisible - True if the panel is visible.
    //-------------------------------------------------------------------------
    onLegend( callback )
    {
      this.legendCallback = callback
    }

  }

})
