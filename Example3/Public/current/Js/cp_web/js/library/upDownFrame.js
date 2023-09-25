//-----------------------------------------------------------------------------
// Uses: Setup an up/down frame.
// Date: 2020-03-23
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
  //-------------------------------------------------------------------------
  return function( selector, getValue, changeCallback )
  {
    const upDownDiv  = $( selector )
    const upButton   = upDownDiv.find( "button" ).eq( 0 )
    const downButton = upDownDiv.find( "button" ).eq( 1 )
    const valueInput = upDownDiv.find( "input" ).eq( 0 )

    const updateFunction = function()
    {
      const value = getValue()
      valueInput.val( value )
    }

    valueInput.off().change
    (
      function()
      {
        const value = parseInt( valueInput.val() )
        changeCallback( value, 0 )
        updateFunction()
      }
    )

    upButton.off().click
    (
      function()
      {
        changeCallback( null, 1 )
        updateFunction()
      }
    )

    downButton.off().click
    (
      function()
      {
        changeCallback( null, -1 )
        updateFunction()
      }
    )

    updateFunction()
  }
})
