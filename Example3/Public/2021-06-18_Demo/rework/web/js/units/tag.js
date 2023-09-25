//-----------------------------------------------------------------------------
// Uses: Tag patient information.
// Date: 2019-12-05
//-----------------------------------------------------------------------------

"use strict"

define(
[
],
function
(
)
{
  return class Tag
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Tag with patient information.
    // Input:
    //   tagData - Tag data from database.
    //   crud - Instance of `WebSocketCRUDNAF`.
    //-------------------------------------------------------------------------
    constructor( tagData, crud )
    {
      Object.assign( this, tagData )

      // This object can directly handle `update` and `delete`.
      this.update = () => crud.update( this.id, this )
      this.delete = () => crud.delete( this.id )
    }
  }
})
