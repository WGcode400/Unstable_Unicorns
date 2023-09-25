//-----------------------------------------------------------------------------
// Uses: Patient information.
// Date: 2020-05-12
//-----------------------------------------------------------------------------

"use strict"

define(
[
],
function
(
)
{
  return class Patient
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Format display name.
    // Output:
    //   Display name string in one of the following:
    //     <last name>, <first name>, <middle initial>. - For full name.
    //     <last name>, <first name> - For no middle name.
    //     <last name> - For just last name.
    //     <first name> - For just first name.
    //     <empty string> - For no name information.
    //-------------------------------------------------------------------------
    formatDisplayName()
    {
      var name = ""

      if ( ( this.first )
        && ( this.last ) )
      {
        name = this.last + ", " + this.first

        if ( this.middle )
          name += " " + this.middle[ 0 ] + "."
      }
      else
      if ( this.first )
        name = this.first
      else
      if ( this.last )
        name = this.last

      return name
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Patient information.
    // Input:
    //   patient - Patient record from database.
    //   crud - Instance of `WebSocketCRUDNAF`.
    //-------------------------------------------------------------------------
    constructor( patient, crud )
    {
      Object.assign( this, patient )

      // This object can directly handle `update` and `delete`.
      this.update = () => crud.update( this.id, this )
      this.delete = () => crud.delete( this.id )
    }
  }
})
