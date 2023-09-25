//-----------------------------------------------------------------------------
// Uses: Bidirectional look-up table.
// Date: 2020-01-16
//-----------------------------------------------------------------------------

"use strict"

define(
[
],
function
(
)
{
  return class BidirectionalLookup
  {
    //-----------------------------------------------------------------------
    // Uses:
    //   Use the key to look-up the value.
    // Input:
    //   key - Key to look-up.
    // Output:
    //   Value for this key.
    //-----------------------------------------------------------------------
    forward( key )
    {
      return this.forwardLookupTable[ key ]
    }

    //-----------------------------------------------------------------------
    // Uses:
    //   Use the value to look-up the key.
    // Input:
    //   value - Value to look-up.
    // Output:
    //   Key for this value.
    //-----------------------------------------------------------------------
    reverse( value )
    {
      return this.reverseLookupTable[ value ]
    }

    //-----------------------------------------------------------------------
    // Uses:
    //   Return an array of all key values.
    // Output:
    //   Array of all key values.
    //-----------------------------------------------------------------------
    keys()
    {
      return Object.keys( this.forwardLookupTable )
    }

    //-----------------------------------------------------------------------
    // Uses:
    //   Return an array of all values.
    // Output:
    //   Array of all values.
    //-----------------------------------------------------------------------
    values()
    {
      return Object.values( this.forwardLookupTable )
    }

    //-----------------------------------------------------------------------
    // Uses:
    //   Bidirectional look-up table where the mapped values can be retrieved
    //   knowing either the key or the value.
    // Input:
    //   forwardLookupTable - Simple key->value pair array.  Values should
    //     be primitives (string and numbers).
    //-----------------------------------------------------------------------
    constructor( forwardLookupTable )
    {
      this.forwardLookupTable = forwardLookupTable
      this.reverseLookupTable = Object.assign
      (
        {},
        ...Object.entries( forwardLookupTable ).map
        (
          ( [ key, value ] ) => ( { [ value ] : key } )
        )
      )
    }
  }

})
