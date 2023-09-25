//-----------------------------------------------------------------------------
// Uses: Pan, zoom and rotate an SVG image.
// Date: 2020-01-09
//-----------------------------------------------------------------------------

"use strict"

define(
[
  'vendor/jquery',
  'vendor/jquery.mousewheel'
],
function
(
)
{
  // Defaults.
  const DEFAULT_PARAMETERS =
  {
    xOffset        : 0,
    yOffset        : 0,
    scale          : 1.0,
    rotation       : 0,
    zoomFactor     : 0.1,
    isEnabled      : true,
    changeCallback : null,
    rotateCallback : null,
    snapAt         : 45,
    snapMargin     : 15,

  }

  return class PanZoomRotateSVG
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Update the SVG with the current settings.  Call after settings
    //   adjustment.
    //-------------------------------------------------------------------------
    _update()
    {
      const translate = "translate(" + this.xOffset + "," + this.yOffset + ") "
      const scale = "scale(" + this.scale + ") "
      const rotate = "rotate(" + this.rotation + " " + this.xCenter + " " + this.yCenter +" ) "

      const transform = translate + scale + rotate

      this.group.attr( "transform", transform )

      if ( this.changeCallback )
        this.changeCallback()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Translate event's position to a point on SVG.
    // Input:
    //   event - Event data associated including mouse position.
    // Output:
    //   Translated position object.
    //     x - Location in x-axis.
    //     y - Location in y-axis.
    //-------------------------------------------------------------------------
    _translatePosition( event )
    {
      // Create a point.
      const svg = this.svg[ 0 ]
      const point = svg.createSVGPoint()

      // Assign point the mouse position.
      point.x = event.clientX
      point.y = event.clientY

      // Translate the point to SVG coordinates.
      const inverse = svg.getScreenCTM().inverse()
      const resultPoint = point.matrixTransform( inverse )

      return resultPoint
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Callback when mouse is moved over SVG.  Used for panning.
    // Input:
    //   event - Event data associated including mouse position.
    //-------------------------------------------------------------------------
    _mouseMove( event )
    {
      const point = this._translatePosition( event )

      this.xOffset = ( point.x - this.xStart )
      this.yOffset = ( point.y - this.yStart )

      this._update()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Callback when mouse button is let up.  Disables panning.
    // Input:
    //   event - Event data associated including mouse position.
    //-------------------------------------------------------------------------
    _mouseUp( event )
    {
      this.svg.off( 'mousemove', this._mouseMove )
      this.svg.off( 'mousemove', this._mouseRotate )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Callback when mouse is moved over SVG.  Used for rotation.
    // Input:
    //   event - Event data associated including mouse position.
    //-------------------------------------------------------------------------
    _mouseRotate( event )
    {
      // How much has mouse moved in y-axis.
      const yDelta = ( event.clientY - this.yStart )

      // Calculate the new angle based on y-axis motion.
      this.rotation = this.rotationStart + yDelta

      // Correct for negative values.
      while ( this.rotation < 0 )
        this.rotation += 360

      // Use snapping if shift is pressed.
      if ( event.shiftKey )
      {
        // How far are we from a snap point?
        const snapDelta = Math.abs( this.rotation ) % this.snapAt

        // Close enough to snap?
        if ( snapDelta < this.snapMargin )
          // Snap rotation.
          this.rotation = Math.floor( this.rotation / this.snapAt ) * this.snapAt
      }

      this._update()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Callback when mouse button is pressed.  Starts panning.
    // Input:
    //   event - Event data associated including mouse position.
    //-------------------------------------------------------------------------
    _mouseDown( event )
    {
      if ( ! event.ctrlKey )
      {
        const point = this._translatePosition( event )

        this.xStart = point.x - this.xOffset
        this.yStart = point.y - this.yOffset

        this._mouseMove( event )
        this.svg
          .mousemove( $.proxy( this._mouseMove, this ) )
          .mouseup( $.proxy( this._mouseUp, this ) )
      }
      else
      {
        this.xStart = event.clientX
        this.yStart = event.clientY
        this.rotationStart = this.rotation

        this.svg
          .mousemove( $.proxy( this._mouseRotate, this ) )
          .mouseup(   $.proxy( this._mouseUp, this ) )
      }

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Callback when mouse wheel changes.  Used for zooming.
    // Input:
    //   event - Event data associated including mouse position.
    //-------------------------------------------------------------------------
    _mouseWheel( event )
    {
      const point = this._translatePosition( event )

      let zoomFactor = this.zoomFactor
      if ( event.shiftKey )
        zoomFactor *= 0.1

      // Calculate where on the image the mouse is pointing.
      const xCurrent = ( point.x - this.xOffset ) / this.scale
      const yCurrent = ( point.y - this.yOffset ) / this.scale

      // New scale.
      this.scale += this.scale * event.deltaY * zoomFactor

      // Adjust offset such that mouse points to same location
      // after adjusted scale.
      this.xOffset = point.x - xCurrent * this.scale
      this.yOffset = point.y - yCurrent * this.scale

      this._update()

      if ( this.rotateCallback )
        rotateCallback()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Enable pan/zoom.
    //-------------------------------------------------------------------------
    enable()
    {
      this.svg
        .off()
        .mousedown( $.proxy( this._mouseDown, this ) )
        .mousewheel( $.proxy( this._mouseWheel, this ) )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Disable pan/zoom.
    //-------------------------------------------------------------------------
    disable()
    {
      this.svg.off()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Set rotation of image about center.
    // Input:
    //   degrees - Degrees of rotation.
    //-------------------------------------------------------------------------
    setRotation( degrees )
    {
      this.rotation = parseFloat( degrees )  || DEFAULT_PARAMETERS.rotation
      this._update()

      if ( this.rotateCallback )
        this.rotateCallback()
    }

    //-------------------------------------------------------------------------
    setPan( xOffset, yOffset )
    {
      this.xOffset = parseFloat( xOffset ) || DEFAULT_PARAMETERS.xOffset
      this.yOffset = parseFloat( yOffset ) || DEFAULT_PARAMETERS.yOffset
      this._update()
    }

    //-------------------------------------------------------------------------
    setScale( scale )
    {
      this.scale = parseFloat( scale ) || DEFAULT_PARAMETERS.scale
      this._update()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the current rotation.
    // Output:
    //   Rotation (in degrees) about image center.
    //-------------------------------------------------------------------------
    getRotation()
    {
      return this.rotation
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the current pan settings.
    // Output:
    //   Object with:
    //     xOffset - Offset in x-axis.
    //     yOffset - Offset in y-axis.
    //-------------------------------------------------------------------------
    getPan()
    {
      return { xOffset: this.xOffset, yOffset: this.yOffset }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the current scale (zoom) factor.
    // Output:
    //   Zoom scale factor.
    //-------------------------------------------------------------------------
    getScale()
    {
      return this.scale
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get pan/zoom/rotation as object.
    // Output:
    //   Object with:
    //     xOffset - Offset in x-axis.
    //     yOffset - Offset in y-axis.
    //     scale   - Zoom scale factor.
    //     rotation - Rotation (in degrees) about image center.
    //-------------------------------------------------------------------------
    get()
    {
      const result =
      {
        xOffset  : this.xOffset,
        yOffset  : this.yOffset,
        scale    : this.scale,
        rotation : this.rotation
      }

      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Set pan/zoom/rotation.
    // Input:
    //   values - Object with following parameters:
    //     xOffset - Offset in x-axis.
    //     yOffset - Offset in y-axis.
    //     scale - Zoom scale factor.
    //     rotation - Rotation (in degrees) about image center.
    //-------------------------------------------------------------------------
    set( values )
    {
      this.xOffset  = values.xOffset
      this.yOffset  = values.yOffset
      this.scale    = values.scale
      this.rotation = values.rotation
      this._update()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Reset all pan/zoom/rotation behaviors.
    //-------------------------------------------------------------------------
    reset()
    {
      this.xOffset  = DEFAULT_PARAMETERS.xOffset
      this.yOffset  = DEFAULT_PARAMETERS.yOffset
      this.scale    = DEFAULT_PARAMETERS.scale
      this.rotation = DEFAULT_PARAMETERS.rotation
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Set the function to be called any time the view is changed.
    // Input:
    //   callback - Function to run.
    // Notes:
    //   May be triggered multiple times in a row.
    //-------------------------------------------------------------------------
    setChangeCallback( callback )
    {
      this.changeCallback = callback
    }

    //-------------------------------------------------------------------------
    // Input:
    //   svg - JQuery object that is the SVG object.
    //   group - Group in the SVG to apply transform.
    //   parameters - Object with additional parameters.
    //     xOffset - Offset in x-axis. (default 0)
    //     yOffset - Offset in y-axis. (default 0)
    //     scale - Zoom scale factor. (default 1.0)
    //     rotation - Rotation (in degrees) about image center. (default 0)
    //     zoomFactor - Zoom increments as mouse wheel is turned. (default 0.1)
    //     isEnabled - True to enable mouse interactions (default).
    //     changeCallback - Callback to run when settings are changed.
    //     rotateCallback - Callback when rotation is changed.
    //     snapAt - Even angles to snap to during rotation (default 45 degrees)
    //     snapMargin - Snap when angle are within this value (default 15 degrees)
    //-------------------------------------------------------------------------
    constructor( svg, group, parameters )
    {
      this.svg = svg
      this.group = group

      $.extend( this, DEFAULT_PARAMETERS, parameters )

      this.xStart = 0
      this.yStart = 0

      this.changeCallback = null

      // Get the center of the image.
      // Used as rotation anchor point.
      const box = this.svg[ 0 ].getBBox()
      this.xCenter = box.width / 2
      this.yCenter = box.height / 2

      if ( this.isEnabled )
        this.enable()
    }
  }
})
