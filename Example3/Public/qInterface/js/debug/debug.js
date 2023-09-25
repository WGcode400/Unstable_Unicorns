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

      console.log( "Here" )

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

      this.webSocketAPI.registerRequest
      (
        "map.show",
        function( parameters )
        {
          const configuration = parameters.configuration
          const view = configuration.views[ parameters.view ]
          const selectedMap = view.mapId

          // Need to make a collection of SVG files.
          // SVG files come from two locations: maps and icons
          configuration.svgFiles = {}

          // Add each map file.
          for ( const [ mapId, map ] of Object.entries( configuration.maps ) )
            configuration.svgFiles[ map.image ] = configuration[ map.image ]

          // Add a request for each of the icon type icons.
          for ( const iconType in configuration.iconTypes )
          {
            const icon = configuration.iconTypes[ iconType ]
            configuration.svgFiles[ icon.icon ] = configuration[ icon.icon ]
          }

          self.map = new Map( configuration )

          self.map.showMap( selectedMap, configuration )
          self.map.setView( view )

          //self.map.setIconClick( ( data ) => console.log( "Click", data ) )
          //console.log( self.map._receivers )
          //map.getIcon( "Z1.R0" ).click( () => console.log( "Click" ) )

          return true
        }
      )

      // $$$MOVE
      this.webSocketAPI.registerRequest
      (
        "jqueryNotification",
        function( data )
        {
          console.log( "jqueryNotification", data )
          $( data.selector ).click
          (
            function()
            {
              const id = $( this ).attr( "id" )
              const path = $.getPath( this )
              self.webSocketAPI.sendNotification
              (
                data.notificationId,
                {
                  id: id,
                  path: path,
                  parameters : data.parameters
                }
              )
            }
          )

          return { data: null, error: null }
        }
      )

      // $$$MOVE
      this.webSocketAPI.registerRequest
      (
        "mapIconNotification",
        function( data )
        {
          console.log( "mapIconNotification", data )
          if ( self.map )
            self.map.setIconClick
            (
              function( id )
              {
                //console.log( "Click", clickedObjectData )
                self.webSocketAPI.sendNotification
                (
                  data.notificationId,
                  {
                    id: id,
                    parameters : data.parameters
                  }
                )
              }
            )

          return { data: null, error: null }
        }
      )




      // $$$MOVE
      this.webSocketAPI.registerRequest
      (
        "template",
        function( parameters )
        {
          const templateName = parameters.template
          const templateId = parameters.id
          const data = parameters.data

          // Load template.
          $.get
          (
            templateName,
            function( templateData )
            {
              //const html = Template.htmlMap( "#buttonsTemplate", templateData )
              const template = $( templateData ).filter( templateId ).html()
              const html = Template.processMap( template, data )
              $( "main" ).html( html )
            }
          )

          return { data: null, error: null }
        }
      )




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
              // Load template.
              $.get
              (
                'templates/buttons.template.html',
                function( templateData )
                {
                  //const html = Template.htmlMap( "#buttonsTemplate", templateData )
                  const template = $( templateData ).filter( "#buttonsTemplate" ).html()
                  $( "main" ).html( template )
                }
              )
            }
          )

          // $( "#debug_ButtonB" ).click
          // (
          //   function()
          //   {
          //     self.map.setView( self.configuration.views[ "view1" ] )
          //     self.map.showMap( "mapA", self.configuration )
          //     console.log( self.map._receivers )
          //     self.map.getIcon( "Z1.R0" ).click( () => console.log( "Click" ) )
          //   }
          // )
          //
          // $( "#debug_ButtonC" ).click
          // (
          //   function()
          //   {
          //     self.map.setView( self.configuration.views[ "view2" ] )
          //   }
          // )
          //
          // $( "#debug_ButtonD" ).click
          // (
          //   function()
          //   {
          //     self.map.setView( self.configuration.views[ "view3" ] )
          //     self.map.showMap( "mapB", self.configuration )
          //   }
          // )
          //
          //$( "#debug_ButtonB"       ).click( () => self.view.changeViewById( "view1" ) )
          //$( "#debug_ButtonC"       ).click( () => self.view.changeViewById( "view2" ) )

        }
      )
    }

  }

})
