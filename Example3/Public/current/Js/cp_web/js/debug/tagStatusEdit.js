//-----------------------------------------------------------------------------
// Uses:
// Date: 2020-05-06
//-----------------------------------------------------------------------------

"use strict"

define(
[
],
function
(
)
{
  return function( webSocketAPI, configuration )
  {
    $().w2destroy( "editTags" )

    const fields = []
    const tags = {}

    // Make a list of receiver assigned to this controller.
    for ( const tag of Object.values( system.tags ) )
    {
      fields.push( { field: tag.tag, type: 'checkbox', html: { caption: 'Tag ' + tag.tag } } )
      tags[ tag.tag ] = ( tag.tag in system.tags )
    }

    // Make a copy of tag state list.
    const lastTagsState = $.extend( {}, tags )

    $().w2form
    (
      {
        name   : 'editTags',
        style  : 'border: none; background-color: transparent;',
        fields : fields,
        record : tags,

        onChange : ( event ) => event.onComplete = function()
        {
          for ( const [ tag, value ] of Object.entries( this.record ) )
          {
            if ( value != lastTagsState[ tag ] )
            {
              if ( value )
                webSocketAPI.makeRequest( "tags.add", [ tag ] )
              else
                webSocketAPI.makeRequest( "tags.remove", [ tag ] )

              lastTagsState[ tag ] = value
            }
          }
        },

        // Actions (buttons).
        actions:
        {
          "Set All" : function()
          {
            $( '#w2ui-popup input[type=checkbox]' ).each
            (
              function( index, item )
              {
                $( item ).prop( "checked", true ).change()
              }
            )

          },

          // Save record and close pop-up.
          "Close": function ()
          {
            $().w2destroy( "editTags" )
            w2popup.close()
          }, // "save"

          "Clear All" : function()
          {
            $( '#w2ui-popup input[type=checkbox]' ).each
            (
              function( index, item )
              {
                $( item ).prop( "checked", false ).change()
              }
            )
          },

        } // actions
      }
    )

    $().w2popup
    (
      'open',
      {
        title   : 'Edit controller',
        body    : '<div id="popupForm" style="width: 100%; height: 100%;"></div>',
        style   : 'padding: 15px 0px 0px 0px',
        width   : 500,
        height  : 600,
        showMax : true,

        // When pop-up is open, render the form in the body.
        // W2UI note: Specifying an onOpen handler instead is equivalent to
        // specifying an onBeforeOpen handler, which would make this code
        // execute too early and hence not deliver.  (Hence the double
        // callback.)
        onOpen: ( event ) => event.onComplete = function ()
        {
          $( '#w2ui-popup #popupForm' ).w2render( 'editTags' )
        }
      }
    )


  }

})
