//-----------------------------------------------------------------------------
// Uses:
// Date: 2021-06-16
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "units/accutechAPI",
  "units/map",
  "units/view",
  "units/system",
  "library/template",
  "screens/configurationEdit",
],
function
(
  AccutechAPI,
  Map,
  View,
  System,
  Template,
  ConfigurationEdit,
)
{
  return class WebSocketRequests
  {
    // $$$MOVED //-------------------------------------------------------------------------
    // $$$MOVED // Uses:
    // $$$MOVED //   The configuration needs a dictionary of SVG files for both the maps
    // $$$MOVED //   and map icons.
    // $$$MOVED //-------------------------------------------------------------------------
    // $$$MOVED _setupSVG_Configuration( configuration )
    // $$$MOVED {
    // $$$MOVED   // Need to make a collection of SVG files.
    // $$$MOVED   // SVG files come from two locations: maps and icons
    // $$$MOVED   configuration.svgFiles = {}
    // $$$MOVED
    // $$$MOVED   // Add each map file.
    // $$$MOVED   for ( const [ mapId, map ] of Object.entries( configuration.maps ) )
    // $$$MOVED     configuration.svgFiles[ map.image ] = configuration[ map.image ]
    // $$$MOVED
    // $$$MOVED   // Add a request for each of the icon type icons.
    // $$$MOVED   for ( const iconType in configuration.iconTypes )
    // $$$MOVED   {
    // $$$MOVED     const icon = configuration.iconTypes[ iconType ]
    // $$$MOVED     configuration.svgFiles[ icon.icon ] = configuration[ icon.icon ]
    // $$$MOVED   }
    // $$$MOVED }

    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    constructor( webSocketAPI )
    {
      const self = this
      this.webSocketAPI = webSocketAPI
      this.accutechAPI = new AccutechAPI( webSocketAPI )

      // Show a specified map/view.
      // Input:
      //   {
      //     configuration - Complete configuration of system.
      //     view - View id of view to be displayed.
      //   }
      // Output:
      //   Always returns `true`.
      this.webSocketAPI.registerRequest
      (
        "map.show",
        function( parameters )
        {
          console.log( self.accutechAPI )
          self.system = new System( self.accutechAPI, parameters.configuration )
          //const configuration = parameters.configuration
          //self._setupSVG_Configuration( configuration )

          const view = self.system.views[ parameters.view ]

          self.map = new Map( self.system )

          self.map.showMap( view.mapId, self.system )
          self.map.setView( view )

          return true
        }
      )

      // $$$
      // Input:
      //   {
      //     configuration - Complete configuration of system.
      //   }
      // Output:
      //   Always returns `true`.
      this.webSocketAPI.registerRequest
      (
        "map.edit",
        function( parameters )
        {
          //const configuration = parameters.configuration
          self.system = new System( self.accutechAPI, parameters.configuration )

          // self._setupSVG_Configuration( configuration )
          //
          //
          self.map = new Map( self.system )
          self.view = new View( self.system, self.map )
          if ( parameters.configuration.views )
          {
            // const view = Object.values( parameters.configuration.views )[ 0 ]
            // if ( view )
            // {
            //   self.map.showMap( view.mapId, self.system )
            //   self.map.setView( view )
            //   self.view = new View( self.system, self.map )
            // }
            const view = Object.values( parameters.configuration.views )[ 0 ]
            if ( view )
              self.map.showMap( view.mapId, self.system )

          }


          self.configurationEdit =
            new ConfigurationEdit( self.accutechAPI, self.system, self.map, self.view, () => console.log( "Save callback" ) )

          return true
        }
      )


      // Sign up for a notification
      // Input:
      //   {
      //     selector - Selector for what element(s) to bind.
      //     function - Bind what function (click, dblclick, mouseenter, etc.)
      //     notificationId - The notification to send when function occurs.
      //     parameters - Additional parameters passed back.
      //   }
      // Output:
      //   Always returns true.
      // Notification:
      //   {
      //     id - Id of element that caused event to trigger.
      //     path - Full path of element that caused the trigger.
      //     parameters - Additional parameters passed in when registering.
      //   }
      this.webSocketAPI.registerRequest
      (
        "jqueryNotification",
        function( data )
        {
          //console.log( "jqueryNotification", data )

          $( data.selector ).bind
          (
            data.function,
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

          return true
          // $$$ return { data: null, error: null }
        }
      )

      // Sign up for a notification for a map icon is clicked.
      // Input:
      //   {
      //     selector - Selector for what element(s) to bind.
      //     function - Bind what function (click, dblclick, mouseenter, etc.)
      //     notificationId - The notification to send when function occurs.
      //     parameters - Additional parameters passed back.
      //   }
      // Output:
      //   Always returns true.
      // Notification:
      //   {
      //     id - Id of element that caused event to trigger.
      //     function - Bind what function (click, dblclick, mouseenter, etc.)
      //     path - Full path of element that caused the trigger.
      //     parameters - Additional parameters passed in when registering.
      //   }
      this.webSocketAPI.registerRequest
      (
        "mapIconNotification",
        function( data )
        {
          // $$$ console.log( "mapIconNotification", data )

          if ( self.map )
            self.map.setIconBinding
            (
              data.function,
              function( id )
              {
                // $$$ console.log( "Click", clickedObjectData )

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

          return true
          //$$$ return { data: null, error: null }
        }
      )




      //   {
      //     template - Template file to load.
      //     id - Selector for which element of template to use.
      //     data - Data to place into template.
      //     insertSelector - Where to insert the template.
      //     method - Either "append" or "replace"
      //   }
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
              const template = $( templateData ).filter( templateId ).html()
              const html = Template.processMap( template, data )
              console.log( parameters.insertSelector )
              if ( "append" == parameters.method )
                $( parameters.insertSelector ).append( html )
              else
                $( parameters.insertSelector ).html( html )
            }
          )

          return true
        }
      )

      // Create several template objects from an array of data.
      // Input:
      //   {
      //     template - Template file to load.
      //     wrapperId - Selector for which element of template for wrapper.
      //     elementId - Selector for which element of template to each element.
      //     wrapperData - Data for wrapper template.
      //     data - Array of element data.
      //   }
      this.webSocketAPI.registerRequest
      (
        "templateArray",
        function( parameters )
        {
          // Load template.
          $.get
          (
            parameters.template,
            function( templateData )
            {
              const wrapperTemplate = $( templateData ).filter( parameters.wrapperId ).html()
              const wrapperHTML = Template.processMap( wrapperTemplate, parameters.datwrapperDataa )

              if ( "append" == parameters.wrapperMethod )
                $( parameters.wrapperInsert ).append( wrapperHTML )
              else
                $( parameters.wrapperInsert ).html( wrapperHTML )

              $( parameters.insertSelector ).text( "" )
              for ( const record of parameters.data )
              {
                const template = $( templateData ).filter( parameters.elementId ).html()
                const html = Template.processMap( template, record )

                $( parameters.insertSelector ).append( html )
              }
            }
          )

          return true
        }
      )

    }


  } // class
})
