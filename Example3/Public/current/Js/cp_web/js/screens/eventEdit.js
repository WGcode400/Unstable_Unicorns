//-----------------------------------------------------------------------------
// Uses: Event editing pop-up.
// Date: 2020-01-13
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/uuid4",
  "library/bidirectionalLookup",
  "vendor/w2ui",
  "vendor/jquery"
],
function
(
  uuid4,
  BidirectionalLookup,
  w2ui
)
{
  // Layout of the tag edit area.
  // Two columns: tag selection grid, and selected edit form.
  const layout =
  {
    name: 'layout',
    padding: 4,
    panels:
    [
      { type: 'left', size: '70%', resizable: false, minSize: 300 },
      { type: 'main', minSize: 300 }
    ]
  }

  const eventTypes =
  {
    0  : { source: "server",   name: "Tag Not Present"  , severities : "H"   , actions: "AMCB"   },
    1  : { source: "server",   name: "Lost ZONE Comms"  , severities : "HMLD", actions: "AMZYCB" },
    2  : { source: "server",   name: "Duplicate Receiver ID", severities : "HMLD", actions: "AMZYCB" },
    3  : { source: "receiver", name: "Access Point Exit", severities : "H"   , actions: "AMZYCB" },
    4  : { source: "receiver", name: "Perimeter"        , severities : "HML" , actions: "AMZCB"  },
    5  : { source: "receiver", name: "Access Point Ajar", severities : "HMLD", actions: "AMZCB"  },
    6  : { source: "receiver", name: "Tag Loiter"       , severities : "HMLD", actions: "AMZCB"  },
    7  : { source: "receiver", name: "Band Removal"     , severities : "H"   , actions: "AMCB"   },
    8  : { source: "receiver", name: "Band Compromise"  , severities : "H"   , actions: "AMCB"   },
    9  : { source: "receiver", name: "Fire Panel"       , severities : "HMLD", actions: "A"      },
    10 : { source: "receiver", name: "Reset All"        , severities : "LD"  , actions: "A"      },
    11 : { source: "receiver", name: "Low Tag Battery"  , severities : "H"   , actions: "C"      },
    12 : { source: "receiver", name: "Receiver Error"   , severities : "HMLD", actions: "AMZYCB" },
    13 : { source: "receiver", name: "Controller Reset" , severities : "HMLD", actions: "AMZYCB" },
    14 : { source: "receiver", name: "Low RTC Battery"  , severities : "HMLD", actions: "AMZYCB" },
    15 : { source: "receiver", name: "Tamper"           , severities : "HMLD", actions: "AMZYCB" },
  }

  const eventIdToString = new BidirectionalLookup
  (
    {
      0  : "Tag Not Present",
      1  : "Lost ZONE Comms",
      2  : "Duplicate Receiver ID",
      3  : "Access Point Exit",
      4  : "Perimeter",
      5  : "Access Point Ajar",
      6  : "Tag Loiter",
      7  : "Band Removal",
      8  : "Band Compromise",
      9  : "Fire Panel",
      10 : "Reset All",
      11 : "Low Tag Battery",
      12 : "Receiver Error",
      13 : "Controller Reset",
      14 : "Low RTC Battery",
      15 : "Tamper",
    }
  )

  const severityIdToString = new BidirectionalLookup
  (
    {
      0 : "High",
      1 : "Medium",
      2 : "Low",
      3 : "Disabled"
    }
  )

  const actionIdToString = new BidirectionalLookup
  (
    {
      0 : "Automatic",
      1 : "Manual",
      2 : "Receiver Reset",
      3 : "Receiver Reset + Notes",
      4 : "Client",
      5 : "Client + Notes"
    }
  )

  // Grid (table) for tag selection.
  const grid =
  {
    name: 'grid',

    show:
    {
      toolbarReload  : true,
      toolbarColumns : true,
      toolbar        : true,
      toolbarDelete  : true,
      toolbarSave    : true,
      toolbarAdd     : true,
      toolbarEdit    : true
    },

    columns:
    [
      { field: 'area',        caption: 'Area',        size: "10%", sortable: true, searchable: true },
      { field: 'receiver',        caption: 'Receiver',        size: "5%", sortable: true, searchable: true },
      { field: 'name',        caption: 'Name',        size: "20%", sortable: true, searchable: true },
      {
        field: 'description', caption: 'Description', size: "25%", sortable: true, searchable: true,
        //editable: { type: 'text' }
      },
      {
        field: 'severity',    caption: 'Severity',    size: "10%", sortable: true,
        // editable:
        // {
        //   type: 'select',
        //   items: [ "High", "Medium", "Low", "Disabled" ],
        //
        //   render: function( record, rowIndex, columnIndex )
        //   {
        //     const cellValue = this.getCellValue( rowIndex, columnIndex )
        //     const html = people.find( person => person.id === cellValue ).text
        //
        //     return html
        //   }
        // }

      },
      {
        field: 'action',      caption: 'Action',      size: "20%", sortable: true,
        // editable:
        // {
        //   type: 'select',
        //   items:
        //   [
        //     "Automatic",
        //     "Manual",
        //     "Receiver Reset",
        //     "Receiver Reset + Notes",
        //     "Client",
        //     "Client + Notes"
        //   ],
        //
        //   render: function( record, rowIndex, columnIndex )
        //   {
        //     const cellValue = this.getCellValue( rowIndex, columnIndex )
        //     const html = people.find( person => person.id === cellValue ).text
        //
        //     return html
        //   }
        // }

      },
      { field: 'audio',       caption: 'Audio',       size: "20%", sortable: true },
    ],

    //onSave: (event) => console.log( "Save" ),

  }

  const editForm =
  {
    name   : 'editForm',
    header : 'Edit Event',
    fields :
    [
      {
        field: 'description',
        type: 'test',
        required: true,
        html: { caption: 'Description' }
      },

      {
        field: 'severity',
        type: 'select',
        required: true,
        html: { caption: 'Severity' },
        options:
        {
          items: severityIdToString.values()
        }
      },

      {
        field: 'action',
        type: 'select',
        required: true,
        html: { caption: 'Action' },
        options:
        {
          items: actionIdToString.values()
        }
      },

      {
        field: 'audio',
        type: 'select',
        required: true,
        html: { caption: 'Audio' },
        options:
        {
          items: [ "", "sound A", "sound B", "sound C" ]
        }
      },

    ]
  }

  const receiverList = []
  const receiverNameToId = {}
  const receiverOptions = []

  const addForm =
  {
    name   : 'addForm',
    header : 'Add Event Customization',
    fields :
    [
      {
        field: 'receiver',
        type: 'select',
        required: true,
        html: { caption: 'Receiver' },
        options:
        {
          items: receiverList
        }
      },

      {
        field: 'event',
        type: 'select',
        required: true,
        html: { caption: 'Event' },
        options:
        {
          items: receiverOptions //$.map( eventTypes, (value, key) => value.name )
        }
      },

    ]
  }

  // Load templates.
  const templates = $.get
  (
    'templates/eventEdit.template.html',
    function( data )
    {
      $( "body" ).append( data )
    }
  )

  return class EventEdit
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Launch the pop-up window.
    //-------------------------------------------------------------------------
    _runPopup()
    {
      const self = this

      this.areas = {}
      this.receivers = {}
      this.areaParents = {}
      this.receiverParents = {}


      grid.records = []
      this.recordId = 0
      for ( const item of this.eventGroupRecords )
        this._addRecord( item )

      // Populate list of event types.
      receiverOptions.length = 0
      receiverOptions.push( "&lt;All&gt;" )
      for ( const eventType of Object.values( eventTypes ) )
      {
        //console.log( eventType )
        if ( "receiver" == eventType.source )
          receiverOptions.push( eventType.name )
      }

      addForm.actions =
      {
        // Add this record button.
        'Add': function( event )
        {
          const errors = this.validate()

          if ( errors.length > 0 )
          {
            console.log( "Errors", errors )
            return
          }

          const records = w2ui[ 'grid' ].records
          const recordId = records.length + 1

          // Translate receiver/event name to id.
          this.record.receiver = receiverNameToId[ this.record.receiver ]
          this.record.event = parseInt( eventIdToString.reverse( this.record.event ) )

          var defaultSettings = {}
          for ( const record of self.eventGroupRecords )
          {
            if ( ( "*" == record.receiver )
              && ( this.record.event == record.event ) )
            {
              defaultSettings = record
            }
          }

          //const newRecord = $.extend( {}, defaultSettings, this.record, { recid: recordId } )

          const newRecord = $.extend( {}, defaultSettings, this.record )
          self.eventGroupRecords.push( newRecord )

          //w2ui[ 'grid' ].add( newRecord )
          // const recordIndex = self._addRecord( this.record )
          // console.log( recordIndex, w2ui[ 'grid' ].records )
          //
          // const modifyRecord = w2ui[ 'grid' ].get( recordIndex )
          // if ( modifyRecord )
          // {
          //   modifyRecord.expanded = true
          //   w2ui[ 'grid' ].expand( recordIndex )
          // }
          // else
          // {
          //   const newRecord = records[ records.length - 1 ]
          //   console.log( newRecord )
          //   w2ui[ 'grid' ].add( newRecord )
          // }

          $().w2destroy( "addForm" )
          w2popup.message()

          // $$$DEBUG - Yet to figure out how to refresh records.  Recreate
          // entire grid seems to work.
          $().w2destroy( "grid" )
          self._runPopup()
        },

        'Cancel': function( event )
        {
          $().w2destroy( "addForm" )
          //self._runPopup()
          w2popup.message()
        }
      }



      grid.onSave = () => console.log( "Save" )

      grid.onEdit =
        function( event )
        {
          // Grid support multiple selections.  Only allow editing message
          // box if a single selection has been made.
          const selections = this.getSelection()
          if ( 1 == selections.length )
          {
            // Fetch record data for selection.
            const selection = selections[ 0 ]
            const record = this.get( selection )

            // Put record data into form for editing.
            editForm.record = $.extend( true, {}, record )
            editForm.recid = selection

            // Run popup message.
            w2popup.message
            (
              {
                width   : 800,
                height  : 300,
                html    : '<div id="editEventPopout"></div>',
                onOpen: function()
                {
                  $( '.w2ui-message #editEventPopout' ).w2form( editForm )
                }
              }
            )
          }

        }

      grid.onAdd =
        function()
        {
          w2popup.message
          (
            {
              width   : 800,
              height  : 300,
              html    : '<div id="addEventPopout"></div>',
              onOpen: function()
              {
                $( '.w2ui-message #addEventPopout' ).w2form( addForm )
              }
            }
          )
        }

      grid.onDblClick = function(event)
      {
        console.log(event)
      }

      editForm.actions =
      {
        'Update': function( event )
        {
          // Commit changes.
          w2ui.grid.set( this.recid, this.record )

          // Close message pop-up.
          $().w2destroy( "editForm" )
          w2popup.message()
        },

        'Cancel': function( event )
        {
          // Close message pop-up.
          $().w2destroy( "editForm" )
          w2popup.message()
        }
      }

      $().w2popup
      (
        {
          title   : 'Event Groups',
          body    : '<div id="tagEditPopout"></div>',
          width   : 1000,
          height  : 510,
          showMax : true,
          showClose : true,

          onClose: function()
          {
            self._destroy()
          },

          onOpen: function( event )
          {
            event.onComplete = function()
            {
              $( '#w2ui-popup #tagEditPopout' ).w2grid( grid )


              // $$$WORKAROUND - Some kind of bug prevents the initial draw from happening.
              // Delaying a bit and forcing a redraw seems to take care of the problem.
              setTimeout( () => w2ui.grid.refresh(), 100 )
            }
          },

          //onToggle: (event) => { event.onComplete = () => w2ui.layout.resize() },
        }
      )

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a new record.
    // Input:
    //   item - Event group record to add.
    //-------------------------------------------------------------------------
    _addRecord( item )
    {
      const record = $.extend( {}, item, eventTypes[ item.event ] )
      if ( null === record.receiver )
      {
        record.receiver = "All" // "N/A"
        record.area = "All"
      }
      else
      if ( "*" == record.receiver )
      {
        record.area = "All"
        record.receiver = "All"
      }
      else
        record.area = 0 // $$$DEBUG - Get the area of this receiver.

      if ( ! ( record.area in this.areas )
        && ( "All" != record.area ) )
      {
        this.areas[ record.area ] = []

        const groupRecord =
        {
          recid: this.recordId++,
          area: record.area,
          name: "Area " + record.area,
          w2ui:
          {
            children : this.areas[ record.area ]
          },
          expanded: true
        }

        this.areaParents[ record.area ] = groupRecord.recid
        grid.records.push( groupRecord )
      }

      const area = this.areas[ record.area ]

      if ( ! ( record.receiver in this.receivers ) )
      {
        this.receivers[ record.receiver ] = []

        const receiverRecord =
        {
          recid: this.recordId++,
          area: record.area,
          receiver: record.receiver,
          name: "Receiver " + record.receiver,
          w2ui:
          {
            children : this.receivers[ record.receiver ]
          },
          expanded: true
        }


        if ( "All" != record.area )
        {
          this.receiverParents[ record.receiver ] = this.areaParents[ record.area ]
          area.push( receiverRecord )
        }
        else
        {
          receiverRecord.name = "Global settings"
          this.receiverParents[ record.receiver ] = receiverRecord.recid
          grid.records.push( receiverRecord )
        }
      }

      record.severity = severityIdToString.forward( record.severity )
      record.action = actionIdToString.forward( record.action )

      record.recid = this.recordId++;
      this.receivers[ record.receiver ].push( record )

      return this.receiverParents[ record.receiver ]
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Editor to assign tags.
    // Input:
    //   accutechAPI - Instance of `AccutachAPI`.
    //-------------------------------------------------------------------------
    constructor( accutechAPI, configuration )
    {
      const self = this

      this.accutechAPI = accutechAPI

      // Load the receiver list.
      // $$$FUTURE - Changes to receiver list won't take effect.

      // const configurationLoader =
      //   accutechAPI.loadConfiguration
      //   (
      //     function( configuration )
      //     {
      //       self.system = configuration
      //
      //       // Empty existing array.
      //       // Note: Do not simply create a new array as this array is used
      //       // elsewhere.
      //       receiverList.length = 0
      //       Object.keys( receiverNameToId ).forEach( ( key ) => delete receiverNameToId[ key ] )
      //
      //       // Add all receivers.
      //       system.receivers.forEach
      //       (
      //         function( receiver )
      //         {
      //           // The full name will consist of receiver id and description.
      //           const fullName = receiver.number + " - " + receiver.description
      //
      //           // Add to list.
      //           receiverList.push( fullName )
      //
      //           // Add to look-up table.
      //           receiverNameToId[ fullName ] = receiver.number
      //         }
      //       )
      //
      //     }
      //   )




      for ( const receiver of Object.values( system.receivers ) )
      {
        // The full name will consist of receiver id and description.
        const fullName = receiver.number + " - " + receiver.description

        // Add to list.
        receiverList.push( fullName )

        // Add to look-up table.
        receiverNameToId[ fullName ] = receiver.number
      }

      // Fetch all the tags for the system.
      const eventGroups = accutechAPI.load
      (
        "eventGroups",
        function( records )
        {
          if ( records )
            self.eventGroupRecords = records
          else
          {
            // Default event grouping.
            self.eventGroupRecords =
            [
              { "id" : 0,  "receiver" : null, "event": 0,  "description" : "Tag Not Present"  , "severity" : 0, "action" : 1 },
              { "id" : 1,  "receiver" : null, "event": 1,  "description" : "Lost ZONE Comms"  , "severity" : 2, "action" : 0 },
              { "id" : 2,  "receiver" : null, "event": 2,  "description" : "Duplicate Receiver ID", "severity" : 2, "action" : 0 },
              { "id" : 3,  "receiver" : "*",  "event": 3,  "description" : "Exit Alarm"       , "severity" : 0, "action" : 1 },
              { "id" : 4,  "receiver" : "*",  "event": 4,  "description" : "Perimeter Alarm"  , "severity" : 0, "action" : 1 },
              { "id" : 5,  "receiver" : "*",  "event": 5,  "description" : "Door Ajar"        , "severity" : 2, "action" : 1 },
              { "id" : 6,  "receiver" : "*",  "event": 6,  "description" : "Loiter"           , "severity" : 1, "action" : 1 },
              { "id" : 7,  "receiver" : "*",  "event": 7,  "description" : "Band Alarm"       , "severity" : 0, "action" : 1 },
              { "id" : 8,  "receiver" : "*",  "event": 8,  "description" : "Band"             , "severity" : 0, "action" : 1 },
              { "id" : 9,  "receiver" : "*",  "event": 9,  "description" : "Lock Disabled"    , "severity" : 2, "action" : 0 },
              { "id" : 10, "receiver" : "*",  "event": 10, "description" : "Receiver Reset"   , "severity" : 2, "action" : 0 },
              { "id" : 11, "receiver" : "*",  "event": 11, "description" : "Battery Low"      , "severity" : 0, "action" : 0 },
              { "id" : 12, "receiver" : "*",  "event": 12, "description" : "Receiver Error"   , "severity" : 2, "action" : 0 },
              { "id" : 13, "receiver" : "*",  "event": 13, "description" : "Controller Reset" , "severity" : 2, "action" : 0 },
              { "id" : 14, "receiver" : "*",  "event": 14, "description" : "Low RTC Battery"  , "severity" : 2, "action" : 0 },
              { "id" : 15, "receiver" : "*",  "event": 15, "description" : "Tamper"           , "severity" : 2, "action" : 0 },
            ]

          }
        }
      )
      //
      // $.when( eventGroups, configurationLoader ).done
      // (
      //   function()
      //   {
      //     //const records = self.eventGroupRecords
      //     //records.forEach( ( value ) => value.recid = value.id )
      //     //self._redraw()
      //   }
      // )
      //

      $.when( templates, eventGroups ).done( () => self._runPopup() )
    }


    //-------------------------------------------------------------------------
    // Uses:
    //   Destroy the pop-up.  Closing/error function.
    //-------------------------------------------------------------------------
    _destroy()
    {
      $().w2destroy( "main" )
      $().w2destroy( "grid" )
      $().w2destroy( "layout" )
      $().w2destroy( "editForm" )
      $().w2destroy( "addForm" )
      $().w2destroy( "editForm" )
    }

  }

})
