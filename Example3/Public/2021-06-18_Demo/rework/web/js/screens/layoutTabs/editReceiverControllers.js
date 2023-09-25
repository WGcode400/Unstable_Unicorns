//-----------------------------------------------------------------------------
// Uses: Pop-up for editing receiver settings.
// Date: 2020-02-11
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/svgAssist",
  "library/tabs",
  "vendor/w2ui",
  "vendor/jquery"
],
function
(
  SVG_Assist,
  tabs,
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
      toolbar        : true,
      toolbarDelete  : false
    },

    columns:
    [
      { field: 'id',           caption: 'Receiver #',    size: "10%", sortable: true, searchable: true },
      { field: 'description',  caption: 'Description',   size: "60%", sortable: true, searchable: true },
      { field: 'mapId',        caption: 'Map',           size: "20%", sortable: true, searchable: true },
      { field: 'type',         caption: 'Type',          size: "20%", sortable: true, searchable: true },
    ]
  }


  return class EditReceiverControllers
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Destroy the pop-up.  Closing/error function.
    //-------------------------------------------------------------------------
    _destroy()
    {
      $().w2destroy( "receiverGrid" )
    }

    //-------------------------------------------------------------------------
    // Input:
    //   system - Instance of `System`.
    //-------------------------------------------------------------------------
    constructor( configuration )
    {
      receiverGrid.records = []
      var recordId = 0
      for ( const receiver of Object.values( system.receivers ) )
      {
        const record = $.extend( {}, receiver )
        record.recid = recordId++
        receiverGrid.records.push( record )
      }

      const self = this
      $().w2popup
      (
        {
          title   : 'Edit Receiver Controllers',
          body    : '<div id="tagEditPopout"></div>',
          width   : 1000,
          height  : 510,
          showMax : true,
          showClose : true,

          onClose: function()
          {
            self._destroy()
          },

          onOpen: ( event ) => event.onComplete = function ()
          {
            $( '#w2ui-popup #tagEditPopout' ).w2grid( receiverGrid )


            // $$$WORKAROUND - Some kind of bug prevents the initial draw from happening.
            // Delaying a bit and forcing a redraw seems to take care of the problem.
            setTimeout( () => w2ui.receiverGrid.refresh(), 100 )
          },
        }
      )


    } // constructor

  } // class

})
