//-----------------------------------------------------------------------------
// Uses:
// Date: 2019-12-04
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/urlParameters",
  "library/svgAssist",
  "library/jsonImportExport",
  "library/template",
  "library/uuid4",
  "units/event",
  "debug/tagStatusEdit",
],
function
(
  urlParameters,
  SVG_Assist,
  JSON_ImportExport,
  Template,
  uuid4,
  Event,
  tagStatusEdit,
)
{
  return class DebugClass
  {
    constructor( application )
    {
      $( "#debugButtons" ).show()

      this.application = application

      const self = this
      var panZoomEnable = false

      self.svg = $( "#floorPlan" )

      const parameters = urlParameters()
      if ( parameters.zoom )
      {
        console.log( "Pan/zoom enabled" )
        application.controls.map.enablePanZoom()
        panZoomEnable = true
      }

      if ( parameters.ping )
      {
        SVG_Assist.embedSVG
        (
          self.svg[ 0 ],
          "images/ping.svg",
          215,
          110,
          function( element )
          {
            console.log( element )
            element.setAttribute( "width", 200 )
            element.setAttribute( "height", 200 )
          }
        )
      }

      if ( parameters.system )
        console.log( "Configuration", application.system )

      //$$$ if ( parameters.system )
      //$$$   console.log( "System", application.system )

      if ( ( parameters.debug )
        || ( parameters.tags ) )
      {
        console.log( "Tag import/export enabled" )

        $( "#tagButtons" ).show()

      }

      const currentAlarms = {}
      if ( ( parameters.debug )
        || ( parameters.alarms ) )
      {
        console.log( "Alarm simulator enabled" )

        $( "#alarmButtons" ).show()

        const receivers = application.system.receivers

        const updateFunction =
          function()
          {
            if ( panZoomEnable )
              application.controls.map.enablePanZoom()

            const svg = $( "#floorPlan" )

            const mapReceivers = application.controls.map.getReceivers()

            if ( mapReceivers )
              // Add click callback to set an alarm when icon is clicked.
              for ( const receiver of Object.values( receivers ) )
              {
                if ( receiver.id in mapReceivers )
                {
                  const receiverData = mapReceivers[ receiver.id ]
                  const id = receiverData.iconId
                  const element = application.controls.map.getIcon( receiver.id )
                  if ( element )
                    element.dblclick( () => self.set( receiver.id ) )
                }
              }
          }

        application.controls.map.addMapChangeCallback( updateFunction )
        updateFunction()

        application.controls.mapAlarms.setAlarmIconCallback
        (
          function( element, receiver )
          {
            element.ondblclick = () => self.clear( receiver )
          }
        )
      }

      if ( parameters.debug )
      {
        console.log( "Debug enabled" )

        $( "#debugButtons div" ).show()

        panZoomEnable = true
        application.controls.map.enablePanZoom()
      }

      $( "#debug_SetAlarm" )
        .off()
        .click
        (
          function()
          {
            // Select random receiver number from available receivers.
            const receiverArray  = Object.values( application.system.receivers )
            const receiverIndex  = Math.floor( Math.random() * receiverArray.length )
            const receiverId     = receiverArray[ receiverIndex ].id
            self.set( receiverId )
          }
        )

      $( "#debug_ClearAlarms" ).off().click( () => this.clearAll() )
      $( "#debug_AckAlarms" ).off().click( () => this.acknowledgeAll() )

      $( "#debug_ExportTags" ).off().click
      (
        function()
        {
          JSON_ImportExport.export( self.application.system.tags, "tags.json" )
        }
      )

      $( "#debug_ImportTags" ).off().click
      (
        function()
        {

          JSON_ImportExport.import
          (
            function( patients )
            {
              console.log( "Importing", patients )
              self.application.accutechAPI.patients.replace( patients )
            },

            function( error )
            {
              w2alert( "This file does not contain controller data." )
            }

          )
        }
      )

      $( "#debug_FlushTags" ).off().click
      (
        function()
        {
          self.application.accutechAPI.patients.flush()
        }
      )

      $( "#debug_TagEnables" ).off().click( $.proxy( self._tagPopup, self ) )

      $( "#debug_TagDump" ).off().click( () => console.log( "Tags", self.application.system.tags ) )



      $( "#debug_ButtonA" ).off().click( () => self.application.controls.map.drawConnections() )

      $( "#debug_ButtonB" ).off().click( () => $( "#floorPlan #connections" ).toggle() )

      $( "#debug_ButtonE" ).off().click
      (
        function()
        {
          const receiver = application.system.receiverByNumber( 3 )
          if ( receiver )
            self.set( receiver.id )
        }
      )

      $( "#debug_ButtonF" ).off().click
      (
        function()
        {
          tagStatusEdit( application.webSocketAPI, application.system, application.system )
        }
      )

      $( "#debug_ButtonG" ).off().click
      (
        function()
        {
          self.application.webSocketAPI.cancelAllNotifications
          (
            ( status ) => console.log( status )
          )
        }
      )

      $( "#reload" )
        .off()
        .click
        (
          () => this.application.webSocketAPI.makeRequest( "debugClass.sendReload", [] )
        )


      // this.application.webSocketAPI.requestNotification
      // (
      //   "reload",
      //   () => location.reload( true )
      // )

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Make an alarm active.
    // Input:
    //   receiver - Id of alarm to activate.
    //-------------------------------------------------------------------------
    set( receiver )
    {
      const event =
      {
        "id"              : uuid4(),
        "state"           : Event.EventStates.Active,
        "activateTime"    : Date.now() / 1000,
        "deactivateTime"  : null,
        "acknowledging"   : null,
        "acknowledged"    : null,
        "severity"        : Math.floor( Math.random() * 3 ),
        "type"            : Math.floor( Math.random() * 15 ),
        "receiverId"      : receiver,
        "tag"             : Math.floor( Math.random() * 20 ) + 1,
      }

      this.application.system.crud.events.create( event )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //  Clear all active events.
    //-------------------------------------------------------------------------
    clearAll()
    {
      const requests = {}

      for ( const event of Object.values( this.application.controls.eventsList.activeEvents ) )
        if ( Event.EventStates.Active == event.state )
        {
          event.state = Event.EventStates.Clear
          const parameters =
          [
            event.id,
            event
          ]
          requests[ Math.random() ] = { name: "events.update", parameters : parameters }
        }

      this.application.webSocketAPI.makeRequests( requests )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Acknowledge all events.
    //-------------------------------------------------------------------------
    acknowledgeAll()
    {
      const requests = {}

      for ( const event of Object.values( this.application.controls.eventsList.activeEvents ) )
        requests[ Math.random() ] = { name: "events.delete", parameters : [ event.id ] }

      this.application.webSocketAPI.makeRequests( requests )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Clear an alarm active.
    // Input:
    //   eventId - Id of alarm to clear.
    //-------------------------------------------------------------------------
    clear( eventId )
    {
      const event = this.application.controls.eventsList.get( eventId )

      if ( Event.EventStates.Active == event.state )
      {
        const clearState =
        {
          state : Event.EventStates.Clear
        }

        this.application.system.crud.events.update( event.id, clearState )
      }
      else
      if ( Event.EventStates.Clear == event.state )
        this.application.system.crud.events.delete( event.id )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Popup for modifying active tags.
    //-------------------------------------------------------------------------
    _tagPopup()
    {
      const self = this

      // Destroy form (in case it exists).
      $().w2destroy( "tagSetupGrid" )

      const records = []

      // Make a list of receiver assigned to this controller.
      for ( var tagNumber = 1; tagNumber <= 25; tagNumber += 1 )
      {
        const enabled = ( tagNumber in self.application.system.tags )

        var isLowBattery  = false
        var isBeacon      = false
        var isBand        = false
        if ( enabled )
        {
          const tag = self.application.system.tags[ tagNumber ]
          isLowBattery  = tag.isLowBattery
          isBeacon      = tag.isBeacon
          isBand        = tag.isBand
        }

        records.push
        (
          {
            id            : tagNumber,
            recid         : tagNumber,
            tag           : tagNumber,
            enable        : enabled,
            isLowBattery  : isLowBattery ,
            isBeacon      : isBeacon     ,
            isBand        : isBand       ,
          }
        )
      }

      // Grid (table) for patient selection.
      $().w2grid
      (
        {
          name: 'tagSetupGrid',
          show:
          {
            toolbarReload  : false,
            toolbarColumns : false,
            toolbar        : true,
            toolbarSearch  : false,
            toolbarDelete  : false,
            toolbarColumns : false,
            searchAll : false,
          },

          columns:
          [
            { field: 'recid',        size: 1, caption: 'Tag #'  },
            { field: 'enable',       size: 1, caption: 'Enable',   style: 'text-align: center', editable: { type: 'checkbox', style: 'text-align: center' } },
            { field: 'isLowBattery', size: 1, caption: 'Low Bat.', style: 'text-align: center', editable: { type: 'checkbox', style: 'text-align: center' } },
            { field: 'isBeacon',     size: 1, caption: 'Beacon',   style: 'text-align: center', editable: { type: 'checkbox', style: 'text-align: center' } },
            { field: 'isBand',       size: 1, caption: 'Band',     style: 'text-align: center', editable: { type: 'checkbox', style: 'text-align: center' } },
          ],

          toolbar:
          {
            items:
            [
              { type: 'break' },
              { type: 'button', id: 'enable',  caption: 'Enable All' },
              { type: 'button', id: 'disable', caption: 'Disable All' },
            ],

            onClick: function( target, data )
            {
              const isChecked = ( "enable" == target )

              const requests = []
              for ( const record of Object.values( w2ui.tagSetupGrid.records ) )
              {
                if ( isChecked != record.enable )
                {
                  var request
                  if ( isChecked )
                    request = self.application.system.crud.tags.create( record )
                  else
                    request = self.application.system.crud.tags.delete( record.id )

                  requests.push( request )
                }
              }

              // When all the requests have finished, reload the popup.
              $.when( ...requests ).done
              (
                function()
                {
                  self._tagPopup()
                }
              )
            }
          },

          records: records,

          onChange : ( event ) => event.onComplete = function()
          {
            this.save()
            if ( 1 == event.column )
            {
              if ( event.value_new )
                self.application.system.crud.tags.create( records[ event.index ] )
              else
                self.application.system.crud.tags.delete( event.recid )

              records[ event.index ].enable = event.value_new
            }
            else
            {
              const id = event.recid
              if ( this.records[ event.index ].enable )
                self.application.system.crud.tags.update( id, this.records[ event.index ] )
            }
          }

        }
      )

      $().w2popup
      (
        'open',
        {
          title   : 'Edit Tag Enables',
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
            $( '#w2ui-popup #popupForm' ).w2render( 'tagSetupGrid' )

            // $$$WORKAROUND - Some kind of bug prevents the initial draw from happening.
            // Delaying a bit and forcing a redraw seems to take care of the problem.
            setTimeout
            (
              function()
              {
                w2ui.tagSetupGrid.refresh()
              },
              100
            )

          }
        }
      )
    }
  }

})
