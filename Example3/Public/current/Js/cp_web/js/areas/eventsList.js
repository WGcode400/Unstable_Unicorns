//-----------------------------------------------------------------------------
// Uses: Event notification handling.
// Date: 2019-12-03
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "units/tag",
  "library/uuid4",
  "units/event",
  "units/settings",
  "library/template",
  "library/svgAssist",
  "vendor/w2ui",
  "vendor/jquery-ui"
],
function
(
  Tag,
  uuid4,
  Event,
  Settings,
  Template,
  SVG_Assist,
  TagEdit,
  w2ui
)
{
  // $$$DEBUG - Temporary.
  const LEVEL_ICONS =
  [
    "images/error.svg",
    "images/warning.svg",
    "images/information.svg",
  ]

  // Load templates.
  const templates = $.get
  (
    'templates/alarms.template.html',
    function( data )
    {
      // $$$DEBUG - Place them in the body, or use a separate XML object?
      $( "body" ).append( data )
    }
  )

  return class Events
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Update the alarm indication area.
    //-------------------------------------------------------------------------
    _updateAlarms()
    {
      const alarmCount = Object.keys( this.activeEvents ).length
      $( "#alarmCount" ).text( alarmCount )

      var areHighPriorityAlarms = false
      var areAlarms = false
      for ( const event of Object.values( this.activeEvents ) )
      {
        areHighPriorityAlarms |= ( event.severity <= Event.Level.Low )
        areAlarms |= ( Event.Level.Message != event.severity )
      }

      if ( areAlarms )
      {
        // Start bell animate.
        // (Only if not begun.  Otherwise animation doesn't stop.)
        if ( ! this.wereAlarms )
        {
          const svg = SVG_Assist.getSVG_InObject( "#alarmBellImage" )
          SVG_Assist.setAnimate( svg, true )
        }

        if ( areHighPriorityAlarms )
          this.leftPanel.showAlarms()
      }
      else
      {
        // Stop bell animate.
        const svg = SVG_Assist.getSVG_InObject( "#alarmBellImage" )
        SVG_Assist.setAnimate( svg, false )

        this.leftPanel.hideAlarms()
      }

      //
      // Adjust size of alarms area.
      //

      // Get number of active events.
      const events = Object.keys( this.activeEvents ).length

      // Get size of events area if every event is displayed.
      const eventsFullSize = this.alarmBodyHeight * events

      // Make events area the minimum between full-size and 50%.
      const size = "min( " + eventsFullSize + "px, 50% )"

      // Set the new size constraints.
      $( "#alarmDiv" ).height( size )

      this.wereAlarms = areAlarms
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Update current information in event pop-up.  Call whenever event
    //   information changes.
    // Notes:
    //   Safe to call when pop-up isn't displayed.
    //-------------------------------------------------------------------------
    _updateEventPopup()
    {
      // Is the pop-up currently displayed?
      if ( null !== this.popUpEvent )
      {
        const activeEvents = Object.keys( this.activeEvents )
        const currentIndex = activeEvents.indexOf( this.popUpEvent )

        $( "#alarmDetailButtons_Previous" ).prop( "disabled", ( 0 == currentIndex ) )
        $( "#alarmDetailButtons_Next" )
          .prop( "disabled", ( currentIndex >= ( activeEvents.length - 1 ) ) )

        const event = this.activeEvents[ this.popUpEvent ]
        if ( event )
        {
          const state = event.state

          // In any state but clear, disable acknowledge and notes.
          if ( Event.EventStates.Clear != state )
          {
            $( "#eventNotes" ).attr( "disabled", "disabled" )
            $( "#alarmDetailButtons_Acknowledge" ).attr( "disabled", "disabled" )
          }
          else
          {
            $( "#eventNotes" ).removeAttr( "disabled" )
            $( "#alarmDetailButtons_Acknowledge" ).removeAttr( "disabled" )
          }

          $( "#alarmDetails_State" ).text( Event.EventStatesText[ state ] )
        }
        else
          w2popup.close()
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove an event from the displayed list.
    // Input:
    //   id - Event id to be removed.
    //-------------------------------------------------------------------------
    _removeEvent( event )
    {
      const id = event.id
      $( "#" + id ).remove()

      const receiverId = event.receiverId

      // If an alarm icon is being displayed for this event...
      if ( ( receiverId )
        && ( this.displayedEventAtReceiver[ receiverId ] == id ) )
      {
        // Remove icon form map.
        this.mapAlarms.removeAlarmIcon( event.receiverId )

        // Note there is no icon displayed for this receiver.
        this.displayedEventAtReceiver[ receiverId ] = null
      }

      // Remove tag highlight.
      if ( event.tag )
        this.tagList.setRecordClass( event.tag, "alarmed", false )

      // delete this.activeEvents[ id ]
      this._updateAlarms()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get additional information about event (such as tag).
    // Input:
    //   eventId - Id of event.
    //   callback - Function to run once additional data has been acquired.
    //-------------------------------------------------------------------------
    _getEventBody( eventId, callback )
    {
      const self = this
      const event = this.activeEvents[ eventId ]

      // Tag data for event.
      const tag = this.system.tags[ event.tag ]

      // Patient data for event.
      const patient = self.system.patientByTag( event.tag )

      var receiver = {}
      if ( null !== event.receiverId )
        receiver = self.system.receivers[ event.receiverId ]

      const occurredAt = new Date( event.activateTime * 1000 ).toLocaleString()

      const template = new Template()
      template
        .addMap( event )
        .add( "occurredAt", occurredAt )
        .add( "patient", patient )
        .add( "tag", tag )
        .add( "event", event )
        .add( "stateText", Event.EventStatesText[ event.state ] )
        .add( "receiver", receiver )

      const templateText = $( "#alarmDetailsTemplate" ).html()
      const body = template.process( templateText )

      callback( body )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Select next/previous event.
    // Input:
    //   direction - +1 or -1 for forward/reverse.
    //-------------------------------------------------------------------------
    _eventIncrement( direction )
    {
      const self = this
      return function()
      {
        const activeEvents = Object.keys( self.activeEvents )
        const currentIndex = activeEvents.indexOf( self.popUpEvent ) + direction

        self.popUpEvent = activeEvents[ currentIndex ]

        self._getEventBody
        (
          self.popUpEvent,
          ( body ) => $( "#alarmDetails_Body" ).html( body )
        )

        self._updateEventPopup()
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Show a pop-up window with alarm details.
    // Notes:
    //   Assume templates have been loaded.  Therefore this should not be
    //   called right at start up.
    //-------------------------------------------------------------------------
    _showEvent( eventId )
    {
      const self = this
      const event = this.activeEvents[ eventId ]

      // Used to communicate there is a pop-up, and what event is being shown.
      this.popUpEvent = eventId

      this._getEventBody
      (
        eventId,
        function( body )
        {
          const clearButtonTemplate = $( "#alarmDetailButtonsTemplate" ).html()

          $().w2popup
          (
            {
              title     : 'Alarm Information',
              body      : body,
              buttons   : clearButtonTemplate,
              width     : 550,
              height    : 435,
              overflow  : 'hidden',
              color     : '#333',
              speed     : '0.3',
              opacity   : '0.8',
              modal     : true,
              showClose : true,
              showMax   : false,
              onClose   : () => self.popUpEvent = null
            }
          )

          $( "#alarmDetailButtons_Close" ).click( () => w2popup.close() )

          $( "#alarmDetailButtons_Acknowledge" )
            .click
            (
              function()
              {
                const notes = $( "#eventNotes" ).val()
                event.notes = notes
                event.state = Event.EventStates.Acknowledging
                event.update()
              }
            )

          $( "#alarmDetailButtons_Previous" ).click( self._eventIncrement( -1 ) )
          $( "#alarmDetailButtons_Next" ).click( self._eventIncrement( 1 ) )

          self._updateEventPopup()
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get the size of an alarm entry.
    //   This function need to runs once to get the initial size of an alarm
    //   entry.
    //-------------------------------------------------------------------------
    _getAlarmSizes()
    {
      // Make a temporary alarm message.
      const alarmTemplate = $( "#alarmTemplate" ).html()
      const element = $( alarmTemplate )

      // Place the element off-screen.
      // Elements that are not displayed have no size attributes.  Placing a
      // visible element off-screen allows the size to be calculated without
      // having it appear on the screen.
      element
        .attr( "id", "" )
        .css( "position", "fixed" )
        .css( "top", "-1000" )
        .appendTo( $( "body" ) )

      // Get total height.  This include the element height, margins and
      // padding.
      this.alarmBodyHeight =
        element.height()
        + parseInt( element.css( "marginTop" ) )
        + parseInt( element.css( "marginBottom" ) )
        + parseInt( element.css( "paddingTop" ) )
        + parseInt( element.css( "paddingBottom" ) )

      // Done with the temporary elements.
      element.remove()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add new event.
    // Input:
    //   event - Event data.
    //-------------------------------------------------------------------------
    addEvent( eventRecord )
    {
      const event = new Event( eventRecord )
      const self = this
      const id = event.id

      let levelIcon = LEVEL_ICONS[ event.severity ]

      this._updateAlarms()

      var patientName = ""
      var roomNumber = ""

      // If there is a patient associated with this event...
      const patient = this.system.patientByTag( event.tag )
      if ( null !== patient )
      {
        // Get the patient name and assigned room.
        patientName = patient.formatDisplayName()
        roomNumber = patient.room

        this.tagList.setRecordClass( event.tag, "alarmed", true )
      }

      const alarmTemplateMap =
      {
        name: name,
        id: id,
        levelIcon: levelIcon,
        patientName: patientName,
        roomNumber: roomNumber,
        severityString: Event.PriorityName[ event.severity ]
      }

      // Add information from event record.
      $.extend( alarmTemplateMap, this.activeEvents[ id ] )

      const text = Template.htmlMap( "#alarmTemplate", alarmTemplateMap )
      const element = $( text )

      element.click
      (
        function()
        {
          const eventId = $( this ).attr( "id" )
          self._showEvent( eventId )
        }
      )

      $( "#alarmSubDiv" ).prepend( element )

      return this.activeEvents[ id ]
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get an event by receiver id.
    // Input:
    //   receiverId - Receiver to fetch.
    // Output:
    //   Event data for receiver.
    // Note:
    //   Debug function.
    //-------------------------------------------------------------------------
    get( receiverId )
    {
      var result = null
      const eventId = this.displayedEventAtReceiver[ receiverId ]
      if ( eventId )
        result = this.activeEvents[ eventId ]

      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   When a new event is created.
    // Input:
    //   event - Event record.
    //-------------------------------------------------------------------------
    _eventAdd( event )
    {
      this.addEvent( event )
      this._updateDisplayEvents()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   When an existing event is changed.
    // Input:
    //   event - Event record.
    //-------------------------------------------------------------------------
    _eventChange( event )
    {
      this._updateEventPopup()
      this._updateDisplayEvents()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   When an existing event is about to be removed.
    // Input:
    //   event - Event record.
    //-------------------------------------------------------------------------
    _eventRemove( event )
    {
      this._removeEvent( event )
      this._updateEventPopup()
      this._updateDisplayEvents()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Update the map alarm icons.
    //   A receiver may have multiple alarms so the most server is the icon
    //   that is displayed.
    //-------------------------------------------------------------------------
    _updateDisplayEvents()
    {
      for ( const event of Object.values( this.activeEvents ) )
      {
        const tagSelector = "#" + event.id
        const classState = "alarmActive" + event.state

        // The order is based on the state and severity.  Active alarms always
        // appear first, then sorted by severity.
        const order = event.state * 10 + event.severity
        $( tagSelector )
          .attr( "class", "alarmListing " + classState )
          .css( "order", order )

        const receiverId = event.receiverId

        // Is there a receiver associated with this event?
        if ( receiverId )
        {
          // Get the existing event displaed at this receiver.
          const eventId = this.displayedEventAtReceiver[ receiverId ]

          var update = true

          // Is the event under examination more sever than the event currently
          // active?
          if ( eventId )
          {
            const activeEvent = this.activeEvents[ eventId ]
            update = ( event.severity <= activeEvent.severity )

            // Remove existing event icon.
            if ( update )
              this.mapAlarms.removeAlarmIcon( receiverId )
          }

          if ( update )
          {
            this.mapAlarms.addAlarmIcon( receiverId, Event.PriorityName[ event.severity ] )

            // Replace the displayed event.
            this.displayedEventAtReceiver[ receiverId ] = event.id
          }

        }
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Event notification.
    // Input:
    //   configiration - Instance of `Configiration`.
    //   mapAlarms - Instance of `MapAlarms`.
    //   leftPanel - Instance of `LeftPanel`.
    //   tagList - Instance of `TagList`.
    //-------------------------------------------------------------------------
    constructor( system, mapAlarms, leftPanel, tagList )
    {
      const self = this
      this.popUpEvent = null

      this.system    = system
      this.mapAlarms = mapAlarms
      this.leftPanel = leftPanel
      this.tagList   = tagList

      // True if alarms are (were) active last update.
      this.wereAlarms = false

      // Event list keyed by id.
      this.activeEvents = system.deltaSets.events.getRecords()

      // Each receiver can only display a single event icon.  This is a list
      // of what events are being displayed for each receiver.
      this.displayedEventAtReceiver = {}
      for ( const receiver of Object.values( system.receivers ) )
        this.displayedEventAtReceiver[ receiver.id ] = null

      this.mapAlarms.setMapChangeCallback( $.proxy( this._updateDisplayEvents, this ) )

      // Clear alarms div (needed if reestablishing connection).
      $( "#alarmSubDiv" ).text( "" )

      this._updateAlarms()

      self.eventGroups = system.eventGroups

      system.deltaSets.events.onCreate( $.proxy( this._eventAdd,    this ) )
      system.deltaSets.events.onUpdate( $.proxy( this._eventChange, this ) )
      system.deltaSets.events.onDelete( $.proxy( this._eventRemove, this ) )
      system.deltaSets.events.onLoad
      (
        function( events )
        {
          for ( const event of Object.values( events ) )
            self._eventAdd( event )
        }
      )

      $.when( templates ).done( $.proxy( this._getAlarmSizes, this ) )
    }

  }
})
