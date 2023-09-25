//-----------------------------------------------------------------------------
// Uses: Icons, and audio files.
// Date: 2020-02-17
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
  return class AssetsTab
  {
    //-------------------------------------------------------------------------
    // $$$FUTURE - Button enabled.
    //-------------------------------------------------------------------------


    //-------------------------------------------------------------------------
    // Uses:
    //   Update select list options.
    //-------------------------------------------------------------------------
    _updateLists()
    {
      const currentReceiverType = $( "#assetsTab_ReceiverIcons" ).val()

      // Empty option for icon type selection.
      const emptyReceiverTypeOption = $( "<option>" ).val( "" ).text( "" )

      $( "#assetsTab_ReceiverIcons" ).text( "" ).append( emptyReceiverTypeOption )
      for ( const iconType of Object.values( this.system.iconTypes ) )
      {
        const option =
          $( "<option>" )
            .val( iconType.id )
            .text( iconType.description )

        $( "#assetsTab_ReceiverIcons" ).append( option )
      }

      if ( currentReceiverType )
        $( "#assetsTab_ReceiverIcons" ).val( currentReceiverType )
    }

    // //-------------------------------------------------------------------------
    // // Uses:
    // //   Change the icon file for selected icon type.
    // //-------------------------------------------------------------------------
    // _modifyPopup()
    // {
    //   const self = this
    //   $().w2destroy( "iconTypeModifyForm" )
    //   $().w2form
    //   (
    //     {
    //       name: 'iconTypeModifyForm',
    //
    //       // No borders as we are using a pop-up window.
    //       style: 'border: none; background-color: transparent;',
    //
    //       // All the fields that can be changed.
    //       fields:
    //       [
    //         { field: 'file', type: 'file', required: true },
    //       ],
    //
    //       // Actions (buttons).
    //       actions:
    //       {
    //         // Save record and close pop-up.
    //         "save": function ()
    //         {
    //           // Check for errors.
    //           const errors = this.validate()
    //
    //           // No errors?
    //           if ( 0 == errors.length )
    //           {
    //             // Fetch record data from form.
    //             //const description = this.record.name
    //             const fileData = window.atob( this.record.file[ 0 ].content )
    //
    //             // // Make a new id for both the map entry, and the map
    //             // // asset entry.
    //             // const iconTypeId = uuid4()
    //             // const assetId = uuid4()
    //             //
    //             // // Add new receiver-type record to configuration.
    //             // self.system.iconTypes[ iconTypeId ] =
    //             // {
    //             //   id: iconTypeId,
    //             //   description: description,
    //             //   icon: assetId
    //             // }
    //
    //             const iconTypeId = $( "#assetsTab_ReceiverIcons" ).val()
    //             const iconType = self.system.iconTypes[ iconTypeId ]
    //             const assetId = iconType.icon
    //
    //             // Add SVG file to the configuration set of SVG files.
    //             self.system.svgFiles[ assetId ] = fileData
    //
    //             // Make requests to have this information committed.
    //             const addAsset = self.accutechAPI.addAsset( assetId, fileData )
    //             const saveReceiverTypes = self.system.saveItem( "iconTypes" )
    //
    //             // After the commit requests have finished...
    //             $.when( addAsset, saveReceiverTypes ).done
    //             (
    //               function()
    //               {
    //                 self._updateLists()
    //                 self._changeReceiverType( iconTypeId )
    //                 w2popup.close()
    //               }
    //             )
    //           }
    //         } // "save"
    //       } // actions
    //     }
    //   ) // w2form
    //
    //   $().w2popup
    //   (
    //     'open',
    //     {
    //       title   : 'Form in a Popup',
    //       body    : '<div id="popupForm" style="width: 100%; height: 100%;"></div>',
    //       style   : 'padding: 15px 0px 0px 0px',
    //       width   : 500,
    //       height  : 300,
    //       showMax : true,
    //
    //       // When pop-up is open, render the form in the body.
    //       // W2UI note: Specifying an onOpen handler instead is equivalent to
    //       // specifying an onBeforeOpen handler, which would make this code
    //       // execute too early and hence not deliver.  (Hence the double
    //       // callback.)
    //       onOpen: ( event ) => event.onComplete = function ()
    //       {
    //         $( '#w2ui-popup #popupForm' ).w2render( 'iconTypeModifyForm' )
    //       }
    //     }
    //   )
    // }

    //-------------------------------------------------------------------------
    // Uses:
    //   Pop-up window for adding new icon type.
    //-------------------------------------------------------------------------
    _addReceiverTypePopup()
    {
      // Add new receiver-type record to configuration.
      //self.system.iconTypes[ iconTypeId ] =
      const record =
      {
        id: uuid4(),
        description: "",
        icon: uuid4()
      }

      this._editReceiverTypePopup( record )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Open pop-up to modify record.
    //-------------------------------------------------------------------------
    _modifyPopup()
    {
      const iconTypeId = $( "#assetsTab_ReceiverIcons" ).val()
      const record = this.system.iconTypes[ iconTypeId ]

      this._editReceiverTypePopup( record )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Update asset record in configuration.
    // Input:
    //   record - Record data from W2UI.
    //   description - Description text.
    //   fileData -
    //-------------------------------------------------------------------------
    _updateRecord( record, description, fileData )
    {
      // If there isn't a record, create one.
      if ( ! ( record.id in this.system.iconTypes ) )
      {
        this.system.iconTypes[ record.id ] = { id: record.id }
      }

      // Select record from configuration.
      const iconType = this.system.iconTypes[ record.id ]

      // Modify record.
      iconType.description = description
      iconType.icon        = record.icon

      // Set SVG file in the configuration set of SVG files.
      this.system.svgFiles[ record.icon ] = fileData
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Popup to edit a receiver.
    // Input:
    //   record - w2ui record with receiver data.
    //-------------------------------------------------------------------------
    _editReceiverTypePopup( record )
    {
      const self = this
      $().w2destroy( "iconTypeAddForm" )
      $().w2form
      (
        {
          name: 'iconTypeAddForm',

          record: record,

          // No borders as we are using a pop-up window.
          style: 'border: none; background-color: transparent;',

          // All the fields that can be changed.
          fields:
          [
            { field: 'description', type: 'text', required: true },
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
                self._updateRecord( record, this.record.description, this.record.svgText )

                // Make requests to have this information committed.
                const addAsset = self.accutechAPI.addAsset( record.icon, this.record.svgText )
                const saveReceiverTypes = self.system.saveItem( "iconTypes" )

                // After the commit requests have finished...
                $.when( addAsset, saveReceiverTypes ).done
                (
                  function()
                  {
                    self._updateLists()
                    self._changeReceiverType( record.id )
                    w2popup.close()
                  }
                )
              }
            } // "save"
          } // actions
        }
      ) // w2form

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
            $( '#w2ui-popup #popupForm' ).w2render( 'iconTypeAddForm' )
          }
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Confirm removal of selected icon type.
    //-------------------------------------------------------------------------
    _removeReceiverTypePopup()
    {
      const self = this
      w2confirm
      (
        'Are you sure you want to remove this icon type?',
        function( answer )
        {
          if ( "Yes" == answer )
          {
            const currentReceiverType = $( "#assetsTab_ReceiverIcons" ).val()
            delete self.system.iconTypes[ currentReceiverType ]
            self.system.saveItem
            (
              "iconTypes",
              function()
              {
                self._changeReceiverType( "" )
                self._updateLists()
              }
            )
          }
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Change selection to specified icon type.
    // Input:
    //   id - Which icon type to select.
    //-------------------------------------------------------------------------
    _changeReceiverType( id )
    {
      $( "#assetsTab_ReceiverIcons" ).val( id )
      $( "#assetsTab_ReceiverIcons" ).val( id ).trigger( "change" )
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
    //   Show the icon graphic for the selected icon type.
    //-------------------------------------------------------------------------
    _receiverIconChange()
    {
      $( "#assetTab_selectedIcon" ).text( "" )

      var disabled = true
      const iconTypeId = $( "#assetsTab_ReceiverIcons" ).val()

      if ( iconTypeId in this.system.iconTypes )
      {
        const iconId = this.system.iconTypes[ iconTypeId ].icon
        const icon = this.system.svgFiles[ iconId ]
        const svg = SVG_Assist.addSVG_FromString( "#assetTab_selectedIcon", icon )
        svg.attr( "width", 100 )
        svg.attr( "height", 100 )
        disabled = false
      }

      $( "#assetsTab_ModifyReceiverIcon" ).prop( "disabled", disabled )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Export icon type data to file prompt.
    //-------------------------------------------------------------------------
    _export()
    {
      // Assets consist of icon type system, icon type icons, and
      // audio files.
      const assets =
      {
        iconTypes : this.system.iconTypes,
        svgFiles  : {}
        // $$$FUTURE - Audio files
      }

      for ( const iconType of Object.values( this.system.iconTypes ) )
        assets.svgFiles[ iconType.icon ] = this.system.svgFiles[ iconType.icon ]

      JSON_ImportExport.export( assets, "assets.json" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Prompt to import icon type data.
    //-------------------------------------------------------------------------
    _import( event )
    {
      const self = this
      JSON_ImportExport.import
      (
        function( assets )
        {
          // Check to be sure asset fields exist.
          if ( ! ( "iconTypes" in assets ) )
            throw new SyntaxError( "Receiver types not in JSON" )

          if ( ! ( "svgFiles" in assets ) )
            throw new SyntaxError( "SVG files not in JSON" )

          // Use the icon types.
          self.system.iconTypes = assets.iconTypes

          // Add/replace assets in current configuration.
          for ( const iconType of Object.values( self.system.iconTypes ) )
            self.system.svgFiles[ iconType.icon ] = assets.svgFiles[ iconType.icon ]

          // Rebuild asset lists.
          self._updateLists()

          // Send data to server.
          const iconTypesSave = self.system.saveItem( "iconTypes" )
          const assetsSave    = self.accutechAPI.saveAssetSet( assets.svgFiles )

          // After the commit requests have finished, display a dialog.
          $.when( assetsSave, iconTypesSave ).done( () => w2alert( "Done." ) )
        },

        function( error )
        {
          w2alert( "This file does not contain asset data." )
        }

      )

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Clear out all icon type and asset data.
    //-------------------------------------------------------------------------
    _flush()
    {
      this.system.iconTypes = {}
      this.system.svgFiles = {}
      this._updateLists()

      const iconTypesSave = this.system.saveItem( "iconTypes" )
      const assetsSave    = this.system.saveItem( "svgFiles" )

      $.when( assetsSave, iconTypesSave ).done( () => w2alert( "Done." ) )
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

      tab.setFocus( $.proxy( this._updateLists, this ) )

      $( "#assetsTab_ReceiverIcons" )
        .off()
        .change( $.proxy( this._receiverIconChange, this ) )
        .trigger( "change" )

      $( "#assetsTab_AddReceiverIcon"    ).off().click( $.proxy( this._addReceiverTypePopup, this ) )
      $( "#assetsTab_RemoveReceiverIcon" ).off().click( $.proxy( this._removeReceiverTypePopup, this ) )
      $( "#assetsTab_ModifyReceiverIcon" ).off().click( $.proxy( this._modifyPopup, this ) )

      $( "#assetsTab_Export" ).off().click( $.proxy( this._export, this ) )
      $( "#assetsTab_Import" ).off().click( $.proxy( this._import, this ) )
      $( "#assetsTab_Flush"  ).off().click( $.proxy( this._flush, this ) )

    } // constructor

  } // class
})
