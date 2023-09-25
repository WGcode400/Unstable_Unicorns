//-----------------------------------------------------------------------------
// Uses:
// Date: 2020-03-05
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/uuid4",
],
function
(
  uuid4
)
{
  return class Receiver
  {
    static get MapFields()
    {
      return Object.freeze
      (
        [
          "id",
          "xCenter",
          "yCenter",
          "labelRadius",
          "labelAngle",
        ]
      )
    }

    static get BaseFields()
    {
      return Object.freeze
      (
        [
          "id",
          "number",
          "type",
          "area",
          "description",
        ]
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Create new instance of a receiver.
    // Input:
    //   controller - Parent controller.
    //   channel - Channel number on parent.
    //
    //-------------------------------------------------------------------------
    static newReceiver( controller, channel, name )
    {
      if ( ! name )
        name = controller.description + ".R" + channel

      const receiver =
      {
        id : uuid4(),
        controllerId : controller.id,
        channel : channel,
        description : name,
      }

      return new Receiver( receiver, controller )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get assigned controller.
    // Output:
    //   Instance of `Controller`.
    //-------------------------------------------------------------------------
    getController()
    {
      return this._controller
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get assigned area.
    // Output:
    //   Instance of `Area`.
    //-------------------------------------------------------------------------
    getArea()
    {
      return this._area
    }

    // $$$DEBUG - Use? //-------------------------------------------------------------------------
    // $$$DEBUG - Use? // $$$
    // $$$DEBUG - Use? //-------------------------------------------------------------------------
    // $$$DEBUG - Use? isValid()
    // $$$DEBUG - Use? {
    // $$$DEBUG - Use?   return ( ( this._area ) && ( this._controller ) )
    // $$$DEBUG - Use? }

    //-------------------------------------------------------------------------
    // Uses:
    //   Set parent controller.
    // Input:
    //   controller - Parent `Controller` or `null`.
    //-------------------------------------------------------------------------
    setController( controller )
    {
      this._controller = controller
      if ( controller )
        this._area = controller.getArea()
      else
        this._area = null
    }

    //-------------------------------------------------------------------------
    // Input:
    //   data - Object with receiver settings.
    //   controller - Parent controller.
    //-------------------------------------------------------------------------
    constructor( data={}, controller=null )
    {
      Object.assign( this, data )
      this.setController( controller )
    }

  }
})
