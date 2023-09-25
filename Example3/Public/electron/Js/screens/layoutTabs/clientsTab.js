//-----------------------------------------------------------------------------
// Uses: User interface clients and the views assigned to them.
// Date: 2020-02-24
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/svgAssist",
  "library/uuid4",
  'vendor/w2ui',
  'vendor/jquery-ui'
],
function
(
  SVG_Assist,
  uuid4,
  w2ui
)
{

  // Grid (table) for tag selection.
  const clientViewsGrid =
  {
    name: 'clientViewsGrid',
    show:
    {
      lineNumbers: true,
    },

    reorderRows: true,

    columns:
    [
      //{ field: 'recid', caption: '#',             size: "25%" },
      { field: 'name',  caption: 'Description',   size: "75%" },
    ],

  }

  return class ClientsTab
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Update all button/select enables based on current state.
    //-------------------------------------------------------------------------
    _updateButtonEnables()
    {
      const hasChanged = this._hasChanged
      const currentClient = $( "#clientsTab_ClientSelect" ).val()
      const isClientSelected = ( "" != currentClient )

      if ( this._hasChanged )
        $( "#clientsTab_Save" ).addClass( "highlight" )
      else
        $( "#clientsTab_Save" ).removeClass( "highlight" )

      $( "#clientsTab_Save"         ).prop( "disabled", ! hasChanged || ! isClientSelected )
      $( "#clientsTab_Revert"       ).prop( "disabled", ! hasChanged || ! isClientSelected )
      $( "#clientsTab_RemoveClient" ).prop( "disabled",   hasChanged || ! isClientSelected )
      $( "#clientsTab_RenameClient" ).prop( "disabled",   hasChanged || ! isClientSelected )

      $( "#clientsTab_AddClient"    ).prop( "disabled",   hasChanged  )
      $( "#clientsTab_ClientSelect" ).prop( "disabled",   hasChanged )
      $( "#clientsTab_Add"          ).prop( "disabled", ! isClientSelected )
      $( "#clientsTab_Remove"       ).prop( "disabled", ! this._rowSelect )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Call whenever a change is made to the current client's views.
    //-------------------------------------------------------------------------
    _setChanged()
    {
      this._hasChanged = true
      this._updateButtonEnables()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Call whenever a changes made to the current client's views are
    //   cleared/saved.
    //-------------------------------------------------------------------------
    _clearChanged()
    {
      this._hasChanged = false
      this._updateButtonEnables()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Update select list options.
    //-------------------------------------------------------------------------
    _updateLists()
    {
      const currentClient = $( "#clientsTab_ClientSelect" ).val()

      // Empty option for selection.
      const emptyOption = $( "<option>" ).val( "" ).text( "" )

      $( "#clientsTab_ClientSelect" ).text( "" ).append( emptyOption )
      for ( const clientView of Object.values( this.system.clientViews ) )
      {
        const option =
          $( "<option>" )
            .val( clientView.id )
            .text( clientView.name )

        $( "#clientsTab_ClientSelect" ).append( option )
      }

      if ( currentClient )
        $( "#clientsTab_ClientSelect" ).val( currentClient )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Setup tab for operation.
    //-------------------------------------------------------------------------
    _focus()
    {
      this._updateLists()
      this._updateButtonEnables()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Undo changes prompt.
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
            self._setupGrid()
            self._clearChanged()
          }
        }
      )

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove selected client.
    //-------------------------------------------------------------------------
    _remove()
    {
      const self = this

      const selection = w2ui.clientViewsGrid.getSelection()
      if ( selection.length == 1 )
      {
        // Get the selection number.
        const selectionIndex = selection[ 0 ]

        // Get the record for this selection.
        const record = w2ui.clientViewsGrid.records[ selectionIndex ]

        console.log( record, w2ui.clientViewsGrid.records, selectionIndex )
        // $$$BUG - w2ui can get confused when records are removed
        if ( record )
          w2confirm
          (
            'Remove this record?',
            function( answer )
            {
              if ( "Yes" == answer )
              {
                w2ui.clientViewsGrid.remove( record.recid )
                self._setChanged()
              }
            }
          )
      }

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Setup grid to display list of client views.
    //-------------------------------------------------------------------------
    _setupGrid()
    {
      const self = this

      $().w2destroy( "clientViewsGrid" )

      const clientId = $( "#clientsTab_ClientSelect" ).val()

      if ( "" != clientId )
      {
        const views = this.system.clientViews[ clientId ].views
        clientViewsGrid.records = []
        var recordId = 0
        for ( const view of views )
        {
          const record =
          {
            viewId: view,
            recid : recordId,
            name : this.system.views[ view ].label
          }

          recordId += 1

          clientViewsGrid.records.push( record )
        }

        // Enable remove button when row is selected.
        clientViewsGrid.onSelect = ( event ) => event.onComplete = function()
        {
          self._rowSelect = true
          self._updateButtonEnables()
        }

        // Disable remove button when row is selected.
        clientViewsGrid.onUnselect = ( event ) => event.onComplete = function()
        {
          self._rowSelect = false
          self._updateButtonEnables()
        }

        // If rows are reordered, note there have been changed.
        clientViewsGrid.onReorderRow = ( event ) => event.onComplete = function()
        {
          self._setChanged()
        }

        $( "#clientsTab_Remove" ).prop( 'disabled', true )


        $( '#clientsTab_ViewsDiv' ).w2grid( clientViewsGrid )

        // $$$WORKAROUND - Some kind of bug prevents the initial draw from happening.
        // Delaying a bit and forcing a redraw seems to take care of the problem.
        setTimeout( () => w2ui.clientViewsGrid.refresh(), 100 )
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Save configuration.
    //-------------------------------------------------------------------------
    _save()
    {
      const self = this

      // Get selected client.
      const clientId = $( "#clientsTab_ClientSelect" ).val()

      // Reset views for selected client.
      this.system.clientViews[ clientId ].views = []

      // Rebuild view array for selected client.
      const views = this.system.clientViews[ clientId ].views
      for ( const record of w2ui.clientViewsGrid.records )
        views.push( record.viewId )

      $( "#clientsTab_Save" ).prop( "disabled", true )

      // Save client views.
      this.system.saveItem
      (
        "clientViews",
        function()
        {
          $( "#clientsTab_Save" ).prop( "disabled", false )
          self._clearChanged()
          w2ui.clientViewsGrid.selectNone()
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Close out tab.
    //-------------------------------------------------------------------------
    blur()
    {
      $().w2destroy( "clientViewsGrid" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Update to be called when client is selected.
    //   Updates URL and sets up grid of views.
    //-------------------------------------------------------------------------
    _clientSelect()
    {
      this._setupGrid()
      this._updateButtonEnables()

      // Generate the URL for this client.
      const clientId = $( "#clientsTab_ClientSelect" ).val()
      const url = window.origin + "/?clientId=" + clientId

      // Display the URL.
      $( "#clientsTab_ClientURL" ).val( url )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Copy URL to clipboard.
    //-------------------------------------------------------------------------
    _copyURL()
    {
      const copyText = $( "#clientsTab_ClientURL" )[ 0 ]
      copyText.select()
      copyText.setSelectionRange( 0, 99999 )
      document.execCommand( "copy" )
      w2alert( "URL copied to clipboard." )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a new client view.
    //-------------------------------------------------------------------------
    _addClientView()
    {
      const self = this

      // Use a prompt to collect the name.
      w2prompt
      (
        {
          label       : 'Client name',
          value       : '',
          attrs       : 'style="width: 200px"',
          title       : w2utils.lang( 'New Client' ),
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
          // Create new client view record.
          const clientView =
          {

            id    : uuid4(),
            name  : value,
            views : []
          }

          // Add record to configuration.
          self.system.clientViews[ clientView.id ] = clientView

          // Select new view for editing.
          self._updateLists()
          $( "#clientsTab_ClientSelect" ).val( clientView.id ).trigger( "change" )

          self._setChanged()
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //  Remove selected client view from list.
    //-------------------------------------------------------------------------
    _removeClientView()
    {
      const self = this

      // Get selection.
      const clientId = $( "#clientsTab_ClientSelect" ).val()
      if ( "" != clientId )
      {
        // Confirm view should be removed.
        w2confirm
        (
          'Remove this record?',
          function( answer )
          {
            if ( "Yes" == answer )
            {
              // Remove this view.
              delete self.system.clientViews[ clientId ]

              // Save client views.
              self.system.saveItem
              (
                "clientViews",
                function()
                {
                  $( "#clientsTab_ClientSelect" ).val( "" )
                  self._updateLists()
                  self._clientSelect()
                  self._clearChanged()
                }
              )
            }
          }
        )
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a view to the selected client.
    //-------------------------------------------------------------------------
    _addView()
    {
      const self = this
      if ( w2ui.clientViewsGrid )
      {
        // Make a list of available views.
        const items = []
        for ( const view of Object.values( this.system.views ) )
        {
          const record =
          {
            id: view.id,
            text: view.label
          }

          items.push( record )

        }

        $().w2destroy( "clientViewAddForm" )

        $().w2form
        (
          {
            name: 'clientViewAddForm',
            style: 'border: none; background-color: transparent;',
            fields:
            [
              { field: 'name', type: 'select', required: true, options: { items: items } },
            ],

            actions:
            {
              "add": function ()
              {
                const errors = this.validate()

                if ( 0 == errors.length )
                {
                  const viewId = this.record.name
                  const view = self.system.views[ viewId ]
                  const record =
                  {
                    recid: w2ui.clientViewsGrid.records.length,
                    viewId: view.id,
                    name: view.label
                  }

                  w2ui.clientViewsGrid.add( record )
                  self._setChanged()
                  w2popup.close()
                }
              }
            }
          }
        )
      }

      $().w2popup
      (
        'open',
        {
          title   : 'Add view',
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
            $( '#w2ui-popup #popupForm' ).w2render( 'clientViewAddForm' )
          }
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Rename the selected client view pop-up.
    //-------------------------------------------------------------------------
    _rename()
    {
      const self = this
      const clientViewId = $( "#clientsTab_ClientSelect" ).val()
      const viewName = self.system.clientViews[ clientViewId ].name
      w2prompt
      (
        {
          label       : 'Name',
          value       : viewName,
          attrs       : 'style="width: 200px"',
          title       : w2utils.lang( 'Rename Client View' ),
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
          self.system.clientViews[ clientViewId ].name = value
          self.system.saveItem( "clientViews" )
          self._updateLists()
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Open a new window with the selected client.
    //-------------------------------------------------------------------------
    _openClientView()
    {
      const url = $( "#clientsTab_ClientURL" ).val()
      window.open( url, '_blank' )
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

      // True if changes have been made to the selected client's views.
      this._hasChanged = false

      // True if a row is selected in the client's views' table.
      this._rowSelect = false

      tab.setFocus( $.proxy( this._focus, this ) )
      tab.setBlur( $.proxy( this.blur, this ) )

      // Callback for client selection drop-down.
      $( "#clientsTab_ClientSelect" ).off().change( $.proxy( this._clientSelect, this ) )

      // Setup all the button callbacks.
      $( "#clientsTab_Copy"         ).off().click( $.proxy( this._copyURL, this ) )
      $( "#clientsTab_Save"         ).off().click( $.proxy( this._save, this ) )
      $( "#clientsTab_Revert"       ).off().click( $.proxy( this._revert, this ) )
      $( "#clientsTab_Remove"       ).off().click( $.proxy( this._remove, this ) )
      $( "#clientsTab_RenameClient" ).off().click( $.proxy( this._rename, this ) )
      $( "#clientsTab_Add"          ).off().click( $.proxy( this._addView, this ) )
      $( "#clientsTab_AddClient"    ).off().click( $.proxy( this._addClientView, this ) )
      $( "#clientsTab_RemoveClient" ).off().click( $.proxy( this._removeClientView, this ) )
      $( "#clientsTab_Open"         ).off().click( $.proxy( this._openClientView, this ) )

    } // constructor

  } // class
})
