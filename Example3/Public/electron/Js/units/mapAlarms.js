//-----------------------------------------------------------------------------
// Uses: Main map handling.
// Date: 2019-12-18
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/svgAssist",

  "units/alarmIcon",
  "units/settings",

  "library/jquery.sortArrayOfObjects",
  "vendor/jquery"
],
function
(
  SVG_Assist,
  AlarmIcon,
  Settings,
)
{
  return class MapAlarms
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Setup SVG definitions for various receiver icons.
    //-------------------------------------------------------------------------
    _setup( mapId )
    {
      // Save new map id.
      this.mapId = mapId

      // Reset alarm image elements--there are none yet.
      this.alarmImageElements = {}

      // Area for alarm icons.
      const zoomArea = this.map.getZoomArea()
      if ( zoomArea )
      {
        const alarmsGroup = this.map.addGroup( "alarmsGroup", zoomArea )
        this.map.addGroup( "alarmsGroupHigh", alarmsGroup )
          this.map.addGroup( "alarmsGroupMedium", alarmsGroup )
          this.map.addGroup( "alarmsGroupGreen", alarmsgroup )
        this.map.addGroup( "alarmsGroupLow", alarmsGroup )

        if ( this.mapChangeCallback )
          this.mapChangeCallback( mapId )
      }
    }
      //-------------------------------------------------------------------------
      // Uses:
      //   Remove the alarm indication.
      // Input:
      //   receiverId - Receiver id.
      //-------------------------------------------------------------------------
      removeAlarmIcons() {
          if (this.alarmImageElements) {
              for (const receiver of Object.keys(this.alarmImageElements))
              {
                  //console.log(receiver)
                const parent = this.alarmImageElements[receiver].parentNode
                parent.removeChild(this.alarmImageElements[receiver])
                delete this.alarmImageElements[receiver]
            }
        }      
      }
    //-------------------------------------------------------------------------
    // Uses:
    //   Remove the alarm indication.
    // Input:
    //   receiverId - Receiver id.
    //-------------------------------------------------------------------------
    removeAlarmIcon( receiverId )
    {
      // Remove highlighted legend row.
        this.map.setLegendHighlight(receiverId, "alarmed", false)
        
      if ( this.alarmImageElements[ receiverId ] )
      {
        const parent = this.alarmImageElements[ receiverId ].parentNode
        parent.removeChild( this.alarmImageElements[ receiverId ] )
      }

      delete this.alarmImageElements[ receiverId ]
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Draw active alarm on map.
    // Input:
    //   receiverId - Id of active receiver to indicate alarm.
    //   priority - The priority of the alarm.
    //-------------------------------------------------------------------------
    addAlarmIcon( receiverId, priority, active, inactive )
    {
      // Highlight row in legend table.
      this.map.setLegendHighlight( receiverId, "alarmed", true )

      const receiverConfiguration = this.system.receivers[ receiverId ]
      const map = this.system.maps[ this.mapId ]

      if ( ( receiverConfiguration )
        && ( map )
        && ( receiverConfiguration.id in map.receivers ) )
      {
        const mapReceiver = map.receivers[ receiverConfiguration.id ]
        const receiver = $.extend( {}, receiverConfiguration, mapReceiver )
        const iconSize = map.iconSize * Settings.AlarmIconScale

        // Compute the center location of text.
        // This is the point to rotate text around.
        const x = receiver.xCenter - iconSize / 2
        const y = receiver.yCenter - iconSize / 2

        const svg = this.map.getSVG()
        const insertLocation = svg.find( '#alarmsGroup' + priority )[ 0 ]
        const iconType = this.system.iconTypes[ receiver.type ]
        const icon = this.system.svgFiles[ iconType.icon ]

        const alarmGroup = SVG_Assist.createElement( 'g' )

        const alarmElement = $.parseXML( icon ).firstChild


        // Set map position.
        alarmElement.setAttribute( "x", x )
        alarmElement.setAttribute( "y", y )

        alarmGroup.append( alarmElement )
        insertLocation.append( alarmGroup )

        alarmElement.setAttribute( "width", iconSize )
        alarmElement.setAttribute( "height", iconSize )

        alarmGroup.setAttribute( "class", "rotate" )

        const syncElement = $( "#animationSyncSVG #animationSync" )[ 0 ]
        const alarmIcon = new AlarmIcon( alarmElement, syncElement )

        const alarmIconFunctions =
        {
          High   : $.proxy( alarmIcon.startHigh, alarmIcon ),
          Medium : $.proxy( alarmIcon.startMedium, alarmIcon ),
          Green  : $.proxy( alarmIcon.startGreen, alarmIcon ),
          Low    : $.proxy( alarmIcon.startLow, alarmIcon ),
          Clear  : $.proxy( alarmIcon.stop, alarmIcon )
        }

        alarmIconFunctions[ priority ]()

        this.map.rotateElement( alarmGroup )

        this.alarmImageElements[ receiverId ] = alarmElement
          const controllerConfiguration = this.system.controllers[receiverConfiguration.controllerId]
          $(alarmElement).hover
              (
                  function () {
                      // Show the name of this view when hovered.
                      $(this).w2overlay({
                          openAbove: true,
                          align: 'both',
                          html: '<div style="padding: 10px;line-height: 150%">' +
                              'Zone: ' + controllerConfiguration.address + ' - ' + receiverConfiguration.channel + '<br>' +
                              'Alarming: ' + active + ' <br>' +
                              'Inactive: ' + inactive +
                              '</div>'
                      });
                      // $(this).w2tag("im alarming ")
                  },
                  function () {
                      // Remove hover tag when mouse leaves.
                      $(this).w2overlay("")
                      //$(this).w2tag("")
                  }
              )
        if ( this.alarmIconCallback )
          this.alarmIconCallback( alarmElement, receiverId )

         // console.log(this.alarmImageElements)
      }
    }

    //-------------------------------------------------------------------------
    // $$$DEBUG -
    // This is a debug function.
    //-------------------------------------------------------------------------
    setAlarmIconCallback( callback )
    {
      this.alarmIconCallback = callback
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Register callback to be run when the map changes.
    // Input:
    //   callback( mapId ) - Callback to run.
    //     mapId - Id of new map.
    //-------------------------------------------------------------------------
    setMapChangeCallback( callback )
    {
      this.mapChangeCallback = callback
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Class for managing floor plan pan, zoom and rotation.
    // Input:
    //   svg - Instance of SVG that is the floor plan.
    //-------------------------------------------------------------------------
    constructor( system, map )
    {
      this.system = system
      this.map = map
      this._setup(this.map.mapId)
      //map.addMapChangeCallback( $.proxy( this._setup, this ) )
      map.addRotateSelector( "#alarmsGroup .rotate" )

      this.alarmIconCallback = null
      this.mapChangeCallback = null

      this.alarmImageElements = {}

    } // constructor

  } // class
})
