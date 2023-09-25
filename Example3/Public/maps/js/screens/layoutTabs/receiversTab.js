//-----------------------------------------------------------------------------
// Uses: Editor to place and position receivers, legend and text.
// Date: 2020-02-17
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/svgAssist",
  "library/uuid4",
  "library/jsonImportExport",
  "screens/layoutTabs/editReceiverControllers",
  "units/receiver",

  'vendor/w2ui',

  "library/jquery.sortArrayOfObjects",
  "library/jquery.removePrivate",
  'vendor/jquery-ui'
],
function
(
  SVG_Assist,
  uuid4,
  JSON_ImportExport,
  EditReceiverControllers,
  Receiver,
  w2ui
)
{
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
    ]
  }

  return class ReceiversTab
  {

    //-------------------------------------------------------------------------
    // Uses:
    //   Function to compute a list of what receiver channels a controller has.
    // Input:
    //   controllerId - Controller id to generate list for.
    // Output:
    //    Array of channel options (setup to be a w2ui select option).
    //-------------------------------------------------------------------------
    _computeChannels( controllerId )
    {
      const channelOptions = []
      const controller = this.system.controllers[ controllerId ]
      if ( controller )
      {
        for ( const channel of controller.getPossibleReceivers() )
        {
          const entry =
          {
            id   : channel,
            text : channel,
          }

          channelOptions.push( entry )
        }
      }

      return channelOptions
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Edit specified receiver.
    // Input:
    //   record - Receiver data.
    //-------------------------------------------------------------------------
    _editReceiverPopup( record )
    {
      const self = this

      var currentNumber = record.number

      // Make a list of icon type options.
      const iconTypeOptions = []
      for ( const iconType of Object.values( this.system.iconTypes ) )
      {
        const entry =
        {
          id   : iconType.id,
          text : iconType.description,
        }

        iconTypeOptions.push( entry )
      }

      // Make a list of controller.
      const controllerOptions = []
      for ( const controller of Object.values( this.system.controllers ) )
      {
        const entry =
        {
          id   : controller.id,
          text : controller.description,
        }

        controllerOptions.push( entry )
      }

      // Sort the controller list by description.
      controllerOptions.sort( ( a, b ) => a.text.localeCompare( b.text ) )

      const channelOptions = this._computeChannels( record.controllerId )

      $().w2destroy( "editReceiverForm" )

      $().w2form
      (
        {
          name: 'editReceiverForm',
          style: 'border: none; background-color: transparent;',
          fields:
          [
            { field: 'number',      type: 'text',   required: true, html: { caption: 'Map Label' } },
            { field: 'description', type: 'text',   required: true, html: { caption: 'Description' } },
            { field: 'controllerId',type: 'select', required: true, html: { caption: 'Controller'  }, options: { items: controllerOptions } },
            { field: 'channel',     type: 'select', required: true, html: { caption: 'Receiver #'  }, options: { items: channelOptions    } },
            { field: 'type',        type: 'select', required: true, html: { caption: 'Type'        }, options: { items: iconTypeOptions } },
          ],

          onRefresh: ( event ) => event.onComplete = function()
          {
            const controllerElement = $( w2ui.editReceiverForm.get( 'controllerId' ).el )

            // When changing controllers, update the available channel list.
            controllerElement.change
            (
              function()
              {
                // Fetch the form record for selected channel.
                const formChannel = w2ui.editReceiverForm.get( 'channel' )

                // Change the items list to channels from newly selected controller.
                formChannel.options.items = self._computeChannels( record.controllerId )

                // Tell the form to update the list.
                w2ui.editReceiverForm.refresh( 'channel' )
              }
            )

          },

          onValidate: function(event)
          {
            // Check to see if the selected channel is already assigned to
            // another controller.
            const controller = self.system.controllers[ this.record.controllerId ]
            const existingReceiver = controller.receiverIds[ this.record.channel ]

            // If this channel is currently assigned, and it is not already
            // assigned to this receiver, then there is an error.
            if ( ( existingReceiver )
              && ( existingReceiver != this.record.id ) )
            {
              event.errors.push
              (
                {
                  field: this.get( 'channel' ),
                  error: 'Channel already assigned'
                }
              )
            }

            const receiver = self.system.receiverByNumber( this.record.number )

            if ( ( null !== receiver )
              && ( currentNumber != this.record.number ) )
            {
              event.errors.push
              (
                {
                  field: this.get( 'number' ),
                  error: 'Receiver number already exists'
                }
              )
            }
          },

          actions:
          {
            "save": function ()
            {
              const errors = this.validate()

              if ( 0 == errors.length )
              {
                self._updateRecord( record )

                // $$$DEBUG - Fix this by using the `select` type in form.
                record.typeName = self.system.iconTypes[ record.type ].description

                self.system.saveItems
                (
                  [ "receivers", "controllers" ],
                  function()
                  {
                    self._setupGrid()
                    $().w2destroy( "editReceiverForm" )
                    w2popup.close()
                  }
                )
              }
            }
          }
        }
      )

      if ( record )
        w2ui.editReceiverForm.record = record

      $().w2popup
      (
        'open',
        {
          title   : 'Edit Receiver',
          body    : '<div id="popupForm" style="width: 100%; height: 100%;"></div>',
          style   : 'padding: 15px 0px 0px 0px',
          width   : 500,
          height  : 300,
          showMax : true,

          // onToggle: function (event) {
          //     $(w2ui.foo.box).hide();
          //     event.onComplete = function () {
          //         $(w2ui.foo.box).show();
          //         w2ui.foo.resize();
          //     }
          // },
          onOpen: function (event)
          {
            event.onComplete = function ()
            {
                // specifying an onOpen handler instead is equivalent to specifying an onBeforeOpen handler, which would make this code execute too early and hence not deliver.
                $( '#w2ui-popup #popupForm' ).w2render( 'editReceiverForm' )
            }
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
      if ( ! ( record.id in this.system.receivers ) )
      {
        this.system.receivers[ record.id ] = new Receiver( { id: record.id, } )
      }

      // Select record from configuration.
      const receiver = this.system.receivers[ record.id ]

      // Modify record.
      receiver.number       = record.number
      receiver.description  = record.description
      receiver.type         = record.type
      receiver.controllerId = record.controllerId

      // Remove receiver from old controller.
      const oldController = this.system.getReceiverController( receiver.id )
        oldController.removeReceiver( receiver.channel )

      // Change the channel.
      // Be sure this is done after removal form old controller.
      receiver.channel = parseInt( record.channel )

      // Move receiver to new controller.
      const newController = this.system.controllers[ record.controllerId ]
      newController.addReceiver( receiver.channel, receiver.id )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a new receiver and edit it.
    //-------------------------------------------------------------------------
    _addRecord()
    {
      const recordId = receiverGrid.records.length
      const record =
      {
        id: uuid4(),
        recid: recordId,
        number: "",
        description: "",
        typeName: "",
        controller: "",
      }

      this._editReceiverPopup( record, true )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove selected receiver.
    //-------------------------------------------------------------------------
    _removeRecord()
    {
      const selection = w2ui.receiverGrid.getSelection()
      if ( selection.length == 1 )
      {
        const self = this
        w2confirm
        (
          'Are you sure you want to remove this receiver?',
          function( answer )
          {
            if ( "Yes" == answer )
            {
              const receiver = receiverGrid.records[ selection ]

              // Remove receiver from old controller.
              const controller = self.system.getReceiverController( receiver.id )
              controller.removeReceiver( receiver.channel )

              // Remove receiver.
              delete self.system.receivers[ receiver.id ]

              self.system.saveItems
              (
                [ "receivers", "controllers" ],
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
    //   Close out tab.
    //-------------------------------------------------------------------------
    blur()
    {
      $().w2destroy( "editReceiverForm" )
      $().w2destroy( "receiverGrid" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Display list of receivers.
    //-------------------------------------------------------------------------
    _setupGrid()
    {
      const self = this

      $().w2destroy( "receiverGrid" )

      // Build a look-up table to translate receiver description to type id.
      this.iconTypes = {}
      for ( const iconType of Object.values( this.system.iconTypes ) )
      {
        const description = this.system.iconTypes[ iconType.id ].description
        this.iconTypes[ description ] = iconType.id
      }

      const receiverRecords =
        $.sortArrayOfObjects( Object.values( this.system.receivers ), "number" )

      receiverGrid.records = []
      var recordId = 0
      for ( const receiver of receiverRecords )
      {
        const record = $.extend( {}, receiver )
        record.recid = recordId++
        if ( "type" in receiver )
          record.typeName = this.system.iconTypes[ receiver.type ].description
        else
          record.typeName = ""

        if ( receiver.controllerId in this.system.controllers )
          record.controller = this.system.controllers[ receiver.controllerId ].description
        else
          record.controller = null

        receiverGrid.records.push( record )
      }

      // Double click on record opens edit pop-up form.
      // Double-callback because event must complete before selection is
      // available.
      receiverGrid.onDblClick = ( event ) => event.onComplete = function()
      {
        const grid = w2ui.receiverGrid

        const selection = grid.getSelection()
        if ( selection.length == 1 )
        {
          const selectionIndex = selection[ 0 ]
          self._editReceiverPopup( grid.records[ selectionIndex ], false )
        }
      }


      $( '#receiversTab_ReceiverTable' ).w2grid( receiverGrid )

      // $$$WORKAROUND - Some kind of bug prevents the initial draw from happening.
      // Delaying a bit and forcing a redraw seems to take care of the problem.
      setTimeout( () => w2ui.receiverGrid.refresh(), 100 )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Export receiver data to file prompt.
    //-------------------------------------------------------------------------
    _export()
    {
      const receivers = $.removePrivate( this.system.receivers )
      JSON_ImportExport.export( this.system.receivers, "receivers.json" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Prompt to import receiver configuration.
    //-------------------------------------------------------------------------
    _import( event )
    {
      const self = this
      JSON_ImportExport.import
      (
        function( assets )
        {
          const receivers = {}
          var importedReceivers = 0
          var skippedReceivers = 0
          for ( const receiver of Object.values( assets ) )
          {
            // Make sure the controller for this receiver exists.  Otherwise,
            // the receiver is skipped.
            if ( self.system.controllers[ receiver.controllerId ] )
            {
              receivers[ receiver.id ] = new Receiver( receiver )
              importedReceivers += 1
            }
            else
              skippedReceivers += 1
          }

          // Verify the import before applying changes.
          w2confirm
          (
            importedReceivers + " receivers found, " + skippedReceivers + " skipped. Continue to import?",
            function( answer )
            {
              if ( answer == "Yes" )
              {
                self.system.receivers = receivers

                // Rebuild asset lists.
                self._setupGrid()

                // Send data to server.
                self.system.saveItem
                (
                  "receivers",
                  () => w2alert( "Done." )
                )
              }
            }
          )

        },

        function( error )
        {
          w2alert( "This file does not contain receiver data." )
        }

      )

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Clear out all receiver data.
    //-------------------------------------------------------------------------
    _flush()
    {
      // Flush receiver list.
      this.system.receivers = {}

      // Fix issues removing receivers has caused.
      this.system.validate()

      this._setupGrid()

      const receiverSave = this.system.saveItem( "receivers" )
      const controllerSave = this.system.saveItem( "controllers" )
      $.when( receiverSave, controllerSave ).done( () => w2alert( "Done." ) )
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
      const self = this

      this.accutechAPI   = accutechAPI
      this.system = system
      this.map           = map
      this.view          = view

      tab.setFocus( $.proxy( this._setupGrid, this ) )
      tab.setBlur( $.proxy( this.blur, this ) )

      $( "#receiversTab_AddReceiver"    ).off().click( $.proxy( this._addRecord, this ) )
      $( "#receiversTab_RemoveReceiver" ).off().click( $.proxy( this._removeRecord, this ) )

      $( "#receiversTab_Export" ).off().click( $.proxy( this._export, this ) )
      $( "#receiversTab_Import" ).off().click( $.proxy( this._import, this ) )
      $( "#receiversTab_Flush"  ).off().click( $.proxy( this._flush, this ) )

    } // constructor

  } // class
})
