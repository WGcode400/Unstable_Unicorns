//-----------------------------------------------------------------------------
// Uses: Debug interface
// Date: 2021-05-19
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "units/map",
  "units/view",
  "units/webSocketCRUDNAF",
  "screens/configurationEdit",
  "library/urlParameters",
  "library/svgAssist",
  "library/jsonImportExport",
  "library/template",
  "library/uuid4",
  "debug/commandArea",
  "library/jquery.path",
],
function
(
  Map,
  View,
  WebSocketCRUDNAF,
  ConfigurationEdit,
  urlParameters,
  SVG_Assist,
  JSON_ImportExport,
  Template,
  uuid4,
  CommandArea,
)
{
  return class DebugClass
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Example 1.  Just uses a basic template.
    //-------------------------------------------------------------------------
    displayTemplateExample1()
    {
      // Template substitution data.
      // Any area in the template
      const templateData =
      {
        id: "template123",
        title: "Title",
        name: "Jane Dow",
        location: 124,

        // This can be accessed using {nested.a} and {nested.b}
        nested :
        {
          a: "567",
          b: "890"
        }
      }

      // Load template and add it to HTML body.
      // This would typically be done when the module loads as it only needs
      // to happen once.  Once the template is attached to the body, the items
      // in it (<template> tags) can be accessed by their id.
      const template = $.get
      (
        'templates/debug.template.html',
        function( data )
        {
          // Attach template to HTML <body> area.
          $( "body" ).append( data )
        }
      )

      // After template finishes loading...
      $.when( template ).done
      (
        function()
        {
          // Template.htmlMap uses a <template> current in the loaded HTML,
          // identified by id (although it could be any selector), and
          // substitutes in all the items in the object provided.  The result
          // is an HTML string.
          const html = Template.htmlMap( "#debugTemplate", templateData )

          // Add the HTML to the <main> tag.
          $( html ).appendTo( "main" )
          //$( "main" ).append( html ) // <- Identical

          // The following would replace the data in <main> with template.
          //$( "main" ).html( html )
        }
      )
    }






    //-------------------------------------------------------------------------
    //-------------------------------------------------------------------------
    databaseQueryExample1()
    {
      const recordTable = new WebSocketCRUDNAF( this.application.webSocketAPI, "records" )

      recordTable.readAll
      (
        function( data )
        {
          console.log( data )
        }
      )
    }

    //-------------------------------------------------------------------------
    //-------------------------------------------------------------------------
    databaseQueryExample2()
    {
      // Load template.
      const templateQuery = $.get( 'templates/debug.template.html' )

      // Fetch all records.
      const recordTable = new WebSocketCRUDNAF( this.application.webSocketAPI, "records" )
      const recordQuery = recordTable.readAll()

      // When both records and templates are finished loading...
      $.when( recordQuery, templateQuery ).done
      (
        function( records, templateData )
        {
          if ( records )
          {
            // Get the `recordTemplate` from the template data.
            const template = $( templateData[ 0 ] ).filter( "#recordTemplate" ).html()

            // Add all records.
            for ( const record of Object.values( records ) )
              $( "main" ).append( Template.processMap( template, record ) )
          }
        }
      )

    }

    //-------------------------------------------------------------------------
    //-------------------------------------------------------------------------
    databaseQueryExample2_Deluxe()
    {
      // Load template.
      const templateQuery = $.get( 'templates/debug.template.html' )

      // Fetch all records.
      const recordTable = new WebSocketCRUDNAF( this.application.webSocketAPI, "records" )
      const recordQuery = recordTable.readAll()

      // When both records and templates are finished loading...
      $.when( recordQuery, templateQuery ).done
      (
        function( records, templateData )
        {
          if ( records )
          {
            // Get the `recordTemplate` from the template data.
            const template = $( templateData[ 0 ] ).filter( "#recordTemplate" ).html()

            // Clear main
            $( "main" ).html( "" )

            // Create a parent container to hold record records.
            const recordsDiv = $( "<div>" ).appendTo( "main" ).addClass( "example2_container" )

            // Add all records.
            for ( const record of Object.values( records ) )
            {
              const html = Template.processMap( template, record )

              // Add it to the record area and assign a style.
              $( html )
                .addClass( "example2" )
                .appendTo( recordsDiv )
            }
          }
        }
      )

    }

    //-------------------------------------------------------------------------
    //-------------------------------------------------------------------------
    _displayVersions( versionData )
    {
      const self = this

      $( "#versionTemplate_serverVersion" ).text( versionData.server.string )
      $( "#versionTemplate_serverBuild" ).text(   versionData.server.date )
      $( "#versionTemplate_serverHash" ).text(    versionData.server.hash )

      if ( ! versionData.server.isValid )
        $( "#versionTemplate_serverVersionDiv span" ).addClass( "versionError" )
      else
        $( "#versionTemplate_serverVersionDiv span" ).removeClass( "versionError" )

      $( "#versionTemplate_clientVersion" ).text( versionData.client.string )
      $( "#versionTemplate_clientBuild"   ).text( versionData.client.date )
      $( "#versionTemplate_clientHash"    ).text( versionData.client.hash )

      if ( ! versionData.client.isValid )
      {
        $( "#versionTemplate_clientVersionDiv span" ).addClass( "versionError" )
        $( "#versionTemplate_recompute" )
          .prop( 'disabled', false )
          .show()
          .click
          (
            function()
            {
              $( "#versionTemplate_recompute" ).prop( 'disabled', true )
              self.webSocketAPI.makeRequest
              (
                "version.clientRecompute",
                [],
                $.proxy( self.displayVersions, self )
              )

            }
          )
      }
      else
      {
        $( "#versionTemplate_clientVersionDiv span" ).removeClass( "versionError" )
        $( "#versionTemplate_recompute" ).hide()
      }
    }

    //-------------------------------------------------------------------------
    //-------------------------------------------------------------------------
    displayVersions()
    {
      const self = this

      // Load templates.
      const template = $.get( 'templates/version.template.html' )

      const versions = this.webSocketAPI.makeRequest( "version.all", [] )

      // After the templates are loaded, display the pop-up.
      $.when( template, versions ).done
      (
        function( templateData, versionData )
        {
          $( template.responseText ).appendTo( "body" )

          $().w2popup
          (
            'open',
            {
              title   : 'Help',
              body    : $( "#versionTemplate" ).html(),
              buttons : $( "#versionTemplateButtons" ).html(),
              width   : 600,
              height  : 400,
              showMax : true,

              onOpen: function( event )
              {
                event.onComplete = function()
                {
                  self._displayVersions( versionData )
                  $( "button[name='Reload']" ).click( () => location.reload( true ) )
                  $( "button[name='Close']" ).click(  () => w2popup.close() )

                }
              }
            }
          ) // w2popup
        }
      ) // when
    }

    //-------------------------------------------------------------------------
    //-------------------------------------------------------------------------
    load()
    {
      const self = this


      self.view.changeViewById( "view2" )

      // // Client list CRUDNAF table.
      // const configTable = new WebSocketCRUDNAF( this.webSocketAPI, "config" )
      // configTable.readAll
      // (
      //   ( data ) => console.log( data )
      // )

    }

    //-------------------------------------------------------------------------
    //-------------------------------------------------------------------------
    constructor( application )
    {
      const self = this
      this.application = application
      this.clientId = application.clientId

      this.webSocketAPI = this.application.webSocketAPI


      // // Load the complete configuration from database
      // this.webSocketAPI.makeRequest
      // (
      //   "database.getJSON_Table",
      //   "config",
      //   function( configuration )
      //   {
      //     self.configuration = configuration
      //
      //     // Need to make a collection of SVG files.
      //     // SVG files come from two locations: maps and icons
      //     self.configuration.svgFiles = {}
      //
      //     // Add each map file.
      //     for ( const [ mapId, map ] of Object.entries( configuration.maps ) )
      //       self.configuration.svgFiles[ map.image ] = configuration[ map.image ]
      //
      //     // Add a request for each of the icon type icons.
      //     for ( const iconType in configuration.iconTypes )
      //     {
      //       const icon = configuration.iconTypes[ iconType ]
      //       self.configuration.svgFiles[ icon.icon ] = configuration[ icon.icon ]
      //     }
      //
      //     self.map = new Map( self.configuration )
      //     //self.view = new View( self.configuration, self.map )
      //
      //   }
      // )

      // Load templates.
      $.get
      (
        'templates/navigation.template.html',
        function( data )
        {
          $( "nav" ).append( data )
          $( "#debugButtons" ).css( "display", "block" )

          //$( "#debug_Template1"     ).click( () => self.displayTemplateExample1()       )
          $( "#debug_Query"         ).click( () => self.databaseQueryExample2()         )
          //$( "#debug_FormatedQuery" ).click( () => self.databaseQueryExample2_Deluxe()  )
          $( "#debug_Clear"         ).click( () => $( "main" ).html( "" )               )
          $( "#debug_Version"       ).click( () => self.displayVersions()               )
          $( "#debug_Control"       ).click( () => new CommandArea( self.webSocketAPI, self.clientId ) )

          $( "#debug_Buttons"       ).click
          (
            function()
            {
              // // Load template.
              // $.get
              // (
              //   'templates/buttons.template.html',
              //   function( templateData )
              //   {
              //     //const html = Template.htmlMap( "#buttonsTemplate", templateData )
              //     const template = $( templateData ).filter( "#buttonsTemplate" ).html()
              //     $( "main" ).html( template )
              //   }
              // )
              console.log( "Click" )
              self.application.configurationEdit =
                new ConfigurationEdit( self.webSocketAPI, {}, {}, {} )
            }
          )
        }
      )
    }

  }

})
