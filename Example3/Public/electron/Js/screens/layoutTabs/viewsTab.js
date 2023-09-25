//-----------------------------------------------------------------------------
// Uses: Editor to place and position receivers, legend and text.
// Date: 2020-02-17
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/svgAssist",
  "library/uuid4",
  "units/settings",
  'vendor/w2ui',
  'vendor/jquery',
  'vendor/jquery-ui'
],
function
(
  SVG_Assist,
  uuid4,
  Settings,
  w2ui
)
{
  return class ViewsTab
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Update all button/select enables based on current state.
    //-------------------------------------------------------------------------
    _updateButtonEnables()
    {
      const currentMap  = $( "#viewsTab_MapSelect"  ).val()
      const currentView = $( "#viewsTab_ViewSelect" ).val()

      const isMap  = ( "" != currentMap )
      const isView = ( "" != currentView )

      $( "#viewsTab_RemoveViewButton" ).prop( "disabled", ! isView )
      $( "#viewsTab_RenameViewButton" ).prop( "disabled", ! isView )

      $( "#viewsTab_RemoveMapButton"  ).prop( "disabled", ! isMap )
      $( "#viewsTab_RenameMapButton"  ).prop( "disabled", ! isMap )

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Update all select lists.
    //-------------------------------------------------------------------------
    _updateLists()
    {
      const currentMap  = $( "#viewsTab_MapSelect" ).val()
      const currentView = $( "#viewsTab_ViewSelect" ).val()

      // Empty option for map selection.
      const emptyMapOption = $( "<option>" ).val( "" ).text( "" )

      $( "#viewsTab_MapSelect" ).text( "" ).append( emptyMapOption )
      for ( const map of Object.values( this.system.maps ) )
      {
        const option =
          $( "<option>" )
            .val( map.id )
            .text( map.name )

        $( "#viewsTab_MapSelect" ).append( option )
      }

      if ( currentMap )
        $( "#viewsTab_MapSelect" ).val( currentMap )

      // Empty option for view selection.
      // NOTE: Cannot reuse the empty option from maps because it is already
      // assigned to an element.
      const emptyViewOption = $( "<option>" ).val( "" ).text( "" )

      // Clear view selection options.
      $( "#viewsTab_ViewSelect" ).text( "" ).append( emptyViewOption )
      for ( const view of Object.values( this.system.views ) )
      {
        const option =
          $( "<option>" )
            .val( view.id )
            .text( view.label )

        $( "#viewsTab_ViewSelect" ).append( option )
      }

      if ( currentView )
        $( "#viewsTab_ViewSelect" ).val( currentView )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Change to requested map.
    // Input:
    //   mapId - Map to change to.
    //-------------------------------------------------------------------------
    _changeMap( mapId )
    {
      $( "#viewsTab_MapSelect" ).val( mapId ).trigger( "change" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Change to requested view.
    // Input:
    //   viewId - View to change to.
    //-------------------------------------------------------------------------
    _changeView( viewId )
    {
      $( "#viewsTab_ViewSelect" ).val( viewId ).trigger( "change" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Pop-up for adding a new map.
    //-------------------------------------------------------------------------
    _addMapPopup()
    {
      const self = this
      $().w2destroy( "mapAddForm" )
      $().w2form
      (
        {
          name: 'mapAddForm',

          // No borders as we are using a pop-up window.
          style: 'border: none; background-color: transparent;',

          fields:
          [
            { field: 'name', type: 'text', required: true },
            { field: 'file', type: 'file', required: true, html: { attr: 'size="40"' } },
          ],

          // Validate uploaded SVG file.
          onValidate: function( event )
          {
            // Get the contents of the uploaded file.
            const fileData = window.atob( this.record.file[ 0 ].content )

            if ( fileData )
            {
              try
              {
                // Convert file data into XML.
                const xml = $.parseXML( fileData )

                // Search for the main body of the SVG.
                const svg = $( xml ).find( 'svg' )[ 0 ]

                // If the group `#zoomArea` doesn't exist, make it.
                const zoomArea = $( xml ).find( '#zoomArea' )[ 0 ]
                if ( ! zoomArea )
                {
                  // Create the group `#zoomArea`.
                  const group = SVG_Assist.createElement( 'g' )
                  group.setAttribute( "id", "zoomArea" )

                  // Move all children of the SVG into the zoom area group.
                  // The SVG will have no children after this completes.
                  while ( svg.firstChild )
                  {
                    const node = svg.firstChild
                    group.append( node )
                    svg.remove( node )
                  }

                  // Add the zoom area group to the SVG.
                  svg.append( group )
                }

                // Convert the SVG XML data back into text.
                this.record.svgText = new XMLSerializer().serializeToString( svg )
              }
              catch ( error )
              {
                event.errors.push
                (
                  {
                    field: this.get( 'file' ),
                    error: 'Invalid SVG file'
                  }
                )
              }



            }

          },

          // Actions (buttons).
          actions:
          {
            // Save record and close pop-up.
            "save": function ()
            {
              // Check for errors.
              const errors = this.validate()

              // No errors?
              if ( 0 == errors.length )
              {
                // Fetch record data from form.
                const mapName = this.record.name
                const fileData = this.record.svgText

                // Make a new id for both the map entry, and the map
                // asset entry.
                const mapId = uuid4()
                const assetId = uuid4()

                // Add new map record to configuration.
                self.system.maps[ mapId ] =
                {
                  id    : mapId,
                  name  : mapName,
                  image : assetId,
                  iconSize : Settings.DefaultIconSize,
                  fontSize : Settings.DefaultFontSize,
                  receivers : {},
                }

                // Add SVG file to the configuration set of SVG files.
                self.system.svgFiles[ assetId ] = fileData

                // Make requests to have this information committed.
                const addAsset = self.accutechAPI.addAsset( assetId, fileData )
                const saveMaps = self.system.saveItem( "maps" )

                // After the commit requests have finished...
                $.when( addAsset, saveMaps ).done
                (
                  function()
                  {
                    self._updateButtonEnables()
                    self._updateLists()
                    self._changeMap( mapId )

                    w2ui.mapAddForm.clear()
                    w2popup.close()
                  }
                )
              }
            }
          }
        }
      )


      $().w2popup
      (
        'open',
        {
          title   : 'Form in a Popup',
          body    : '<div id="popupForm" style="width: 100%; height: 100%;"></div>',
          style   : 'padding: 15px 0px 0px 0px',
          width   : 500,
          height  : 300,
          showMax : true,

          // When pop-up is open, render the form in the body.
          // W2UI note: Specifying an onOpen handler instead is equivalent to
          // specifying an onBeforeOpen handler, which would make this code
          // execute too early and hence not deliver.  (Hence the double
          // callback.)
          onOpen: ( event ) => event.onComplete = function ()
          {
            $( '#w2ui-popup #popupForm' ).w2render( 'mapAddForm' )
          }
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Pop-up to confirm removing selected map.
    //-------------------------------------------------------------------------
    _removeMapPopup()
    {
      const self = this
      w2confirm
      (
        'Are you sure you want to remove this map?',
        function( answer )
        {
          if ( "Yes" == answer )
          {
            const mapId = self.currentView.mapId
            delete self.system.maps[ mapId ]

            self.system.saveItem
            (
              "maps",
              function()
              {
                self._changeMap( "" )
                self._updateButtonEnables()
                self._updateLists()
              }
            )
          }
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Pop-up for adding a new view.
    //-------------------------------------------------------------------------
    _addViewPopup()
    {
      const self = this
      w2prompt
      (
        {
          label       : 'Label',
          value       : '',
          attrs       : 'style="width: 200px"',
          title       : w2utils.lang( 'New View' ),
          ok_text     : w2utils.lang( 'Ok' ),
          cancel_text : w2utils.lang( 'Cancel' ),
          width       : 400,
          height      : 200
        }
      )
      .ok
      (
        function( value )
        {
          var view

          const mapId = $( "#viewsTab_MapSelect option:selected" ).val()

          var currentView = {}
          if ( "" != mapId )
            currentView = self.map.panZoomRotate.get()

          if ( self.currentView )
            view = $.extend( {}, self.currentView, currentView )
          else
            view =
            {
              "mapId" : null,
              "scale": 1,
              "xOffset": 0,
              "yOffset": 0,
              "rotation": 0
            }

          view.id = uuid4()
          view.label = value
          view.mapId = mapId

          self.system.views[ view.id ] = view
          self.system.saveItem( "views" )

          self._updateLists()
          $( "#viewsTab_ViewSelect" ).val( view.id ).trigger( "change" )
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Save current view.
    //-------------------------------------------------------------------------
    _saveView()
    {
      // If there is a view select, update it to use the current view.
      const viewId = $( "#viewsTab_ViewSelect option:selected" ).val()
      const mapId = $( "#viewsTab_MapSelect option:selected" ).val()
      if ( "" != viewId )
      {
        var currentView = {}
        if ( "" != mapId )
          currentView = this.map.panZoomRotate.get()

        this.currentView =
          $.extend( {}, this.system.views[ viewId ], currentView )

        this.currentView.mapId = mapId

        this.system.views[ viewId ] = this.currentView
      }

      // Disable save button while saving.
      $( "#viewsTab_SaveViewsButton" ).prop( "disabled", true )

      const self = this
      this.system.saveItem
      (
        "views",
        function()
        {
          $( "#viewsTab_SaveViewsButton" ).prop( "disabled", false )
          self._clearChanged()
        }
      )

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Rotate current map.
    // Input:
    //   degrees - Amount of rotation.
    //-------------------------------------------------------------------------
    _rotate( degrees )
    {
      this.map.rotateMap( degrees )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Close out tab.
    //-------------------------------------------------------------------------
    blur()
    {
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Call whenever a change is made.
    //-------------------------------------------------------------------------
    _setChanged()
    {
      const valueSelected = $( "option:selected", this ).val()

      if ( "" != valueSelected )
        $( "#viewsTab_SaveViewsButton" ).addClass( "highlight" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Call whenever a changes made are cleared/saved.
    //-------------------------------------------------------------------------
    _clearChanged()
    {
      $( "#viewsTab_SaveViewsButton" ).removeClass( "highlight" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove selected view prompt.
    //-------------------------------------------------------------------------
    _removeViewPopup()
    {
      const self = this
      w2confirm
      (
        'Are you sure you want to remove this icon type?',
        function( answer )
        {
          if ( "Yes" == answer )
          {
            const currentView = $( "#viewsTab_ViewSelect" ).val()
            delete self.system.views[ currentView ]
            self.system.saveItem
            (
              "views",
              function()
              {
                self._updateButtonEnables()
                self._updateLists()
              }
            )
          }
        }
      )

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove selected view pop-up.
    //-------------------------------------------------------------------------
    _renameViewPopup()
    {
      const self = this
      const viewId = $( "#viewsTab_ViewSelect" ).val()
      const viewName = self.system.views[ viewId ].label
      w2prompt
      (
        {
          label       : 'Name',
          value       : viewName,
          attrs       : 'style="width: 200px"',
          title       : w2utils.lang( 'Rename View' ),
          ok_text     : w2utils.lang( 'Ok' ),
          cancel_text : w2utils.lang( 'Cancel' ),
          width       : 400,
          height      : 200
        }
      )
      .ok
      (
        function( value )
        {
          self.system.views[ viewId ].label = value
          self.system.saveItem( "views" )
          self._updateLists()
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Rename selected map prompt.
    //-------------------------------------------------------------------------
    _renameMapPopup()
    {
      const self = this
      const mapId = $( "#viewsTab_MapSelect" ).val()
      const mapName = self.system.maps[ mapId ].name
      w2prompt
      (
        {
          label       : 'Name',
          value       : mapName,
          attrs       : 'style="width: 200px"',
          title       : w2utils.lang( 'Rename Map' ),
          ok_text     : w2utils.lang( 'Ok' ),
          cancel_text : w2utils.lang( 'Cancel' ),
          width       : 400,
          height      : 200
        }
      )
      .ok
      (
        function( value )
        {
          self.system.maps[ mapId ].name = value
          self.system.saveItem( "maps" )
          self._updateLists()
        }
      )
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
      this.accutechAPI = accutechAPI
      this.system = system
      this.map = map
      this.view = view

      const self = this

      $( "#receiverDescription,#receiverId" ).val( "" )

      map.setLegendTextEnable( true )
      map.enablePanZoom()

      this._updateLists()

      $( "#viewsTab_MapSelect" ).change
      (
        function()
        {
          var valueSelected = $( "option:selected", this ).val()
          var viewSelected = $( "#viewsTab_ViewSelect option:selected" ).val()

          if ( "" == valueSelected )
            valueSelected = null

          self.currentView =
          {
            xOffset  : 0,
            yOffset  : 0,
            scale    : 1,
            rotation : 0,
            mapId    : valueSelected
          }

          view.changeView( self.currentView )

          self.map.setLegendTextEnable( true )
          self.map.enablePanZoom()
          self._setChanged()
          self._updateButtonEnables()
        }
      )

      const viewList = Object.values( system.views )
      if ( viewList.length > 0 )
      {
        this.currentView = viewList[ 0 ]
        view.changeView( this.currentView )
      }

      $( "#viewsTab_ViewSelect" ).change
      (
        function()
        {
          const valueSelected = $( "option:selected", this ).val()

          if ( "" != valueSelected )
          {
            this.currentView = system.views[ valueSelected ]

            $( "#viewsTab_MapSelect" ).val( this.currentView.mapId )
            view.changeView( this.currentView )

            self.map.setLegendTextEnable( true )
            self.map.enablePanZoom()
            if ( self.map.panZoomRotate )
              self.map.panZoomRotate.setChangeCallback( self._setChanged )
          }
          else
            this.currentView = null

          self._updateButtonEnables()
        }
      )

      $( "#viewsTab_AddViewButton"    ).click( $.proxy( this._addViewPopup, this ) )
      $( "#viewsTab_RemoveViewButton" ).click( $.proxy( this._removeViewPopup, this ) )
      $( "#viewsTab_RenameViewButton" ).click( $.proxy( this._renameViewPopup, this ) )

      $( "#viewsTab_SaveViewsButton"  ).click( $.proxy( this._saveView, this ) )

      $( "#viewsTab_AddMapButton"     ).click( $.proxy( this._addMapPopup, this ) )
      $( "#viewsTab_RemoveMapButton"  ).click( $.proxy( this._removeMapPopup, this ) )
      $( "#viewsTab_RenameMapButton"  ).click( $.proxy( this._renameMapPopup, this ) )

      // Rotation buttons.
      $( "#viewsTab_Rotate_0"   ).off().click( () => this._rotate(   0 ) )
      $( "#viewsTab_Rotate_90L" ).off().click( () => this._rotate(  90 ) )
      $( "#viewsTab_Rotate_90R" ).off().click( () => this._rotate( -90 ) )
      $( "#viewsTab_Rotate_180" ).off().click( () => this._rotate( 180 ) )

      $( "#viewsTab_FlushMaps" )
        .off()
        .click
        (
          function()
          {
            self.system.maps = {}
            $( "#viewsTab_MapSelect" ).val( "" )
            self.system.saveItem( "maps", () => w2alert( 'Maps flushed.' ) )
            self._updateButtonEnables()
            self._updateLists()
          }
        )

      $( "#viewsTab_FlushViews" )
        .off()
        .click
        (
          function()
          {
            self.system.views = {}
            $( "#viewsTab_ViewSelect" ).val( "" )
            self.system.saveItem( "views", () => w2alert( 'Views flushed.' ) )
            self._updateButtonEnables()
            self._updateLists()
          }
        )

      this._updateButtonEnables()
    } // constructor

  } // class
})
