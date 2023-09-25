//-----------------------------------------------------------------------------
// Uses: Edit receiver controllers.
// Date: 2020-03-16
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/uuid4",
  "library/jsonImportExport",
  "units/controller",
  "units/receiver",
  'vendor/w2ui'
],
function
(
  uuid4,
  JSON_ImportExport,
  Controller,
  Receiver,
  w2ui,
)
{
  // Grid (table) for tag selection.
  const controllersGrid =
  {
    name: 'controllersGrid',
    show:
    {
      toolbarReload  : false,
      toolbarColumns : false,
      toolbar        : false,
      toolbarDelete  : false
    },

    columns:
    [
      { field: 'area', caption: 'Area', size: "20%" },
      { field: 'address', caption: 'Addr', size: "10%" },
      { field: 'description', caption: 'Name', size: "70%" },
    ]
  }

  return class ControllersTab
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Update all button/select enables based on current state.
    //-------------------------------------------------------------------------
    _updateButtonEnables()
    {
      var isControllerSelected = false

      if ( "controllersGrid" in w2ui )
      {
        const selection = w2ui.controllersGrid.getSelection()
        if ( selection.length == 1 )
          isControllerSelected = true
      }

      $( "#controllersTab_Remove"      ).prop( "disabled", ! isControllerSelected )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Edit controller pop-up.
    //-------------------------------------------------------------------------
    _editControllerTypePopup( record )
    {
      const self = this

      var currentAddress = record.address

      // Destroy form (in case it exists).
      $().w2destroy( "editControllerForm" )

      // Make a list of receiver assigned to this controller.
      for ( const [ channel, receiverId ] of Object.entries( record.receiverIds ) )
      {
        const receiver = this.system.receivers[ receiverId ]
        record[ "rx" + channel ] = receiver.description
      }

      // Get the list of areas sorted by description.
      const areas =
        $.sortArrayOfObjects( Object.values( this.system.areas ), "description" )

      // Make an options list of areas.
      const areaOptions = []
      for ( const area of areas )
      {
        const entry =
        {
          id   : area.id,
          text : area.description,
        }

        areaOptions.push( entry )
      }

      $().w2form
      (
        {
          name: 'editControllerForm',
          style: 'border: none; background-color: transparent;',
          fields:
          [
            { field: 'areaId', type: 'select', required: true, html: { caption: 'Area' }, options: { items: areaOptions } },

            { field: 'description', type: 'text', required: true, html: { caption: 'Description' } },

            { field: 'address', type: 'int', required: true, html: { caption: 'Controller Address' } },

            { field: 'isDoor', type: 'checkbox', html: { caption: 'Is a door?' } },
            { field: 'isTx',   type: 'checkbox', html: { caption: 'Has Tx board?' } },

            { field: 'rx0', type: 'text', html: { caption: 'Channel 0' } },
            { field: 'rx1', type: 'text', html: { caption: 'Channel 1' } },
            { field: 'rx2', type: 'text', html: { caption: 'Channel 2' } },

            { field: 'rx3', type: 'text', html: { caption: 'Channel 3' } },
            { field: 'rx4', type: 'text', html: { caption: 'Channel 4' } },
            { field: 'rx5', type: 'text', html: { caption: 'Channel 5' } },

            { field: 'rx6', type: 'text', html: { caption: 'Channel 6' } },
            { field: 'rx7', type: 'text', html: { caption: 'Channel 7' } },
            { field: 'rx8', type: 'text', html: { caption: 'Channel 8' } },

          ],

          record : record,

          // Function to run after drawing form.
          // Used to make read-only form elements.
          onRefresh: ( event ) => event.onComplete = function()
          {
            // All the assigned receiver read-only.
            $( w2ui.editControllerForm.get( 'rx0' ).el ).prop( 'disabled', true )
            $( w2ui.editControllerForm.get( 'rx1' ).el ).prop( 'disabled', true )
            $( w2ui.editControllerForm.get( 'rx2' ).el ).prop( 'disabled', true )
            $( w2ui.editControllerForm.get( 'rx3' ).el ).prop( 'disabled', true )
            $( w2ui.editControllerForm.get( 'rx4' ).el ).prop( 'disabled', true )
            $( w2ui.editControllerForm.get( 'rx5' ).el ).prop( 'disabled', true )
            $( w2ui.editControllerForm.get( 'rx6' ).el ).prop( 'disabled', true )
            $( w2ui.editControllerForm.get( 'rx7' ).el ).prop( 'disabled', true )
            $( w2ui.editControllerForm.get( 'rx8' ).el ).prop( 'disabled', true )
          },

          onValidate: function( event )
          {
            const controller = self.system.controllerByAddress( this.record.address )

            if ( ( null !== controller )
              && ( currentAddress != this.record.address ) )
            {
              event.errors.push
              (
                {
                  field: this.get( 'address' ),
                  error: 'Address already assigned'
                }
              )
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
                self._updateRecord( this.record )

                // Lock form to signal saving process.
                w2ui.editControllerForm.lock( '', true )
                w2ui.controllersGrid.lock( '', true )

                self.system.saveItem
                (
                  "controllers",
                  function()
                  {
                    $().w2destroy( "editControllerForm" )
                    self._setupGrid()
                    w2ui.controllersGrid.unlock()
                    w2popup.close()
                  }
                )
              }
            } // "save"
          } // actions
        }
      )

      $().w2popup
      (
        'open',
        {
          title   : 'Edit controller',
          body    : '<div id="popupForm" style="width: 100%; height: 100%;"></div>',
          style   : 'padding: 15px 0px 0px 0px',
          width   : 500,
          height  : 600,
          showMax : true,

          // When pop-up is open, render the form in the body.
          // W2UI note: Specifying an onOpen handler instead is equivalent to
          // specifying an onBeforeOpen handler, which would make this code
          // execute too early and hence not deliver.  (Hence the double
          // callback.)
          onOpen: ( event ) => event.onComplete = function ()
          {
            $( '#w2ui-popup #popupForm' ).w2render( 'editControllerForm' )
          }
        }
      )
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
      if ( ! ( record.id in this.system.controllers ) )
      {
        // Create mostly empty controller record.
        this.system.controllers[ record.id ] = new Controller
        (
          {
            id: record.id,
            receiverIds: {},
          }
        )
      }

      // Fetch the selected controller from configuration.
      const controller = this.system.controllers[ record.id ]

      // Update fields.
      controller.areaId       = record.areaId
      controller.description  = record.description
      controller.address      = record.address
      controller.isDoor       = record.isDoor
      controller.isTx         = record.isTx
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a new controller and edit it.
    //-------------------------------------------------------------------------
    _addRecord()
    {
      const recordId = controllersGrid.records.length
      const controller = new Controller
      (
        {
          id: uuid4(),
          recid: recordId,
          description: "",
          isDoor : true,
          isTx : true,
          receiverIds: {},
        }
      )

      this._editControllerTypePopup( controller )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove selected record.
    //-------------------------------------------------------------------------
    _removeRecord()
    {
      // Get selection.
      const selection = w2ui.controllersGrid.getSelection()
      if ( selection.length == 1 )
      {
        // Fetch controller.
        const controller = controllersGrid.records[ selection ]
        const receiversIds = Object.values( controller.receiverIds )
        const receiverCount = receiversIds.length

        var receiverText = ""
        if ( receiverCount > 0 )
          receiverText =
            "<br />The " + receiverCount + " receiver(s) connected will also be removed."

        // Verify removal.
        const self = this
        w2confirm
        (
          'Are you sure you want to remove this controller?' + receiverText,
          function( answer )
          {
            if ( "Yes" == answer )
            {
              // Remove record.
              self.system.deleteController( controller.id )

              // Save and close.
              self.system.saveItems
              (
                [ "controllers", "receivers" ],
                function()
                {
                  self.blur()
                  self._setupGrid()
                }
              )
            }
          }
        )
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Draw table of controllers.
    //-------------------------------------------------------------------------
    _setupGrid()
    {
      const self = this

      $().w2destroy( "controllersGrid" )

      const controllers = Object.values( this.system.controllers )

      // Sort controllers by description text.
      const controllerRecords =
        $.sortArrayOfObjects( controllers, "description" )

      // Make records for grid.
      controllersGrid.records = []
      var recordId = 0
      for ( const controller of controllerRecords )
      {
        const record = $.extend( {}, controller )
        record.area = this.system.getControllerArea( controller.id ).description
        record.recid = recordId++
        controllersGrid.records.push( record )
      }

      // Double click on record opens edit pop-up form.
      // Double-callback because event must complete before selection is
      // available.
      controllersGrid.onDblClick = ( event ) => event.onComplete = function()
      {
        const grid = w2ui.controllersGrid

        const selection = grid.getSelection()
        if ( selection.length == 1 )
        {
          const selectionIndex = selection[ 0 ]

          self._editControllerTypePopup( controllersGrid.records[ selectionIndex ] )
          self._updateButtonEnables()
        }
      }

      // Update the button enables when a row is clicked.
      // `onSelect` isn't used because that is only when a row is selected, and
      // we want updates when the selection is cleared as well.
      // Double-callback because event must complete before selection is
      // available.
      controllersGrid.onClick = ( event ) => event.onComplete = function()
      {
        self._updateButtonEnables()
      }

      $( '#controllersTab_Controllers' ).w2grid( controllersGrid )

      // $$$WORKAROUND - Some kind of bug prevents the initial draw from happening.
      // Delaying a bit and forcing a redraw seems to take care of the problem.
      setTimeout( () => w2ui.controllersGrid.refresh(), 100 )

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
    //   Area selection callback.
    //-------------------------------------------------------------------------
    _areaSelect()
    {
      this._setupGrid()
      this._updateButtonEnables()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Export icon type data to file prompt.
    //-------------------------------------------------------------------------
    _export()
    {
      JSON_ImportExport.export( this.system.controllers, "controllers.json" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Prompt to import controller data.
    //-------------------------------------------------------------------------
    _import( event )
    {
      const self = this
      JSON_ImportExport.import
      (
        function( assets )
        {
          for ( const controller of Object.values( assets ) )
          {
            // Remove receivers from controllers.
            // Do this because there are only controllers in this list, not
            // receivers.
            controller.receiverIds = []

            self.system.controllers[ controller.id ] = new Controller( controller )
          }

          // Rebuild asset lists.
          self._setupGrid()

          // Send data to server.
          self.system.saveItem
          (
            "controllers",
            () => w2alert( "Done." )
          )
        },

        function( error )
        {
          w2alert( "This file does not contain controller data." )
        }

      )

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Clear out all controller data.
    //-------------------------------------------------------------------------
    _flush()
    {
      // Flush receiver list.
      this.system.controllers = {}

      // Fix issues removing receivers has caused.
      this.system.validate()

      this._setupGrid()

      const receiverSave = this.system.saveItem( "receivers" )
      const controllerSave = this.system.saveItem( "controllers" )
      $.when( receiverSave, controllerSave ).done( () => w2alert( "Done." ) )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Close out tab.
    //-------------------------------------------------------------------------
    blur()
    {
      $().w2destroy( "controllersGrid" )
      $().w2destroy( "editControllerForm" )
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

      $( "#controllersTab_Add"    ).off().click( $.proxy( this._addRecord, this ) )
      $( "#controllersTab_Remove" ).off().click( $.proxy( this._removeRecord, this ) )

      $( "#controllersTab_Export" ).off().click( $.proxy( this._export, this ) )
      $( "#controllersTab_Import" ).off().click( $.proxy( this._import, this ) )
      $( "#controllersTab_Flush"  ).off().click( $.proxy( this._flush, this ) )

    } // constructor

  } // class
})
