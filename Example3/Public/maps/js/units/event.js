//-----------------------------------------------------------------------------
// Uses: Individual event.
// Date: 2019-12-03
// $$$FUTURE - Only used for constants right now.  See if there is a reason
// to use more.
//-----------------------------------------------------------------------------

"use strict"

define(
[
],
function
(
)
{
  return class Event
  {
    static get Level()
    {
      return Object.freeze
      (
        {
          High:    0,
          Medium:  1,
          Low:     2,
          Message: 3
        }
      )
    }

    static get PriorityName()
    {
      return Object.freeze
      (
        {
          0 : "High",
          1 : "Medium",
          2 : "Low",
          3 : "Message"
        }
      )
    }

    static get EventStates()
    {
      return Object.freeze
      (
        {
          Active        : 1,
          Clear         : 2,
          InactiveCanClose : 3,
          Acknowledging : 4,
          Acknowledged  : 5,
        }
      )
    }

    static get EventStatesText()
    {
      return Object.freeze
      (
        {
          1 : "Active",
          2 : "Inactive",
          3 : "InactiveCanClose",
          4 : "RequestToClose",
          5 : "Closed",
        }
      )
    }

    // $$$DEP? static get EventType()
    // $$$DEP? {
    // $$$DEP?   return Object.freeze
    // $$$DEP?   (
    // $$$DEP?     {
    // $$$DEP?       TagNotPresent   : 0,
    // $$$DEP?       LostZoneComms   : 1,
    // $$$DEP?       DuplicateZoneID : 2,
    // $$$DEP?       AccessPointExit : 3,
    // $$$DEP?       Perimeter       : 4,
    // $$$DEP?       AccessPointAjar : 5,
    // $$$DEP?       TagLoiter       : 6,
    // $$$DEP?       BandRemoval     : 7,
    // $$$DEP?       BandCompromise  : 8,
    // $$$DEP?       FirePanel       : 9,
    // $$$DEP?       ResetAll        : 10,
    // $$$DEP?       LowTagBattery   : 11,
    // $$$DEP?       ReceiverError   : 12,
    // $$$DEP?       ControllerReset : 13,
    // $$$DEP?       LowRTC_Battery  : 14,
    // $$$DEP?       Tamper          : 15
    // $$$DEP?     }
    // $$$DEP?   )
    // $$$DEP? }

    static get EventTypeText()
    {
      return Object.freeze
      (
        {
          1000 : "Access Point Exit",
          1001 : "Perimeter",
          1002 : "Door Ajar",
          1003 : "Tag Loiter",
          1004 : "Fire Panel",
          2000 : "Band Removal",
          2001 : "Band Compromise",
          2002 : "Tag Not Present",
          2003 : "Unknown Tag",
          2004 : "Low Tag Battery",
          3000 : "Reset Lock",
          3001 : "Zone Reset",
          4000 : "I/O Board Comm Error",
          4001 : "I/O Board Error",
          4002 : "TX Board Comm Error",
          4003 : "TX Board Error",
          4004 : "Receiver Comm Error",
          4005 : "Receiver Error",
          4006 : "Unknown Receiver",
          4007 : "Duplicate Receiver Enclosure ID",
          4008 : "ZONE Comm Error",
          4009 : "Unknown ZONE",
          4010 : "Duplicate Zone ID",
          4011 : "Zone Controller Error",
          4012 : "Tamper",
          5000 : "Comm Server Comm Error",
          5001 : "Database Connection Error",
          5002 : "Database Operation Error",
          6000 : "Incompatible Zone Controller",
          6001 : "Incompatible Comm Server",
        }
      )
    }

    //-------------------------------------------------------------------------
    // Input:
    //   data - Object with state of event.
    //   crud - Instance of `WebSocketCRUDNAF`.
    //-------------------------------------------------------------------------
    constructor( data, crud )
    {
      Object.assign( this, data )
      this.name = Event.EventTypeText[ this.type ]

      // This object can directly handle `update` and `delete`.
      this.update = () => crud.update( this.id, this )
      this.delete = () => crud.delete( this.id )
    }
  }

})
