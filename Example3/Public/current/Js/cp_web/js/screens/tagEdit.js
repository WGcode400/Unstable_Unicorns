//-----------------------------------------------------------------------------
// Uses: Tag editing pop-up.
// Date: 2019-12-02
// Author: Andrew Que (http://www.DrQue.net)
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "units/patient",
  "library/uuid4",
  "vendor/w2ui",
  "vendor/jquery"
],
function
(
  Patient,
  uuid4,
  w2ui
)
{
  // Layout of the patient edit area.
  // Two columns: patient selection grid, and selected edit form.
  const layout =
  {
    name: 'layout',
    padding: 4,
    panels:
    [
      { type: 'left', size: '40%', resizable: false, minSize: 250 },
      { type: 'main', minSize: 300 }
    ]
  }

  // Grid (table) for patient selection.
  const grid =
  {
    name: 'grid',
    show:
    {
      toolbarReload  : false,
      toolbarColumns : false,
      toolbar        : true,
      toolbarDelete  : false
    },

    columns:
    [
      { field: 'tag'  ,   caption: 'Tag',           size: "3",  sortable: true, searchable: true },
      { field: 'first',   caption: 'First Name',    size: "10", sortable: true, searchable: true },
      { field: '_middleInitial',  caption: 'M',      size: "1",  sortable: true, searchable: true },
      { field: 'last',    caption: 'Last Name',     size: "10", sortable: true, searchable: true },
      { field: 'room',    caption: 'Room',          size: "5",  sortable: true, searchable: true },
    ],

  }

  // Form for editing/creating a patient.
  const form =
  {
    header: 'Edit Tag',
    name: 'form',
    fields:
    [
      { name: 'recid',   type: 'text' },
      { name: 'tag',     type: 'int',      html: { caption: 'Tag Id',      attr: 'size="4" maxlength="4"'  } ,  required: true,  },
      { name: 'first',   type: 'text',     html: { caption: 'First Name',  attr: 'size="40" maxlength="40"'  } ,  required: true,  },
      { name: 'middle',  type: 'text',     html: { caption: 'Middle Name', attr: 'size="40" maxlength="40"' }                    },
      { name: 'last',    type: 'text',     html: { caption: 'Last Name',   attr: 'size="40" maxlength="40"'   },  required: true,  },
      { name: 'room',    type: 'int',      required: true },
      { name: 'notes',   type: 'textarea', html: { caption: 'Notes',       attr: 'style="min-width: 300px; height: 90px"' } },
      //$$$ { name: 'addDate', type: 'date',     html: { caption: 'Date',        attr: 'size="25" readonly' }, format: 'yyyy/mm/dd' },
      { name: 'photo',   type: 'file',     html: { caption: 'Photo file' } },
    ]
  }

  // Load templates.
  const templates = $.get
  (
    'templates/tagEdit.template.html',
    function( data )
    {
      $( "body" ).append( data )
    }
  )

  return class TagEdit
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Fill in form with selected row from grid.
    //-------------------------------------------------------------------------
    _selectUpdate()
    {
      const grid = w2ui.grid
      const form = w2ui.form

      const selection = grid.getSelection()
      if ( selection.length == 1 )
      {
        form.id  = selection[ 0 ]
        form.record = $.extend( true, {}, grid.get( selection[ 0 ] ) )
        form.refresh()
      }
      else
      {
        form.clear()
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Update additional fiends of an entry.
    // Input:
    //   entry - Patient information.
    // Output:
    //   Additional data in `entry`.
    //   Nothing is returned.
    //-------------------------------------------------------------------------
    _updateFields( entry )
    {
      if ( entry.middle )
        entry._middleInitial = entry.middle[ 0 ]
      else
        entry._middleInitial = ""
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Display the picture for an entry if there is picture data.
    // Input:
    //   data - Picture data.
    //-------------------------------------------------------------------------
    _showPicture( data )
    {
      if ( null != data )
      {
        const imageSrc = "data:image/png;base64," + data
        $( "#patientPicture" ).show().attr( "src", imageSrc )
      }
      else
        $( "#patientPicture" ).hide().attr( "src", "" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the record id for a given patient number in all grid records.
    // Input:
    //   tagNumber - Tag to look for.
    // Output:
    //   Record id for patient, or `null` if patient was not found.
    //-------------------------------------------------------------------------
    _findTag( tagNumber )
    {
      var recordId = null
      for ( var patient of w2ui.grid.records )
        if ( tagNumber == patient.tag )
          recordId = patient.recid

      return recordId
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Launch the pop-up window.
    // Input:
    //   defaultTag - Tag number to select by default.  `null` for no selection.
    //-------------------------------------------------------------------------
    _runPopup( defaultTag )
    {
      const self = this

      $().w2popup
      (
        'open',
        {
          title   : 'Tag Edit',
          body    : $( "#tagEditPopoutTemplate" ).html(),
          width   : 1200,
          height  : 500,
          showMax : true,

          onClose: function()
          {
            self._destroy()
          },

          onOpen: function( event )
          {
            event.onComplete = function()
            {
              // initialization
              $().w2layout( layout )
              $( '#w2ui-popup #tagEditPopout' ).w2render( 'layout' )
              w2ui.layout.content( 'left', $().w2grid( grid ) )
              w2ui.layout.content( 'main', $( "#tagEditTemplate" ).html() )
              $( "#tagEdit" ).w2form( form )

              // $$$WORKAROUND - Some kind of bug prevents the initial draw from happening.
              // Delaying a bit and forcing a redraw seems to take care of the problem.
              setTimeout
              (
                function()
                {
                  if ( null !== defaultTag )
                  {
                    const recordId = self._findTag( defaultTag )
                    w2ui.grid.select( defaultTag )
                    self._selectUpdate()
                  }
                  w2ui.grid.refresh()
                },
                500
              )
            }
          } // onOpen
        } // 'open'
      ) // w2popup
    } // _runPopup

    //-------------------------------------------------------------------------
    // Uses:
    //   Destroy the pop-up.  Closing/error function.
    //-------------------------------------------------------------------------
    _destroy()
    {
      $().w2destroy( "form" )
      $().w2destroy( "main" )
      $().w2destroy( "grid" )
      $().w2destroy( "left" )
      $().w2destroy( "layout" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Make a w2ui grid record set from a data set.
    // Input:
    //   dataSet - Object of objects holding record data.
    //   additionalCallback( record ) - Allows additional fields to be added
    //     to record.
    // Output:
    //   Array of objects ready for w2iu grids.
    // $$$DEBUG - Move to own unit.
    //-------------------------------------------------------------------------
    _fromSet( dataSet, additionalCallback )
    {
      if ( ! dataSet )
        // If there are no records, use an empty set.
        dataSet = {}
      else
        // Make a copy of the data set.
        dataSet = $.extend( true, {}, dataSet )

      const records = []
      var recordId = 1
      for ( const record of Object.values( dataSet ) )
      {
        // Add record id to data set.
        record.recid = recordId
        recordId += 1

        // Do any additional work to record.
        if ( additionalCallback )
          additionalCallback( record )

        // Add record to results.
        records.push( record )
      }

      return records
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Translate w2ui record back to object set.
    // Input:
    //   records - w2ui records.
    //   keyField - Which field the object set should be keyed by.
    //   additionalCallback( record ) - Callback to modify record further.
    // Output:
    //   Object set (object of objects keyed by specified field of child
    //   object.)
    // $$$DEBUG - Move to own unit.
    //-------------------------------------------------------------------------
    _toSet( records, keyField = "id", additionalCallback = null )
    {
      const dataSet = {}
      for ( const record of records )
      {
        // Remove any private data.
        // Note: We count on the fact this function returns a copy of the
        // record so the actual record isn't modified.
        const newRecord = $.removePrivate( record )

        // Remove w2ui record id field.
        delete newRecord.recid

        // Callback for removing/cleaning up any additional data.
        if ( additionalCallback )
          additionalCallback( newRecord )

        // Store record in set.
        const key = newRecord[ keyField ]
        dataSet[ key ] = newRecord
      }

      return dataSet
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Editor to assign patients.
    // Input:
    //   accutechAPI - Instance of `AccutachAPI`.
    //   defaultTag - Tag number to select by default.  `null` for no selection.
    //-------------------------------------------------------------------------
    constructor( system, defaultTag = null )
    {
      const self = this

      // When a record is selected, place the contents in the edit window.
      grid.onClick = function( event )
      {
        event.onComplete = self._selectUpdate
      }

      // Refresh function also has to show the patient picture and
      // enable/disable delete button.
      form.onRefresh = function( event )
      {
        self._showPicture( this.record.photo )
        $( "button[name='Delete']" ).prop( "disabled", ( undefined == this.record.recid ) )
      }

      // Special change function for when a photo is added.
      form.onChange = function( event )
      {
        if ( "photo" == event.target )
        {
          var content = null
          if ( event.value_new.length )
            content = event.value_new[ 0 ].content

          self._showPicture( content )
        }
      }

      form.actions =
      {
        Reset: function ()
        {
          this.clear()
        },

        Delete: function()
        {
          if ( 0 != this.record.recid )
          {
            w2ui.grid.remove( this.record.recid )

            // Save changes.
            system.crud.patients.delete( this.record.id )

            w2ui.grid.selectNone()
            this.clear()
          }
        },

        Save: function ()
        {
          const errors = this.validate()

          if ( 0 == errors.length )
          {
            if ( this.record.photo )
              this.record.photo = this.record.photo[ 0 ].content

            self._updateFields( this.record )

            if ( ! this.record.recid )
            {
              const id = uuid4()
              const recid = w2ui.grid.records.length + 1

              const newRecord = $.extend( true, this.record, { recid: recid, id: id } )
              w2ui.grid.add( newRecord )

              const saveRecord = $.removePrivate( newRecord )
              delete saveRecord.recid

              system.crud.patients.create( saveRecord )
            }
            else
            {
              w2ui.grid.set( this.id, this.record )

              const saveRecord = $.removePrivate( this.record )
              delete saveRecord.recid

              system.crud.patients.update( saveRecord.id, saveRecord )
            }

            w2ui.grid.selectNone()
            this.clear()
          }
        }
      }

      grid.records = self._fromSet( system.patients, self._updateFields )

      // After the templates are loaded, display the pop-up.
      $.when( templates ).done( () => self._runPopup( defaultTag ) )
    }

  }

})
