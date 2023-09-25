//-----------------------------------------------------------------------------
// Uses: Editor to place and position receivers, legend and text.
// Date: 2019-10-23
//-----------------------------------------------------------------------------

"use strict"

define(
[
  'vendor/w2ui',
  'vendor/FileSaver',
  'vendor/jquery-ui'
],
function
(
  w2ui,
)
{
  return class JSON_ImportExport
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Generate a "Save As" prompt with a set of data.
    // Input:
    //   data - Data to save.
    //   fileName - Suggested file name.
    // Output:
    //   Triggers "Save as" dialog.
    //-------------------------------------------------------------------------
    static export( data, fileName )
    {
      const dataJSON = JSON.stringify( data, null, 2 )
      const blob = new Blob( [ dataJSON ], { type: "application/json" } )
      saveAs( blob, fileName )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Create a file selection dialog and run callback with file contents.
    // Input:
    //   callback - Callback to run with file data.
    //   errorCallback - Callback to run if there is an error loading file.
    // Output:
    //   Triggers file selection dialog.
    //-------------------------------------------------------------------------
    static import( callback, errorCallback )
    {
      // Create a temporary <input> element to do file input.
      // By triggering the "click" event a dialog box for file selection is
      // opened.
      const tempTag =
        $( "<input>" )
          .attr( "type", "file" )    // <- This is a file input tag.
          .css( "display", "none" )  // <- Hide the input.
          .appendTo( "body" )        // <- Attach it to the document body.
          .change                    // <- Callback when file is selected.
          (
            function()
            {
              // Setup a file reader to receive the file data.
              const reader = new FileReader()
              reader.onload = function( event )
              {
                // JSON data parse try/catch to check for invalid JSON.
                try
                {
                  // Parse the file data.
                  const data = JSON.parse( event.target.result )

                  if ( callback )
                    callback( data )
                }
                catch ( exception )
                {
                  // If there was a problem parsing the JSON data, display alert.
                  if ( exception instanceof SyntaxError )
                  {
                    if ( errorCallback )
                      errorCallback()
                  }
                  else
                    // All other exceptions should be handled by global handler.
                    throw exception
                }

                // Remove temporary input tag.
                $( "body" ).remove( tempTag )
              }

              // Get the selected file.
              const fileData = $( this )[ 0 ].files[ 0 ]

              // Parse file data.
              reader.readAsText( fileData )
            }
          )
          .trigger( 'click' )
    }

  } // class
})
