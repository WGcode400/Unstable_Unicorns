//-----------------------------------------------------------------------------
// Uses: Functions for animating receiver icons.
// Date: 2020-02-06
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
  return class AlarmIcon
  {
    //-------------------------------------------------------------------------
    _getElement( name )
    {
      return this.element.find( "#" + name )[ 0 ]
    }

    //-------------------------------------------------------------------------
    setAnimation( duration, fill, stroke )
    {
      const fillElement = this._getElement( "animationFill" )
      if ( fillElement )
      {
        fillElement.setAttribute( "values", fill + ";black" )
        fillElement.setAttribute( "dur", duration + "s" )
      }

      const strokeElement = this._getElement( "animationStroke" )
      if ( strokeElement )
      {
        strokeElement.setAttribute( "values", stroke + ";white" )
        strokeElement.setAttribute( "dur", duration + "s" )
      }

      const self = this
      const startFunction =
        function()
        {
          self.element
            .find( "animate,animateTransform" )
            .each
            (
              function( index, element )
              {
                // Sometimes this can fail if the icon has been removed
                // before the animation was set to begin.  In that case an
                // exception is thrown which is caught and ignored.
                try
                {
                  element.beginElement()
                }
                catch ( error )
                {
                }
              }
            )

          self.sync[ 0 ].removeEventListener( 'repeatEvent', startFunction )
        }

      this.sync[ 0 ].addEventListener( 'repeatEvent', startFunction )
    }

    //-------------------------------------------------------------------------
    startHigh()
    {
      this.setAnimation( 1 / 2 , "red", "white" )
    }

    //-------------------------------------------------------------------------
    startMedium()
    {
      this.setAnimation( 2.0, "yellow", "black" )
    }

    //-------------------------------------------------------------------------
    startLow()
    {
      // Animation time is actually infinite, but we need an integer value.
      // The maximum integer is over 9 quadrilling which is enough seconds not
      // to be concerned about a flash.
      this.setAnimation( Number.MAX_SAFE_INTEGER, "cyan", "black" )
    }

    //-------------------------------------------------------------------------
    stop()
    {
      this.element
        .find( "animate,animateTransform" )
        .each( ( index, element ) => element.endElement() )
    }

    //-------------------------------------------------------------------------
    constructor( element, syncElement )
    {
      this.element = $( element )
      this.sync = $( syncElement )
    }

  }
})
