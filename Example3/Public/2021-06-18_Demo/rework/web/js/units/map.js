//-----------------------------------------------------------------------------
// Uses: Main map handling.
// Date: 2019-12-18
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/svgAssist",
  "library/panZoomRotateSVG",
  "library/uuid4",

  "units/settings",

  "library/jquery.sortArrayOfObjects",
  "vendor/jquery"
],
function
(
  SVG_Assist,
  PanZoomRotateSVG,
  uuid4,
  Settings,
)
{
  const mapTemplate = $.get
  (
    'templates/map.template.html',
    function( data )
    {
      // Attach template to HTML <body> area.
      $( "body" ).append( data )
    }
  )

  return class Map
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Setup SVG definitions for various receiver icons.
    //-------------------------------------------------------------------------
    _setup( mapId )
    {
      const imageId = this.system.maps[ mapId ].image
      const svgFiles = this.system.svgFiles
      const svgData = svgFiles[ imageId ]

      this.iconSize = this.system.maps[ mapId ].iconSize
      this.fontSize = this.system.maps[ mapId ].fontSize

      // Add the primary floor plan to page.
      // $$$FUTURE - Handle errors.
      this.svg =
        SVG_Assist.addSVG_FromString( "#floorPlanDiv", svgData, "floorPlan", true )

      const zoomArea = this.svg.find( "#zoomArea" )

      // Receiver indicator icons.
      this.addGroup( "receiverIndicators", zoomArea )

      // Receiver connection lines.
      this.addGroup( "connections", zoomArea )

      // Legend text labels.
      this.addGroup( "textLabels", zoomArea )

      // Used for editing layout.
      this.addGroup( "edit", zoomArea )

      // Hide the connections be default.
      this.svg.find( "#connections" ).hide()

      // Add each of the receiver icons to floor plan SVG.
      for ( const iconType of Object.values( this.system.iconTypes ) )
      {
        const iconId = iconType.icon
        const icon = svgFiles[ iconId ]
        SVG_Assist.embedDef_FromString( this.svg, icon, iconType.id )
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Draw connections between controllers and receivers.
    //-------------------------------------------------------------------------
    drawConnections()
    {
      const receivers = this.getReceivers()
      if ( receivers )
      {
        const controllers = {}
        for ( const mapReceiver of Object.values( receivers ) )
        {
          const receiverId = mapReceiver.id
          const receiver = this.system.receivers[ receiverId ]
          const controllerId = receiver.controllerId
          const receiverChannel = receiver.channel
          if ( ! ( controllerId in controllers ) )
            controllers[ controllerId ] = []

          controllers[ controllerId ][ receiverChannel ] = $.extend( {}, receiver, mapReceiver )
        }

        const insertLocation = this.svg.find( "#connections" )[ 0 ]

        for ( const receivers of Object.values( controllers ) )
        {
          var first = null
          var last = null
          for ( const receiver of receivers )
          {
            if ( receiver )
            {
              if ( ! first )
              {
                first = receiver

                const circle = SVG_Assist.createElement( "circle" )

                circle.setAttribute( "cx", first.xCenter )
                circle.setAttribute( "cy", first.yCenter )
                circle.setAttribute( "r", this.iconSize / 3 )
                circle.setAttribute( "fill", "blue" )
                circle.setAttribute( "stroke", "none" )
                insertLocation.append( circle )
              }

              if ( 0 == ( receiver.channel % 3 ) )
                last = first

              if ( last )
              {
                const line = SVG_Assist.createElement( "line" )

                line.setAttribute( "x1", last.xCenter     )
                line.setAttribute( "y1", last.yCenter     )
                line.setAttribute( "x2", receiver.xCenter )
                line.setAttribute( "y2", receiver.yCenter )
                line.setAttribute( "fill", "none" )
                line.setAttribute( "stroke", "blue" )
                line.setAttribute( "stroke-width", "4" )
                insertLocation.append( line )
              }

              last = receiver
            }
          }
        }

      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Create a label for a receiver on map.
    // Input:
    //   receiver - Object with receiver information.
    //-------------------------------------------------------------------------
    _createReceiverLabel( receiver )
    {
      // Create new <text> element and use the static band template.
      const labelElement = SVG_Assist.createElement( 'text' )
      const labelText = document.createTextNode( receiver.number )

      // Convert turns to radians.
      const angle = ( receiver.labelAngle * 2 * Math.PI ) - Math.PI

      // Get text position from polar coordinates.
      const x = receiver.xCenter + receiver.labelRadius * Math.cos( angle )
      const y = receiver.yCenter + receiver.labelRadius * Math.sin( angle )

      // Set map position.
      labelElement.setAttribute( "x", x )
      labelElement.setAttribute( "y", y )
      labelElement.setAttribute( "style", "font-size: " + this.fontSize + "px" )

      // Class with text attributes.
      labelElement.setAttribute( "class", "legendText" )

      // Text to display.
      labelElement.appendChild( labelText )

      this._labels[ receiver.number ] = labelElement

      return labelElement
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a group to the map SVG file.
    // Input:
    //   groupId - Unique id for group.
    //   parent - Parent to attach new group.
    // Notes:
    //   Useful for adding temporary elements to map image.
    //-------------------------------------------------------------------------
    addGroup( groupId, parent )
    {
      const group = SVG_Assist.createElement( "g" )
      group.setAttribute( "id", groupId )

      parent.append( group )

      return group
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a receiver to the map.
    // Input:
    //   receiver - Receiver information object.
    //-------------------------------------------------------------------------
    addReceiver( receiver )
    {
      const id = uuid4()
      const ledendRowId = "ledend" + id

      // Location of receiver on map.
      const x = receiver.xCenter - this.iconSize / 2
      const y = receiver.yCenter - this.iconSize / 2

      const iconTypeId = receiver.type
      const receiverElement = SVG_Assist.addUse( this.insertLocation, iconTypeId, x, y )
      receiverElement.setAttribute( "width", this.iconSize )
      receiverElement.setAttribute( "height", this.iconSize )

      // Row for description in legend.
      const ledendRow = $( "<tr>" )
        .attr( "id", ledendRowId )
        .hover
        (
          // Callback when row is hovered over.
          function()
          {
            // Highlight the row.
            ledendRow.toggleClass( "highlight" )

            // Highlight the receiver icon.
            $( receiverElement ).toggleClass( "svgIconHighlight" )
          }
        )

      this.legendRows[ receiver.number ] = ledendRow

      // Add description text o legend.
      ledendRow.append( $( "<td>" ).text( receiver.number ) )
      ledendRow.append( $( "<td>" ).text( receiver.description ) )
      $( "#legendTable tbody" ).append( ledendRow )

      // Create an id for this receiverElement.
      receiverElement.setAttribute( "id", "receiver" + id )

      // Callbacks for hovering (mouse over and mouse out).
      receiverElement.onmouseover =
        function()
        {
          $( receiverElement ).addClass( "svgIconHighlight" )
          ledendRow.addClass( "highlight" )
        }

      receiverElement.onmouseout =
        function()
        {
          $( receiverElement ).removeClass( "svgIconHighlight" )
          ledendRow.removeClass( "highlight" )
        }

      // Add receiver legend label.
      const labelElement = this._createReceiverLabel( receiver )
      this.attachLabelElement.append( labelElement )

      // Add receiver to list.
      this._receivers[ receiver.id ] = $.extend( { iconId: id }, receiver )

      return receiverElement
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove a receiver icon/label from map.
    // Input:
    //   receiver - Receiver to be removed.
    //-------------------------------------------------------------------------
    removeReceiver( receiver )
    {
      // Remove the element from the screen.
      const receiverElement = this.getIcon( receiver.id )
      receiverElement.remove()

      const labelElement = this.getLabel( receiver.number )
      labelElement.remove()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Draw all the receivers on the map.
    //-------------------------------------------------------------------------
    _drawReceivers( mapId )
    {
      this.attachLabelElement = this.svg.find( "#textLabels" )[ 0 ]
      this.insertLocation = this.svg.find( "#receiverIndicators" )[ 0 ]

      // Reset legend.
      $( "#legendTable tbody" ).html( "" )
      this.legendRows = {}

      const map = this.system.maps[ mapId ]

      // Make a complete list of receiver data.
      // This is done by concatenating the configuration receiver data to the
      // map receiver data.
      const receivers = $.extend( true, [], Object.values( map.receivers ) )
      for ( const receiver of receivers )
        $.extend( true, receiver, this.system.receivers[ receiver.id ] )

      // Sort receiver list by legend number.
      const sortedReceivers = $.sortArrayOfObjects( receivers, "number" )

      // Loop to draw all receiver data...
      for ( const receiver of sortedReceivers )
        this.addReceiver( receiver )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Callback used for show/hiding legend.  Displays/hides text labels.
    // Input:
    //   isVisible - True if legend is shown.
    //-------------------------------------------------------------------------
    _updateLegendVisibility( isVisible )
    {
      this.legendVisibility = isVisible
      if ( this.svg )
      {
        if ( isVisible )
          this.svg.find( "#textLabels" )[ 0 ].style.display = ""
        else
          this.svg.find( "#textLabels" )[ 0 ].style.display = "none"
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Enable pan/zoom.  This is needed for setup.
    //-------------------------------------------------------------------------
    enablePanZoom()
    {
      if ( this.panZoomRotate )
        this.panZoomRotate.enable()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Rotate (or un-rotate) specified element.
    // Input:
    //   item - SVG element object.
    //   degrees - Amount of rotation to apply (+360 to -360).
    //-------------------------------------------------------------------------
    _rotateItem( item, degrees )
    {
      const boundingBox = item.getBBox()
      const width  = boundingBox[ "width" ]
      const height = boundingBox[ "height" ]

      // Compute the center location of text.
      // This is the point to rotate text around.
      const x = boundingBox[ "x" ] + width / 2
      const y = boundingBox[ "y" ] + height / 2

      // Do counter-rotation on text.
      $( item ).attr( "transform", "rotate( " + degrees + " " + x + " " + y + " )" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Undo the rotation of text on map.
    // Input:
    //   degrees - Current map rotation.
    //-------------------------------------------------------------------------
    _rotateMapText( degrees )
    {
      const self = this

      degrees = -degrees

      const svg = $( "#floorPlan" )

      // Un-hide legend labels.
      // (Might be a temporary un-hide as labels cannot be found to rotate
      // unless they are visible.)
      const oldDisplayStyle = svg.find( "#textLabels" )[ 0 ].style.display
      svg.find( "#textLabels" )[ 0 ].style.display = ""

      // Un-rotate text on map.
      svg
        .find( "#textLabels text" )
        .each( ( index, item ) => self._rotateItem( item, degrees ) )

      // Restore label visibility.
      svg.find( "#textLabels" )[ 0 ].style.display = oldDisplayStyle

      // Construct a list of selectors for items needing rotation.
      // Start with the receiver indicator.
      var selectors = "#receiverIndicators use"

      // Add any additional selectors.
      for ( const selector of this.rotateSelectors )
        selectors += "," + selector

      // Un-rotate receiver indicators.
      // Must be done separately as the bounding box method doesn't work for
      // <use> tags.
      svg
        .find( selectors )
        .each( ( index, item ) => self._rotateItem( item, degrees ) )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a selector that will have its elements rotated.
    // Input:
    //   selector - CSS selector.
    // Notes:
    //   Used for icons added to the map from outside this unit.
    //-------------------------------------------------------------------------
    addRotateSelector( selector )
    {
      this.rotateSelectors.push( selector )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Set the map view (pan, zoom, rotation).
    // Input:
    //   view - Object with view data.  Must include:
    //     xOffset - Offset in x-axis.
    //     yOffset - Offset in y-axis.
    //     scale - Zoom scale factor.
    //     rotation - Rotation (in degrees) about image center.
    //-------------------------------------------------------------------------
    setView( view )
    {
      this.rotation = view.rotation
      if ( this.panZoomRotate )
      {
        this.panZoomRotate.set( view )
        this._rotateMapText( view.rotation )
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Set rotation of map.
    // Input:
    //   rotation - Rotation in degrees.
    //-------------------------------------------------------------------------
    rotateMap( rotation )
    {
      this.rotation = rotation
      this.panZoomRotate.setRotation( rotation )
      this._rotateMapText( rotation )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the current view of the map.
    // Output:
    //   Object with:
    //     xOffset - Offset in x-axis.
    //     yOffset - Offset in y-axis.
    //     scale   - Zoom scale factor.
    //     rotation - Rotation (in degrees) about image center.
    //-------------------------------------------------------------------------
    getView()
    {
      return this.panZoomRotate.get()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Check to see if two views are the same or not.
    // Input:
    //   viewA - View object (from `getView`).
    //   viewB - View object (from `getView`).
    // Output:
    //   True if objects are different.
    //-------------------------------------------------------------------------
    isViewDifferent( viewA, viewB )
    {
      const isDifferent =
           ( ( viewA.xOffset  != viewB.xOffset  )
          || ( viewA.yOffset  != viewB.yOffset  )
          || ( viewA.scale    != viewB.scale    )
          || ( viewA.rotation != viewB.rotation ) )

      return isDifferent
    }

    // $$$ //-------------------------------------------------------------------------
    // $$$ // Uses:
    // $$$ //   Add a function to be called when map is changed.
    // $$$ // Input:
    // $$$ //   callback( mapId ) - Function to run.
    // $$$ //     mapId - Id of map now active.
    // $$$ //-------------------------------------------------------------------------
    // $$$ addMapChangeCallback( callback )
    // $$$ {
    // $$$   this.mapChangeCallbacks.push( callback )
    // $$$ }
    // $$$
    // $$$ //-------------------------------------------------------------------------
    // $$$ // Uses:
    // $$$ //   Remove function
    // $$$ // Input:
    // $$$ //   callback - Function to remove.
    // $$$ //-------------------------------------------------------------------------
    // $$$ removeMapChangeCallback( callback )
    // $$$ {
    // $$$   this.mapChangeCallbacks.remove( callback )
    // $$$ }

    //-------------------------------------------------------------------------
    // Uses:
    //   Fade-in map.  Call after map is fully setup.
    //-------------------------------------------------------------------------
    fadeIn()
    {
      $( "#floorPlanDiv" )
        .animate
        (
          { "opacity" : 1.0 },
          Settings.FadeInSpeed
        )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the map icon for the specified receiver number.
    // Input:
    //   receiverNumber - The receiver number.
    // Output:
    //   SVG element or null if the receiver number is not on the map.
    //-------------------------------------------------------------------------
    getIcon( id )
    {
      var element = null
      if ( id in this._receivers )
      {
        const iconId = this._receivers[ id ].iconId
        const iconFind = this.svg.find( "#receiver" + iconId )
        element = $( iconFind[ 0 ] )
      }

      return element
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Set a callback for all receiver icons for some binding function.
    // Input:
    //   binding - Which function to bind.
    //   callback - Function to run.
    //-------------------------------------------------------------------------
    setIconBinding( binding, callback )
    {
      for ( const receiver of Object.values( this._receivers ) )
      {
        const iconId = receiver.iconId //this._receivers[ receiverId ].iconId
        const iconFind = this.svg.find( "#receiver" + iconId )
        $( iconFind[ 0 ] ).bind
        (
          binding,
          function()
          {
            let receiverId = receiver.id
            //console.log( receiverId )
            callback( receiverId )
          }
        )
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the label element for specified receiver number.
    // Input:
    //   receiverNumber - Receiver number.
    // Output:
    //   SVG object.
    // $$$FUTURE - Remove receiver number.
    //-------------------------------------------------------------------------
    getLabel( receiverNumber )
    {
      return this._labels[ receiverNumber ]
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Load the SVG for the requested map id.
    // Input:
    //   mapId - Which map to load.
    //-------------------------------------------------------------------------
    showMap( mapId, configuration )
    {
      this.system = configuration
      this.mapId = mapId

      // // Flush existing map.
      // if ( this.svg )
      // {
      //   $( "#floorPlan" ).remove()
      //   this.svg = null
      // }

      this._receivers = {}
      this._labels = {}
      this.panZoomRotate = null

      // Reset images.
      this.alarmImageElements = {}

      if ( ( mapId )
        && ( mapId in this.system.maps ) )
      {
        $( "#noMapDiv" ).hide()

        this._setup( mapId )
        this._drawReceivers( mapId )

        this.svg = $( "#floorPlan" )

        // Set legend visibility to its current value (restores last setting).
        this._updateLegendVisibility( this.legendVisibility )

        const zoomArea = this.svg.find( "#zoomArea" )
        this.panZoomRotate =
          new PanZoomRotateSVG
          (
            this.svg,
            zoomArea,
            {
              isEnabled: false
            }
          )
      }
      else
      {
        $( "#noMapDiv" ).show()
      }

      this.drawConnections()

      // $$$ for ( const callback of this.mapChangeCallbacks )
      // $$$   callback( mapId )
    }


    //-------------------------------------------------------------------------
    // Uses:
    //   Load the SVG for the requested map id.
    // Input:
    //   mapId - Which map to load.
    //-------------------------------------------------------------------------
    loadMap( mapId ) // $$$DEP
    {
      this.mapId = mapId

      // Flush existing map.
      if ( this.svg )
      {
        $( "#floorPlan" ).remove()
        this.svg = null
      }

      this._receivers = {}
      this._labels = {}
      this.panZoomRotate = null

      // Reset images.
      this.alarmImageElements = {}

      if ( ( mapId )
        && ( mapId in this.system.maps ) )
      {
        $( "#noMapDiv" ).hide()

        this._setup( mapId )
        this._drawReceivers( mapId )

        this.svg = $( "#floorPlan" )

        // Set legend visibility to its current value (restores last setting).
        this._updateLegendVisibility( this.legendVisibility )

        const zoomArea = this.svg.find( "#zoomArea" )
        this.panZoomRotate =
          new PanZoomRotateSVG
          (
            this.svg,
            zoomArea,
            {
              isEnabled: false
            }
          )
      }
      else
      {
        $( "#noMapDiv" ).show()
      }

      this.drawConnections()

      // $$$ for ( const callback of this.mapChangeCallbacks )
      // $$$   callback( mapId )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Enable/disable legend text next to receiver icons.
    // Input:
    //   isEnabled - True to display legend text.
    //-------------------------------------------------------------------------
    setLegendTextEnable( isEnabled )
    {
      if ( this.svg )
      {
        // $$$DEBUG - Note, this is only good for the labels, nothing else.
        if ( isEnabled )
          this.svg.find( "#textLabels" )[ 0 ].style.display = ""
        else
          this.svg.find( "#textLabels" )[ 0 ].style.display = "none"
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Rotate element based on current view.
    //   Call when placing new elements on map.
    // Input:
    //   element - SVG element on map.
    //-------------------------------------------------------------------------
    rotateElement( element )
    {
      this._rotateItem( element, -this.rotation )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the receivers on this map.
    // Output:
    //   Object set of receivers, keyed by receiver id.
    //-------------------------------------------------------------------------
    getReceivers()
    {
      var result = null
      const records = this.getMapRecord()
      if ( ( records )
        && ( "receivers" in records ) )
      {
        result = records.receivers
      }

      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the id of the loaded map.
    // Output:
    //   Id of current map or null if no map is loaded.
    //-------------------------------------------------------------------------
    getMapId()
    {
      return this.mapId
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the loaded map configuration record.
    // Output:
    //   Object with map data, or null if no map is loaded.
    //-------------------------------------------------------------------------
    getMapRecord()
    {
      var result = null
      if ( this.mapId in this.system.maps )
        result = this.system.maps[ this.mapId ]

      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Apply a new icon size to map icons.
    // Input:
    //   iconSize - Icon size (in pixels).
    // Notes:
    //   This will modify the loaded map configuration.
    //-------------------------------------------------------------------------
    setIconSize( iconSize )
    {
      const mapRecord = this.getMapRecord()
      if ( mapRecord )
      {
        mapRecord.iconSize = iconSize
        $( this.insertLocation ).find( "use" ).each
        (
          function( index, element )
          {
            // Current icon attributes.
            const width  = parseFloat( element.getAttribute( "width"  ) )
            const height = parseFloat( element.getAttribute( "height" ) )
            const x      = parseFloat( element.getAttribute( "x" ) )
            const y      = parseFloat( element.getAttribute( "y" ) )

            // Center of icon.
            const xCenter = x + width / 2
            const yCenter = y + height / 2

            // New icon location.
            const xNew = xCenter - iconSize / 2
            const yNew = yCenter - iconSize / 2

            // Change icon size.
            element.setAttribute( "width",  iconSize )
            element.setAttribute( "height", iconSize )

            // Adjust icon position to preserve center.
            element.setAttribute( "x", xNew )
            element.setAttribute( "y", yNew )
          }
        )
        this.iconSize = iconSize
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Apply a new font size to map labels.
    // Input:
    //   fontSize - Font size (in pixels).
    // Notes:
    //   This will modify the loaded map configuration.
    //-------------------------------------------------------------------------
    setFontSize( fontSize )
    {
      const mapRecord = this.getMapRecord()
      if ( mapRecord )
      {
        mapRecord.fontSize = fontSize
        $( this.attachLabelElement ).find( "text" ).each
        (
          function( index, element )
          {
            element.setAttribute( "style",  "font-size:" + fontSize + "px" )
          }
        )
        this.fontSize = fontSize
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the map SVG object.
    // Output:
    //   Main body of map SVG.
    //-------------------------------------------------------------------------
    getSVG()
    {
      return this.svg
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the SVG group used as the pan/zoom/rotate area.
    // Output:
    //   SVG element.
    //-------------------------------------------------------------------------
    getZoomArea()
    {
      var result = null
      if ( this.svg )
        result = this.svg.find( "#zoomArea" )

      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Apply/remove class from specified receiver in legend.
    // Input:
    //   receiverNumber - Which receiver.
    //   className - Class to apply or remove.
    //   isSet - True to add the class, false to remove it.
    //-------------------------------------------------------------------------
    setLegendHighlight( receiverNumber, className, isSet )
    {
      // Highlight legend row.
      if ( receiverNumber in this.legendRows )
      {
        if ( isSet )
          this.legendRows[ receiverNumber ].addClass( className )
        else
          this.legendRows[ receiverNumber ].removeClass( className )
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Class for managing floor plan pan, zoom and rotation.
    // Input:
    //   svg - Instance of SVG that is the floor plan.
    //-------------------------------------------------------------------------
    constructor( system )
    {
      this.system = system
      //this.leftPanel = leftPanel
      //leftPanel.onLegend( $.proxy( this._updateLegendVisibility, this ) )

      // Lookup table for receiver by receiver number.
      // This is a copy of the configuration table and also includes the icon
      // id for each receiver.
      this._receivers  = {}
      this._labels     = {}

      this.legendRows = {}
      this.mapPanZoom = null
      this.rotation   = 0
      this.svg        = null
      this.mapId      = null
      this.legendVisibility = false

      this.rotateSelectors = []

      // $$$ this.mapChangeCallbacks = []

      const html = $( "#mapTemplate" ).html()
      $( "main" ).html( html )
      $( "#floorPlanDiv" ).text( "" )

      this.fadeIn()
    } // constructor

  } // class
})
