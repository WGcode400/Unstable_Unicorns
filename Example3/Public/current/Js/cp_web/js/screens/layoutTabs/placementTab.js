//-----------------------------------------------------------------------------
// Uses: Editor to place and position receivers, legend and text.
// Date: 2020-02-17
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/svgAssist",
  "library/uuid4",
  "library/upDownFrame",
  "units/settings",
  'vendor/w2ui',
  'vendor/jquery-ui'
],
function
(
  SVG_Assist,
  uuid4,
  upDownFrame,
  Settings,
  w2ui
)
{
  // $$$DEBUG - Move to CSS element.
  const CLEAR_COLOR     = "#00000000"
  const HIGHLIGHT_COLOR = "#00ffff80"

  // $$$DEBUG - Move to settings.
  const FRAME_STROKE = 2

  // Grid (table) for tag selection.
  const receiverGrid =
  {
    name: 'receiverGrid',
    show:
    {
      toolbarReload  : false,
      toolbarColumns : false,
      toolbar        : false,
      toolbarDelete  : false
    },

    columns:
    [
      { field: 'number',       caption: '#',             size: "15%", sortable: true, searchable: true },
      { field: 'description',  caption: 'Description',   size: "55%", sortable: true, searchable: true },
      { field: 'typeName',     caption: 'Type',          size: "30%", sortable: true, searchable: true },
    ],
  }

  return class PlacementTab
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Update all button/select enables based on current state.
    //-------------------------------------------------------------------------
    _updateButtonEnables()
    {
      $( "#placementTab_UnselectButton" ).prop( "disabled", ! this.selectedReceiver )
      $( "#placementTab_RemoveButton"   ).prop( "disabled", ! this.selectedReceiver )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove selection highlights on selected receiver.
    //-------------------------------------------------------------------------
    _unselect()
    {
      // Unselect a selected item in grid.
      if ( 'receiverGrid' in w2ui )
        w2ui.receiverGrid.selectNone()

      // If there is a selected receiver...
      if ( this.selectedReceiver )
      {
        // Remove the mouse down callback.
        // Otherwise, we can move this receiver around without selecting it.
        const element = this.map.getIcon( this.selectedReceiver.id )[ 0 ]
        element.onmousedown = null
      }

      this.selectedReceiver = null

      // Clear all selection objects (lines, circle around legend number, etc.)
      const svg = this.map.getSVG()
      if ( svg )
      {
        const selectionArea = svg.find( "#edit" )[ 0 ]
        if ( selectionArea )
          while ( selectionArea.firstChild )
            selectionArea.removeChild( selectionArea.firstChild )
      }

      this._updateButtonEnables()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Convert Cartesian coordinates to polar coordinates.
    // Input:
    //   xStart - Starting x-axis location.
    //   yStart - Starting y-axis location.
    //   xEnd - Finial x-axis location.
    //   yEnd - Finial y-axis location.
    // Output:
    //   Object:
    //     radius - Distance from center.
    //     angle - Angle in radian (-Pi to +Pi).
    //-------------------------------------------------------------------------
    _toPolar( xStart, yStart, xEnd, yEnd )
    {
      // X/Y length of line.
      const xDelta = xStart - xEnd
      const yDelta = yStart - yEnd

      // Convert to Cartesian coordinates to polar coordinates.
      const radius = Math.sqrt( xDelta**2 + yDelta**2 )
      const angle = Math.atan2( yDelta, xDelta )

      return { radius: radius, angle: angle }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Convert polar coordinates to Cartesian coordinates.
    // Input:
    //   xStart - Starting x-axis location.
    //   yStart - Starting y-axis location.
    //   radius - Distance from center.
    //   angle - Angle (in radian).
    // Output:
    //   Object:
    //     x - Finial x-axis location.
    //     y - Finial y-axis location.
    //-------------------------------------------------------------------------
    _polarToCartesian( xStart, yStart, radius, angle )
    {
      // Adjust end point of line so it is on the outside of the label
      // frame.
      const xEnd = xStart + radius * Math.cos( angle )
      const yEnd = yStart + radius * Math.sin( angle )

      return { x: xEnd, y: yEnd }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Convert radians to turns.
    // Input:
    //   angle - Angle in radians (-pi to +pi).
    // Output:
    //   turns - Angle in turns (0-1).
    // Note:
    //   A turn is a single rotation of a circle.
    //-------------------------------------------------------------------------
    _radiansToTurns( angle )
    {
      // Convert radians (0-2*Pi) to turns (0-1).
      const TWO_PI = 2 * Math.PI
      return ( ( TWO_PI + angle ) % TWO_PI ) / TWO_PI
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Draw the line between the legend label and the receiver object.
    // Input:
    //   receiver - Receiver information object.
    //   receiverLabel - SVG element containing label.
    //   lineToLegend - SVG line between receiver label and receiver object.
    //   legendFrame - SVG circle around legend text.
    //-------------------------------------------------------------------------
    _redrawLegendHighlight( receiver, receiverLabel, lineToLegend, legendFrame )
    {
      // Get location to the center of the label.
      const labelBox = receiverLabel.getBBox()
      const xLabel = parseFloat( receiverLabel.getAttribute( "x" ) )
      const yLabel = parseFloat( receiverLabel.getAttribute( "y" ) )
      const xEnd = labelBox.x + labelBox.width / 2
      const yEnd = labelBox.y + labelBox.height / 2

      // Set the positon of the label frame.
      legendFrame.setAttribute( 'cx', xEnd )
      legendFrame.setAttribute( 'cy', yEnd )

      //
      // Calculate the radius and angle between object and label.
      //

      const polar = this._toPolar( receiver.xCenter, receiver.yCenter, xLabel, yLabel )
      const turns = this._radiansToTurns( polar.angle )

      // Store label coordinates.
      receiver.labelRadius = polar.radius
      receiver.labelAngle  = turns

      // Correct the line ending so it lands on the edge of the circular
      // legend label frame.
      const fontSize = this.map.fontSize / 2
      const circlePolar = this._toPolar( receiver.xCenter, receiver.yCenter, xEnd, yEnd )
      const end = this._polarToCartesian( xEnd, yEnd, fontSize, circlePolar.angle )

      // Adjust line between object to legend frame.
      lineToLegend.setAttribute( 'x1', receiver.xCenter )
      lineToLegend.setAttribute( 'y1', receiver.yCenter )
      lineToLegend.setAttribute( 'x2', end.x )
      lineToLegend.setAttribute( 'y2', end.y )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Translate event's position to a point on SVG. $$$DEBUG - Move to SVG assist.
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
      const svg = this.map.getSVG()[ 0 ]
      const point = svg.createSVGPoint()

      // Assign point the mouse position.
      point.x = event.clientX
      point.y = event.clientY

      // Translate the point to SVG coordinates.
      const group = this.map.getSVG().find( "#zoomArea" )[ 0 ]
      const inverse = group.getScreenCTM().inverse()
      const resultPoint = point.matrixTransform( inverse )

      return resultPoint
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Signify that data has changed.
    //-------------------------------------------------------------------------
    _setChanged()
    {
      this._hasChanged = true
      $( "#placementTab_SaveButton" ).addClass( "highlight" )
      $( "#placementTab_MapSelection" ).prop( "disabled", true )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Signify that data no data has changed.
    //-------------------------------------------------------------------------
    _clearChanged()
    {
      this._hasChanged = false
      $( "#placementTab_SaveButton" ).removeClass( "highlight" )
      $( "#placementTab_MapSelection" ).prop( "disabled", false )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Select specified receiver for moving.
    // Input:
    //   receiver - Object with receiver data.
    //-------------------------------------------------------------------------
    _select( receiver )
    {
      const self = this

      // Grab receiver icon already on map.
      const element = this.map.getIcon( receiver.id )[ 0 ]

      // Where in SVG to insert legend frame.
      const insertArea = this.map.getSVG().find( "#edit" )[ 0 ]

      // Clear any existing objects from group.
      this._unselect()

      const configurationReceiver = this.system.receivers[ receiver.id ]
      this.selectedReceiver = $.extend( {}, configurationReceiver, receiver )

      // Line from receiver icon to legend text.
      // NOTE: No initial position as that will be handled elsewhere.
      const lineToLegend =
        document.createElementNS( 'http://www.w3.org/2000/svg', 'line' )
      lineToLegend.setAttribute( 'id', "legendLine" + configurationReceiver.number )
      lineToLegend.setAttribute( "stroke-width", FRAME_STROKE )
      lineToLegend.setAttribute( "stroke", "blue" )
      lineToLegend.setAttribute( "stroke-linecap", "round" )
      insertArea.append( lineToLegend )

      // Get the label for receiver.
      const receiverLabel = this.map.getLabel( configurationReceiver.number )

      // Frame around legend text.
      // NOTE: Highlight color is black but completely opaque.  This
      // allows selection of object without visibly covering the
      // text below.
      const legendFrame =
        document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' )

      const fontSize = this.map.fontSize
      legendFrame.setAttribute( 'r', fontSize / 2 )
      legendFrame.setAttribute( "stroke", "blue" )
      legendFrame.setAttribute( "stroke-width", FRAME_STROKE )
      legendFrame.setAttribute( "fill", CLEAR_COLOR )

      // Draw initial legond line.
      this._redrawLegendHighlight( this.selectedReceiver, receiverLabel, lineToLegend, legendFrame )

      // Highlight legend frame on mouse-over.
      legendFrame.onmouseover = () => legendFrame.setAttribute( "fill", HIGHLIGHT_COLOR )
      legendFrame.onmouseout  = () => legendFrame.setAttribute( "fill", CLEAR_COLOR )

      // Setup drag-and-drop callbacks for legend frame.
      legendFrame.onmousedown =
        function( event )
        {
          // Save old mouse callbacks before taking them over.
          const oldMouseMove = document.onmousemove
          const oldMouseUp = document.onmouseup

          // Need to stop movement of map while moving selected item.
          self.map.panZoomRotate.disable()

          // $$$ self.inhibitUnselect = true

          // Update receiver label position when mouse moves.
          document.onmousemove =
            function( event )
            {
              self._setChanged()
              const newPosition = self._translatePosition( event )

              const box = receiverLabel.getBBox()
              const xLabel = newPosition.x - box.width / 2
              const yLabel = newPosition.y + box.height / 2

              // Move receiver label text.
              receiverLabel.setAttribute( 'x', xLabel )
              receiverLabel.setAttribute( 'y', yLabel )

              self._redrawLegendHighlight( receiver, receiverLabel, lineToLegend, legendFrame )
            }

          // Restore mouse callbacks when mouse button is released.
          document.onmouseup =
            function()
            {
              self.map.panZoomRotate.enable()
              document.onmousemove = oldMouseMove
              document.onmouseup = oldMouseUp

              // $$$ self.inhibitUnselect = false
            }

        }

      insertArea.append( legendFrame )


      // Drag-n-drop callbacks for receiver object.
      element.onmousedown =
        function( event )
        {
          // Save old mouse callbacks before taking them over.
          const oldMouseMove = document.onmousemove
          const oldMouseUp = document.onmouseup

          // $$$ self.inhibitUnselect = true

          // Need to stop movement of map while moving selected item.
          self.map.panZoomRotate.disable()

          document.onmousemove =
            function( event )
            {
              self._setChanged()

              // Figure out the mouse position on the SVG.
              const newPosition = self._translatePosition( event )

              // Get new center location.
              receiver.xCenter = newPosition.x
              receiver.yCenter = newPosition.y

              // Calculate the upper-left corner of the receiver element.
              const box = element.getBBox()
              const x = newPosition.x - box.width / 2
              const y = newPosition.y - box.height / 2

              // Move the receiver object to new location.
              element.setAttribute( 'x', x )
              element.setAttribute( 'y', y )

              // Redraw legend indicator.
              self._redrawLegendHighlight( receiver, receiverLabel, lineToLegend, legendFrame )
            }

          // When the mouse button is released, restore the original
          // mouse controls.
          document.onmouseup =
            function()
            {
              self.map.panZoomRotate.enable()
              document.onmousemove = oldMouseMove
              document.onmouseup = oldMouseUp

              // $$$ self.inhibitUnselect = false
            }

        } // element.onmousedown

      this._updateButtonEnables()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Make each receiver icon selectable.
    //-------------------------------------------------------------------------
    _setupReceiverSelect()
    {
      this.map.setLegendTextEnable( true )
      this.map.enablePanZoom()

      //$( "#floorPlan" ).click( $.proxy( this._unselect(), this ) )

      // $$$DEBUG - Doesn't work.
      // console.log( "Setup receiver select" )
      // const self = this
      // $( "#floorPlan" ).click
      // (
      //   function()
      //   {
      //     console.log( "Unselect" )
      //     self._unselect()
      //   }
      // )

      //for ( const receiver of Object.values( this.system.receivers ) )
      const receivers = this.map.getReceivers()
      if ( receivers )
        for ( const receiver of Object.values( receivers ) )
        {
          // $$$DEBUG - Fix map.getIcon to use receiver id, not number.
          //$$$ const configurationReceiver = this.system.receivers[ receiver.id ]
          const element = this.map.getIcon( receiver.id )
          if ( element )
            element.click( () => this._select( receiver ) )
        }

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Save map layout.
    //-------------------------------------------------------------------------
    _save()
    {
      const self = this

      $( "#placementTab_SaveButton" ).prop( "disabled", true )
      this.system.saveItem
      (
        "maps",
        function()
        {
          //w2alert( 'Receiver placement saved.' )
          $( "#placementTab_SaveButton" ).prop( "disabled", false )
          self._clearChanged()
          self._unselect()
          self._saveBackup()
        }

      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Save a backup of receiver layout so changes can be reverted.
    //-------------------------------------------------------------------------
    _saveBackup()
    {
      // Make a backup of receiver placements (so changes can be reverted).
      // This must be a deep copy so each receiver object is duplicated.
      this.backupMaps = $.extend( true, {}, this.system.maps )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Restore map view to default.
    //-------------------------------------------------------------------------
    _resetView()
    {
      this._mapId = $( "#placementTab_MapSelection option:selected" ).val()

      if ( "" == this._mapId )
        this._mapId = null

      const view =
      {
        xOffset  : 0,
        yOffset  : 0,
        scale    : 1,
        rotation : 0,
        mapId    : this._mapId,
      }

      this.view.changeView( view )
      this.map.setLegendTextEnable( true )
      this.map.enablePanZoom()

      this._setupReceiverSelect()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Revert changes made prompt.
    //-------------------------------------------------------------------------
    _revert()
    {
      const self = this
      w2confirm
      (
        'Discard all changes?',
        function( answer )
        {
          if ( "Yes" == answer )
          {
            self.system.maps = $.extend( true, {}, self.backupMaps )
            self._clearChanged()
            self._unselect()
            self._resetView()
            self._setupGrid()
          }
        }
      )

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Update the list of available maps.
    //-------------------------------------------------------------------------
    _updateMapLists()
    {
      // Flush existing list.
      $( "#placementTab_MapSelection" ).text( "" )

      const maps =
        $.sortArrayOfObjects( Object.values( this.system.maps ), "name" )

      for ( const map of maps )
      {
        const option =
          $( "<option>" )
            .val( map.id )
            .text( map.name )

        $( "#placementTab_MapSelection" ).append( option )
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Setup grid to show all available receivers not already on map.
    //-------------------------------------------------------------------------
    _setupGridRecord()
    {
      // Get the receivers for the selected map.
      const mapReceivers = this.map.getReceivers()

      if ( mapReceivers )
      {
        // Get a sorted list of all receivers.
        const receiverRecords =
          $.sortArrayOfObjects( Object.values( this.system.receivers ), "number" )

        receiverGrid.records = []
        var recordId = 0
        for ( const receiver of receiverRecords )
        {
          // Add any receiver not already on the map.
          if ( ! ( receiver.id in mapReceivers ) )
          {
            const record = $.extend( {}, receiver )
            record.recid = recordId++
            record.typeName = this.system.iconTypes[ receiver.type ].description
            receiverGrid.records.push( record )
          }
        }
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Setup element for a single-click action.
    // Input:
    //   selector - jQuery sele ctor string.
    //   callback - Function to run when element is clicked.
    // Output:
    //   A function to cancel the click.
    //-------------------------------------------------------------------------
    _singleClickFunction( selector, callback )
    {
      const element = $( selector )

      const cancelFunction = () => element.off( 'click', callback )
      element.one( 'click', callback )

      return cancelFunction
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Draw the grid (table) of receivers that can be added to the map.
    //-------------------------------------------------------------------------
    _setupGrid()
    {
      const self = this

      $().w2destroy( "receiverGrid" )

      // Build a look-up table to translate receiver description to type id.
      this.iconTypes = {}
      for ( const receiverType of Object.values( this.system.iconTypes ) )
      {
        const description = this.system.iconTypes[ receiverType.id ].description
        this.iconTypes[ description ] = receiverType.id
      }

      this._setupGridRecord()

      // When a selection is made.
      // Double-callback as the selection isn't available until after the event
      // completes.
      receiverGrid.onSelect = ( event ) => event.onComplete = function()
      {
        const selection = w2ui.receiverGrid.getSelection()
        if ( selection.length == 1 )
        {
          // Get the selection number.
          const selectionIndex = selection[ 0 ]

          // Get the receiver record for this selection.
          //$$$ const receiver = receiverGrid.records[ selectionIndex ]
          const selectedReceiver = receiverGrid.records[ selectionIndex ]
          const receiver =
          {
            id: selectedReceiver.id
          }

          // If there was a previous selection, cancel it.
          if ( self.activeDropCancel )
          {
            self.activeDropCancel()
            self.activeDropCancel = null
          }

          const iconArea = $( "#floorPlan" ).find( "#edit" )[ 0 ]

          const map = self.map.getMapRecord()
          const receiverTypeId = selectedReceiver.type
          const receiverElement = SVG_Assist.addUse( iconArea, receiverTypeId, 0, 0 )

          receiverElement.setAttribute( "width", map.iconSize )
          receiverElement.setAttribute( "height", map.iconSize )

          // Save old mouse callbacks before taking them over.
          const oldMouseMove = document.onmousemove

          // Track mouse movement and update icon position.
          // $$$FUTURE - Move to common function.  Used twice.
          document.onmousemove = function( event )
          {
            // Figure out the mouse position on the SVG.
            const newPosition = self._translatePosition( event )

            // Get new center location.
            receiver.xCenter = newPosition.x
            receiver.yCenter = newPosition.y

            // Calculate the upper-left corner of the receiver element.
            const box = receiverElement.getBBox()
            const x = newPosition.x - box.width / 2
            const y = newPosition.y - box.height / 2

            // Move the receiver object to new location.
            receiverElement.setAttribute( 'x', x )
            receiverElement.setAttribute( 'y', y )
          }

          // Setup a single-click function to drop the selected item on map.
          self.activeDropCancel = self._singleClickFunction
          (
            "#floorPlan",
            function( event )
            {
              // Remove temporary icon.
              receiverElement.remove()

              // Restore original mouse move callback.
              document.onmousemove = null //oldMouseMove

              // Add selected receiver.
              self._addReceiverToMap( event, receiver.id, selectionIndex )
            }
          )
        }
      }

      $( '#placementTab_ReceiversDiv' ).w2grid( receiverGrid )

      // $$$WORKAROUND - Some kind of bug prevents the initial draw from happening.
      // Delaying a bit and forcing a redraw seems to take care of the problem.
      setTimeout( () => w2ui.receiverGrid.refresh(), 100 )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Setup tab for operation.
    //-------------------------------------------------------------------------
    _focus()
    {
      this._updateMapLists()

      const self = this
      $( "#placementTab_MapSelection" )
        .change
        (
          function()
          {
            self._unselect()
            self._resetView()
            self._saveBackup()
            self._setupGrid()

            const mapRecord = self.map.getMapRecord()
            if ( mapRecord )
            {
              $( "#placementTab_IconSize" ).val( mapRecord.iconSize )
              $( "#placementTab_FontSize" ).val( mapRecord.fontSize )
            }
          }
        )
        .trigger( "change" )

      upDownFrame
      (
        "#placementTab_IconFrame",
        function( direction )
        {
          var result = 0
          const mapRecord = self.map.getMapRecord()
          if ( mapRecord )
            result = mapRecord.iconSize

          return result
        },
        function( value, direction )
        {
          const mapRecord = self.map.getMapRecord()

          if ( null !== value )
            mapRecord.iconSize = value

          if ( null !== direction )
            mapRecord.iconSize += direction

          mapRecord.iconSize = Math.max( 0, mapRecord.iconSize )
          self.map.setIconSize( mapRecord.iconSize )
          self._setChanged()

        }
      )

      upDownFrame
      (
        "#placementTab_FontFrame",
        function( direction )
        {
          var result = 0
          const mapRecord = self.map.getMapRecord()
          if ( mapRecord )
            result = mapRecord.fontSize

          return result
        },
        function( value, direction )
        {
          const mapRecord = self.map.getMapRecord()

          if ( null !== value )
            mapRecord.fontSize = value

          if ( null !== direction )
            mapRecord.fontSize += direction

          mapRecord.fontSize = Math.max( 0, mapRecord.fontSize )
          self.map.setFontSize( mapRecord.fontSize )
          self._setChanged()

        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Close out tab.
    //-------------------------------------------------------------------------
    blur()
    {
      this._unselect()

      // Remove receiver icon click callback.
      const svg = $( "#floorPlan" )
      for ( const receiver of Object.values( this.system.receivers ) )
      {
        const element = this.map.getIcon( receiver.id )
        if ( element )
          element.onclick = null
      }

      // Remove grid.
      $().w2destroy( "receiverGrid" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add receiver to map.  Callback used by receiver placement.
    // Input:
    //   event - Mouse event containing position data.
    //   receiverId - Receiver id to be added. $$$DEBUG - Fix name.  Actually the receiver, not id
    //-------------------------------------------------------------------------
    _addReceiverToMap( event, receiverId, recordId )
    {
      const svg = this.map.getSVG()
      var parentOffset = svg.parent().offset()

      const svgDropPoint = this._translatePosition( event )

      const mapId = $( "#placementTab_MapSelection option:selected" ).val()

      // Create receiver record.
      const receiver =
      {
        id : receiverId,
        xCenter : svgDropPoint.x,
        yCenter : svgDropPoint.y,
        labelRadius : 50,
        labelAngle  : 0,
      }

      // Add receiver record to map.
      const receivers = this.system.maps[ mapId ].receivers
      receivers[ receiverId ] = receiver

      // Add the receiver to the map.
      const configurationReceiver = this.system.receivers[ receiverId ]
      const addReceiver = $.extend( {}, configurationReceiver, receiver )
      const element = this.map.addReceiver( addReceiver )

      $( element ).click( () => this._select( receiver ) )
      this._select( receiver )

      // Remove record from list of receivers that can be added.
      // Receiver is now added, and we don't want to allow it to be added again.
      w2ui.receiverGrid.remove( recordId )

      // Added a receiver, so setup has now changed.
      this._setChanged()

      w2ui.receiverGrid.selectNone()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove selected receiver from map.
    //-------------------------------------------------------------------------
    _remove()
    {
      if ( this.selectedReceiver )
      {
        const selectedReceiver = this.selectedReceiver
        this._unselect()

        // Remove the element from the screen.
        this.map.removeReceiver( selectedReceiver )

        // Remove receiver from this map.
        const mapId = $( "#placementTab_MapSelection option:selected" ).val()
        delete this.system.maps[ mapId ].receivers[ selectedReceiver.id ]

        this._setChanged()
        this._setupGrid()
      }
    }

    //-------------------------------------------------------------------------
    // Input:
    //   tab - Instance of `Tab` this tab is running.
    //   accutechAPI - Instance of `AccutechAPI`.
    //   system - Instance of `System`.
    //   map - Instance of `Map`.
    //   view - Instance of `View`.
    //-------------------------------------------------------------------------
    constructor( tab, accutechAPI, system, map, view )
    {
      this.accutechAPI   = accutechAPI
      this.system = system
      this.map           = map
      this.view          = view

      tab.setFocus( $.proxy( this._focus, this ) )
      tab.setBlur( $.proxy( this.blur, this ) )

      this.hasChanged = false

      // This is not null when a receiver is selected but not yet placed on map.
      // This will cancel the drop, used when selection is changed to something
      // else.
      this.activeDropCancel = null

      this.selectedReceiver = null

      $( "#placementTab_SaveButton" )
        .off()
        .click( $.proxy( this._save, this ) )

      $( "#placementTab_ResetViewButton" )
        .off()
        .click( $.proxy( this._resetView, this ) )

      $( "#placementTab_RevertButton" )
        .off()
        .click( $.proxy( this._revert, this ) )

      $( "#placementTab_UnselectButton" )
        .off()
        .click( $.proxy( this._unselect, this ) )

      $( "#placementTab_RemoveButton" )
        .off()
        .click( $.proxy( this._remove, this ) )

      this._updateButtonEnables()
    } // constructor

  } // class
})
