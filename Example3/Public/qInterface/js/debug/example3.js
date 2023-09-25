//-----------------------------------------------------------------------------
// Uses: Example 3
// Date: 2021-05-22
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "units/webSocketCRUDNAF",
  "library/urlParameters",
  "library/svgAssist",
  "library/jsonImportExport",
  "library/template",
  "library/uuid4",
],
function
(
  WebSocketCRUDNAF,
  urlParameters,
  SVG_Assist,
  JSON_ImportExport,
  Template,
  uuid4,
)
{
  // Load template.
  const templateQuery =
    $.get
    (
      'templates/example3.template.html',
      function( data )
      {
        $( "body" ).append( data )
      }
    )

  return class DebugClass
  {
    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    _editRecord( record )
    {
      const self = this

      $().w2destroy( "recordForm" )
      $().w2form
      (
        {
          name: 'recordForm',

          // No borders as we are using a pop-up window.
          style: 'border: none; background-color: transparent;',

          record: record,
          fields:
          [
            { name: 'first',     type: 'text', html: { caption: 'First Name',  attr: 'size="40" maxlength="40"' },  required: true,  },
            { name: 'middle',    type: 'text', html: { caption: 'Middle Name', attr: 'size="40" maxlength="40"' }                    },
            { name: 'last',      type: 'text', html: { caption: 'Last Name',   attr: 'size="40" maxlength="40"' },  required: true,  },
            { name: 'address',   type: 'text', html: { caption: 'Address',     attr: 'size="40" maxlength="40"' },  required: true,  },
            { name: 'city',      type: 'text', html: { caption: 'City',        attr: 'size="40" maxlength="40"' },  required: true,  },
            { name: 'state',     type: 'text', html: { caption: 'State',       attr: 'size="40" maxlength="40"' },  required: true,  },
            { name: 'workPhone', type: 'text', html: { caption: 'Phone',       attr: 'size="40" maxlength="40"' },  required: true,  },
          ],

          // Actions (buttons).
          actions:
          {
            //-----------------------------------------------------------------
            // Save record and close pop-up.
            //-----------------------------------------------------------------
            "Save": function ()
            {
              // Check for errors.
              const errors = this.validate()

              // No errors?
              if ( 0 == errors.length )
              {
                self.recordTable.update
                (
                  this.record.id,
                  this.record,
                  function( result )
                  {
                    $().w2destroy( "recordForm" )
                    w2popup.close()
                  }
                )
              }
            },

            //-----------------------------------------------------------------
            // $$$
            //-----------------------------------------------------------------
            "Delete" : function()
            {
              self.recordTable.delete
              (
                this.record.id,
                function( result )
                {
                  $().w2destroy( "recordForm" )
                  w2popup.close()
                }
              )
            },

            //-----------------------------------------------------------------
            // $$$
            //-----------------------------------------------------------------
            "Close" : function()
            {
              $().w2destroy( "recordForm" )
              w2popup.close()
            },
          }

        }
      )

      $().w2popup
      (
        'open',
        {
          title   : 'Edit',
          body    : $( "#example3_EditTemplate" ).html(),
          width   : 600,
          height  : 400,
          showMax : true,

          //-------------------------------------------------------------------
          // $$$
          //-------------------------------------------------------------------
          onOpen: ( event ) => event.onComplete = function ()
          {
            $( '#w2ui-popup #example3_Edit' ).w2render( "recordForm" )
          }
        }
      ) // w2popup
    }

    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    _recordToDiv( record )
    {
      const html = Template.htmlMap( "#example3_Template", record )
      return $( html )
        .addClass( "example3" )
        .click( () => this._editRecord( record ) )
    }

    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    _add( number )
    {
      this.webSocketAPI.makeRequest( "generateRecord.add", number )
    }

    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    _flush()
    {
      this.recordTable.flush()
    }

    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    _deleteRecord( id )
    {
      this.recordTable.delete( id )
    }

    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    show()
    {
      const self = this
      this.isActive = true

      const recordQuery = this.recordTable.readAll()

      // When both records and templates are finished loading...
      $.when( recordQuery, templateQuery ).done
      (
        function( records, templateData )
        {
          if ( records )
          {
            // Clear main
            $( "main" ).html( "" )

            // Create a parent container to hold record records.
            const recordsDiv =
              $( "<div>" )
                .attr( "id", "records" )
                .addClass( "example2_container" )
                .appendTo( "main" )

            // Add all records.
            for ( const record of Object.values( records ) )
              self._recordToDiv( record ).appendTo( recordsDiv )
          }
        }
      )
    }

    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    hide()
    {
      this.isActive = true
    }

    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    constructor( webSocketAPI )
    {
      const self = this
      this.webSocketAPI = webSocketAPI
      this.isActive = false

      // Fetch all records.
      this.recordTable = new WebSocketCRUDNAF( this.webSocketAPI, "records" )

      // Update any records on screen that change.
      this.recordTable.notification
      (
        function( update )
        {
          if ( self.isActive )
          {
            if ( ( "create" == update.type )
              || ( "update" == update.type ) )
            {
              const record = update.data
              const newRendering = self._recordToDiv( record )

              if ( "update" == update.type )
                $( "#record_" + record.id ).replaceWith( newRendering )
              else
                $( "#records" ).append( newRendering )
            }
            else
            if ( "delete" == update.type )
            {
              $( "#record_" + update.data.id ).remove()
            }
            else
            if ( "flush" )
            {
              $( "#records").html( "" )
            }
          }
        }
      )

      $( "#debug_Add"    ).off().click( () => self._add( 1   ) )
      $( "#debug_Add10"  ).off().click( () => self._add( 10  ) )
      $( "#debug_Add100" ).off().click( () => self._add( 100 ) )
      $( "#debug_Flush"  ).off().click( () => self._flush()    )
    }

  }

})
