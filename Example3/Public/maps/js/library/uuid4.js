//-----------------------------------------------------------------------------
// Uses: Generate a valid version 4 UUID.
// Date: 2019-01-21
// Author: Andrew Que (http://www.DrQue.net)
//
//                         (C) 2019/2020 by Andrew Que
//-----------------------------------------------------------------------------

"use strict"

define(
[
],
function
(
)
{
  //-------------------------------------------------------------------------
  // Uses:
  //   Return random 4-digit hex word.
  // Input:
  //   andMask - Random bits to include.
  //   orMask - Bits to force.
  //-------------------------------------------------------------------------
  function hexWord( andMask = 0xFFFF, orMask = 0x0000 )
  {
    // Generate random number between 0x0000 and 0xFFFF.
    // Note: The numbers from `Math.random` are not very good, so we use
    // the generator from `crypto`.
    const array = new Uint16Array( 1 )
    window.crypto.getRandomValues( array )
    var number = array[ 0 ]

    number &= andMask
    number |= orMask

    return number.toString( 16 ).padStart( 4, '0' )
  };

  //-------------------------------------------------------------------------
  // Uses:
  //   Generate a valid version 4 UUID.
  // Output:
  //   UUID string in the form:
  //     xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  //   Where `x` is 0-f, and `y` is 8, 9, a or b.
  //-------------------------------------------------------------------------
  return function()
  {
    const result =
        ""  + hexWord() + hexWord()
      + "-" + hexWord()
      + "-" + hexWord( 0x0FFF, 0x4000 )
      + "-" + hexWord( 0x3FFF, 0x8000 )
      + "-" + hexWord() + hexWord() + hexWord()

    return result
  }
})
