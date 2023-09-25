//-----------------------------------------------------------------------------
// Uses: Command to clients interface.
// Date: 2021-05-22
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "units/map",
  "units/webSocketCRUDNAF",
  "units/deltaRecordSet",
  "library/urlParameters",
  "library/svgAssist",
  "library/jsonImportExport",
  "library/template",
  "library/uuid4",
],
function
(
  Map,
  WebSocketCRUDNAF,
  DeltaRecordSet,
  urlParameters,
  SVG_Assist,
  JSON_ImportExport,
  Template,
  uuid4,
)
{
  // Load template.
  const templateQuery =
    $.get
    (
      'templates/command.template.html',
      function( data )
      {
        $( "body" ).append( data )
      }
    )

  return class CommandArea
  {
    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    _addText( text )
    {
      var currentText = $( "#command_TextArea" ).val()
      if ( "" != currentText )
        currentText += "\n"

      $( "#command_TextArea" ).val( currentText + text )
    }

    _drawMap( clientId, view )
    {
      // self.webSocketAPI.makeClientRequests
      // (
      //   clientId,
      //
      // )
      const self = this

      this.webSocketAPI.makeRequest
      (
        "database.getJSON_Table",
        "config",
        function( configuration )
        {
          //$$$ self.map.setView( self.configuration.views[ "view1" ] )
          //$$$ self.map.showMap( "mapA", self.configuration )

          //self.configuration = configuration

          const query =
          {
            request :
            {
              name : "map.show",
              parameters :
              {
                view: view,
                configuration: configuration
              }
            }
          }

          self.webSocketAPI.makeClientRequests( clientId, query )
        }
      )
    }

    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    _draw()
    {
      const self = this

      // Clear main
      $( "main" ).html( "" )

      const html = Template.htmlMap( "#commandTemplate", {} )
      $( html ).appendTo( "main" )

      // For each connected client...
      for ( const client of Object.values( this.clientList.records ) )
      {
        client.isThis = ""
        if ( client.id == this.clientId )
          client.isThis = " (this)"

        const html = Template.htmlMap( "#commandButtonTemplate", client )
        $( html ).appendTo( "#command_DataArea" )

        // Button A will draw the map.
        $( "#command_" + client.id + "_ButtonA" ).click( () => this._drawMap( client.id, "view1" ) )
        $( "#command_" + client.id + "_ButtonB" ).click( () => this._drawMap( client.id, "view2" ) )
        $( "#command_" + client.id + "_ButtonC" ).click( () => this._drawMap( client.id, "view3" ) )

        // Button B will sign up for notifications from button presses.
        $( "#command_" + client.id + "_ButtonD" )
          .click
          (
            function()
            {
              // Sign up to receive clicks from client.
              self.webSocketAPI.makeClientRequests
              (
                client.id,
                {
                  request :
                  {
                    name : "jqueryNotification",
                    parameters :
                    {
                      selector : "#buttons_div button", // All button objects.
                      function : "click",  // The click function.
                      notificationId : self.notificationId, // The notification to send.
                      parameters : client.id // Additional parameters passed back--which client.
                    }
                  }
                }
              ) // makeClientRequests
            }
          ) // click

        // Button B will sign up for notifications from button presses.
        $( "#command_" + client.id + "_ButtonE" )
          .click
          (
            function()
            {
              // Sign up to receive clicks from client.
              self.webSocketAPI.makeClientRequests
              (
                client.id,
                {
                  request :
                  {
                    name : "mapIconNotification",
                    parameters :
                    {
                      notificationId : self.notificationId, // The notification to send.
                      parameters : client.id // Additional parameters passed back--which client.
                    }
                  }
                }
              ) // makeClientRequests
            }
          ) // click



        // Button F
        $( "#command_" + client.id + "_ButtonF" )
          .click
          (
            function()
            {
              // Sign up to receive clicks from client.
              self.webSocketAPI.makeClientRequests
              (
                client.id,
                {
                  request :
                  {
                    name : "template",
                    parameters :
                    {
                      template: "templates/example3.template.html",
                      id: "#example3_Template",
                      data:
                      {
                        id: 123,
                        first: "Jane",
                        last: "Smith",
                        address: "123 Main St.",
                        city: "Anytown",
                        state: "NY",
                        workPhone: "555-555-5555",
                        photo: "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",

                      }
                    }
                  }
                }
              ) // makeClientRequests
            }
          ) // click

      }
    }

    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    _setup()
    {
      const self = this

      this.notificationId = uuid4()

      // Make a notification for clicks.
      this.webSocketAPI.makeRequest
      (
        "clientData.makeNotification",
        [
          self.clientId,
          self.notificationId
        ],
        function()
        {
          // Sign-up to receive notifications for clicks.
          self.webSocketAPI.requestNotification
          (
            self.notificationId,
            function( data )
            {
              const client = self.clientList.records[ data.data.parameters ].name

              self._addText( client + ":" + data.data.id + " click" )
            }
          )
        }
      )
    }

    //-------------------------------------------------------------------------
    // $$$
    //-------------------------------------------------------------------------
    constructor( webSocketAPI, clientId )
    {
      const self = this
      this.webSocketAPI = webSocketAPI
      this.clientId = clientId.getId()

      // Client list CRUDNAF table.
      const clientList = new WebSocketCRUDNAF( self.webSocketAPI, "clientData" )

      // Make a new delta record set to hold/track client list.
      // This allows the client list changes to be tracked.
      this.clientList =
        new DeltaRecordSet
        (
          $.proxy( clientList.notification, clientList ),
          function( callback )
          {
            // Read the client list.
            self.webSocketAPI.makeRequest( "clientData.readAll", [], callback )
          }
        )

      // When client data first loads or changes, redraw the client data area.
      this.clientList
        .onLoad
        (
          function()
          {
            // Setup screen.
            self._setup()

            self._draw()
          }
        )
        .onChange( $.proxy( this._draw, this ) )
    }

  }

})
