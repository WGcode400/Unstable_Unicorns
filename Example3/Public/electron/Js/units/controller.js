//-----------------------------------------------------------------------------
// Uses:
// Date: 2020-03-05
//-----------------------------------------------------------------------------

"use strict"

define(
[
],
function
(
)
{
  return class Controller
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Return assigned area.
    // Output:
    //   Instance of `Area`.
    //-------------------------------------------------------------------------
    getArea()
    {
      return this._area
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get a list of possible receiver channels that could be connected to
    //   this controller.
    // Output:
    //   Array with available channel numbers.
    // Notes:
    //   Needed because a controller has an I/O and/or Tx board, one string
    //   of receivers is removed.
    //-------------------------------------------------------------------------
    getPossibleReceivers()
    {
      var maxChannels = 9

      // If this controller is a door or has a Tx board, there are three less
      // receivers that can be supported.
      if ( ( this.isDoor )
        || ( this.isTx ) )
      {
        maxChannels -= 3
      }

      const channels = [ ...Array( maxChannels ).keys() ].map( String )
      return channels
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get a list of receivers channels not currently connected.
    // Output:
    //   Array with available channel numbers.
    //-------------------------------------------------------------------------
    getAvailableReceivers()
    {
      // Start with all the possible receivers.
      const channels = this.getPossibleReceivers()

      // Remove each of the used receivers.
      for ( const receiver of Object.keys( this.receivers ) )
        channels.splice( channels.indexOf( receiver ), 1 )

      return channels
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Remove receiver that had been assigned to controller.
    // Input:
    //   channel - Channel of receiver.
    //-------------------------------------------------------------------------
    removeReceiver( channel )
    {
      delete this.receiverIds[ channel ]
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a receiver.
    // Input:
    //   channel - Channel of receiver (0-8).
    //   receiverId - Id of the assigned receiver record.
    //-------------------------------------------------------------------------
    addReceiver( channel, receiverId )
    {
      this.receiverIds[ channel ] = receiverId
    }

    //-------------------------------------------------------------------------
    // Input:
    //   data - Object data for controller.
    //   area - Assigned area.  Instance of `Area`.
    //-------------------------------------------------------------------------
    constructor( data={}, area=null )
    {
      Object.assign( this, data )
      this._area = area
    }

  }
})
