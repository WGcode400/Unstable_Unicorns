//-----------------------------------------------------------------------------
// Uses: Assign working areas to facility.
// Date: 2020-03-16
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/svgAssist",
  "library/uuid4",
  "library/jsonImportExport",
  'vendor/w2ui',
  'vendor/FileSaver',
  'vendor/jquery-ui'
],
function
(
  SVG_Assist,
  uuid4,
  JSON_ImportExport,
  w2ui,
)
{
  // Grid (table) for tag selection.
  const areasGrid =
  {
    name: 'areasGrid',
    show:
    {
      toolbarReload  : false,
      toolbarColumns : false,
      toolbar        : false,
      toolbarDelete  : false
    },

    columns:
    [
      { field: 'description', caption: 'Description', size: "100%" },
    ]
  }

  return class AreasTab
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Update all button/select enables based on current state.
    //-------------------------------------------------------------------------
    _updateButtonEnables()
    {
      var isAreaSelected = false

      if ( "areasGrid" in w2ui )
      {
        const selection = w2ui.areasGrid.getSelection()
        if ( selection.length == 1 )
          isAreaSelected = true
      }


      //$( "#areasTab_Add"         ).prop( "disabled", ! hasChanged || ! isClientSelected )
      $( "#areasTab_Remove"      ).prop( "disabled", ! isAreaSelected )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Open pop-up to edit an area.
    //-------------------------------------------------------------------------
    _editAreaTypePopup( record )
    {
      const self = this

      const iconTypeOptions = []
      for ( const iconType of Object.values( this.system.iconTypes ) )
        iconTypeOptions.push( iconType.description )

      $().w2destroy( "editAreaForm" )
      $().w2form
      (
        {
          name: 'editAreaForm',

          // Record data to edit.
          record: record,

          // No borders as we are using a pop-up window.
          style: 'border: none; background-color: transparent;',

          // All the fields that can be changed.
          fields:
          [
            { field: 'description', type: 'text', required: true, html: { caption: 'Description' } },
          ],

          // Function to validate the content of the form.
          onValidate: function( event )
          {
            // Currently unneeded.
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
                // Update the area record with changed data.
                self._updateRecord( this.record )

                // Save with prompt and save is complete.
                self.system.saveItem
                (
                  "areas",
                  function()
                  {
                    self._setupGrid()
                    $().w2destroy( "editAreaForm" )
                    w2popup.close()
                  }
                ) // saveItem
              }
            } // "save"
          } // actions
        }
      ) // w2form

      // Place form in a pop-up.
      $().w2popup
      (
        'open',
        {
          title   : 'Edit Area',
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
            $( '#w2ui-popup #popupForm' ).w2render( 'editAreaForm' )
          }
        }
      ) // w2popup
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Update the configuration with modified record data.
    //   Called when record has been changed.
    // Input:
    //   record - Area record used by w2ui gird or form.
    // Notes:
    //   Modifies configuration but does not save changes.
    //-------------------------------------------------------------------------
    _updateRecord( record )
    {
      // If there isn't a record, create one.
      if ( ! ( record.id in this.system.areas ) )
      {
        this.system.areas[ record.id ] =
        {
          id: record.id
        }
      }

      // Select record from configuration.
      const area = this.system.areas[ record.id ]

      // Modify record.
      area.description = record.description
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Make an empty record for new area and edit it.
    //-------------------------------------------------------------------------
    _addRecord()
    {
      const recordId = areasGrid.records.length
      const record =
      {
        id: uuid4(),
        recid: recordId,
        description: "",
      }

      this._editAreaTypePopup( record )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Prompt to remove selected area.
    //-------------------------------------------------------------------------
    _removeRecord()
    {
      // Get the selected record to be remove.
      const selection = w2ui.areasGrid.getSelection()
      if ( selection.length == 1 )
      {
        // Make sure the user really wants to remove this area.
        const self = this
        w2confirm
        (
          'Are you sure you want to remove this area?',
          function( answer )
          {
            // Get the area record for this selection.
            const area = areasGrid.records[ selection ]

            // Remove the area from configuration.
            delete self.system.areas[ area.id ]

            // Save the area configuration and update grid.
            self.system.saveItem
            (
              "areas",
              function()
              {
                self.blur()
                self._setupGrid()
              }
            ) // saveItem
          }
        ) // w2confirm
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Setup grid (table) with list of areas.
    //-------------------------------------------------------------------------
    _setupGrid()
    {
      const self = this

      $().w2destroy( "areasGrid" )

      const areaRecords =
        $.sortArrayOfObjects( Object.values( this.system.areas ), "description" )

      areasGrid.records = []
      var recordId = 0
      for ( const area of areaRecords )
      {
        const record = $.extend( {}, area )
        record.recid = recordId++
        areasGrid.records.push( record )
      }

      // Double click on record opens edit pop-up form.
      // Double-callback because event must complete before selection is
      // available.
      areasGrid.onDblClick = ( event ) => event.onComplete = function()
      {
        const grid = w2ui.areasGrid

        const selection = grid.getSelection()
        if ( selection.length == 1 )
        {
          const selectionIndex = selection[ 0 ]

          self._editAreaTypePopup( areasGrid.records[ selectionIndex ] )
          self._updateButtonEnables()
        }
      }

      // Update the button enables when a row is clicked.
      // `onSelect` isn't used because that is only when a row is selected, and
      // we want updates when the selection is cleared as well.
      // Double-callback because event must complete before selection is
      // available.
      areasGrid.onClick = ( event ) => event.onComplete = function()
      {
        self._updateButtonEnables()
      }

      $( '#areasTab_Areas' ).w2grid( areasGrid )

      // $$$WORKAROUND - Some kind of bug prevents the initial draw from happening.
      // Delaying a bit and forcing a redraw seems to take care of the problem.
      setTimeout( () => w2ui.areasGrid.refresh(), 100 )

      this._updateButtonEnables()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Setup tab for operation.
    //-------------------------------------------------------------------------
    _focus()
    {
      this._setupGrid()
      this._updateButtonEnables()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Close out tab.
    //-------------------------------------------------------------------------
    blur()
    {
      $().w2destroy( "areasGrid" )
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

      $( "#areasTab_Add"    ).off().click( $.proxy( this._addRecord, this ) )
      $( "#areasTab_Remove" ).off().click( $.proxy( this._removeRecord, this ) )

    } // constructor

  } // class
})
