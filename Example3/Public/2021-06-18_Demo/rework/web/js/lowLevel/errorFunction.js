//-----------------------------------------------------------------------------
// Uses: Global exception handler.
// Date: 2019-12-19
// Notes:
//   No additional libraries are used here as this is the highest level of
//   error handling.
//-----------------------------------------------------------------------------

"use strict"

// Global variable.
// Set to true once the message is displayed.  Allows showing of only first
// error.
var isErrorFunctionMessageDisplayed = false

//-----------------------------------------------------------------------------
// Uses:
//   Kill all active timers.
// Note:
//   This uses the fact that the timer instance is actually an integer and
//   we can assume the next available timer is the highest timer index used.
//   All timers below this value are cleared.  This isn't a perfect situation
//   but functional.
//-----------------------------------------------------------------------------
function killTimers()
{
  const lastTimer = setTimeout
  (
    function()
    {
      for ( var timer = 0; timer < lastTimer; timer += 1 )
        clearInterval( timer )
    },
    0
  )
}

//-----------------------------------------------------------------------------
// Uses:
//   Global error function to catch any script errors.
// Input:
//   message - Text of error message.
//   source - Name of offending file.
//   lineNumber - Line of error.
//   columnNumber - Column of error.
//   error - Object with error details.
// Notes:
//   Specifically designed to for `window.onerror`.
//   Should use no library calls and be kept simple.
//   Designed to stop program execution as much as possible.
//-----------------------------------------------------------------------------
function errorFunction( message, source, lineNumber, columnNumber, error )
{
  //console.log( "Error caught.", message, source, lineNumber, columnNumber, error )

  if ( ! isErrorFunctionMessageDisplayed )
  {
    document.getElementById( 'runtimeError_Message' ).innerText = message + "."

    const locationString = source + " line " + lineNumber + " column " + columnNumber + "."
    document.getElementById( 'runtimeError_Location' ).innerText = locationString
    document.getElementById( 'runtimeError' ).style.display = "flex"
    killTimers()
    isErrorFunctionMessageDisplayed = true
  }
}

//-----------------------------------------------------------------------------
// Uses:
//   Error handler for RequireJS.  Forwards error to global error handler.
// Input:
//   error - Object with error information.
//-----------------------------------------------------------------------------
function requireJS_ErrorFunction( error )
{
  // Simple forward this error to the global error handler.
  errorFunction
  (
    error.message,
    error.fileName,
    error.lineNumber,
    error.columnNumber,
    error
  )
}

// Register global error handler.
window.onerror = errorFunction
