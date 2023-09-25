//-----------------------------------------------------------------------------
// Uses: Help page.
// Date: 2020-01-15
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "vendor/w2ui",
  "vendor/jquery"
],
function
(
  w2ui
)
{

  // Load templates.
  const templates = $.get
  (
    'templates/help.template.html',
    function( data )
    {
      $( "body" ).append( data )
    }
  )

  return class TagEdit
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Update the screen with version information.
    //-------------------------------------------------------------------------
    _displayVersions()
    {
      const self = this

      $( "#helpTemplate_serverVersion" ).text( this.versionData.server.string )
      $( "#helpTemplate_serverBuild" ).text(   this.versionData.server.date )
      $( "#helpTemplate_serverHash" ).text(    this.versionData.server.hash )

      if ( ! this.versionData.server.isValid )
        $( "#helpTemplate_serverVersionDiv span" ).addClass( "versionError" )
      else
        $( "#helpTemplate_serverVersionDiv span" ).removeClass( "versionError" )

      $( "#helpTemplate_clientVersion" ).text( this.versionData.client.string )
      $( "#helpTemplate_clientBuild"   ).text( this.versionData.client.date )
      $( "#helpTemplate_clientHash"    ).text( this.versionData.client.hash )

      if ( ! this.versionData.client.isValid )
      {
        $( "#helpTemplate_clientVersionDiv span" ).addClass( "versionError" )
        $( "#helpTemplate_recompute" )
          .prop( 'disabled', false )
          .show()
          .click
          (
            function()
            {
              $( "#helpTemplate_recompute" ).prop( 'disabled', true )
              self.accutechAPI.recomputeClientVersion
              (
                function()
                {
                  self._updateVersion( () => self._displayVersions() )
                }
              )

            }
          )
      }
      else
      {
        $( "#helpTemplate_clientVersionDiv span" ).removeClass( "versionError" )
        $( "#helpTemplate_recompute" ).hide()
      }

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Load version information.
    // Input:
    //   callback( versionData ) - Callback to run with data.
    //     versionData - Record with version data.
    //-------------------------------------------------------------------------
    _updateVersion( callback )
    {
      const self = this

      // Fetch all the tags for the system.
      return this.accutechAPI.getVersions
      (
        function( versionData )
        {
          self.versionData = versionData

          if ( callback )
            callback()
        }
      )
    }

    //-------------------------------------------------------------------------
    // Input:
    //   accutechAPI - Instance of `AccutachAPI`.
    //-------------------------------------------------------------------------
    constructor( accutechAPI )
    {
      const self = this

      this.accutechAPI = accutechAPI

      const versions = this._updateVersion()

      // After the templates are loaded, display the pop-up.
      $.when( templates, versions ).done
      (
        function()
        {
          $().w2popup
          (
            'open',
            {
              title   : 'Help',
              body    : $( "#helpTemplate" ).html(),
              buttons : $( "#helpTemplateButtons" ).html(),
              width   : 600,
              height  : 400,
              showMax : true,

              onOpen: function( event )
              {
                event.onComplete = function()
                {
                  self._displayVersions()
                  $( "button[name='Reload']" ).click( () => location.reload( true ) )
                  $( "button[name='Close']" ).click( () => w2popup.close() )

                }
              }
            }
          ) // w2popup
        }
      ) // when

    } // constructor

  } // class

})
