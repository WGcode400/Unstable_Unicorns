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
  "debug/randomName",
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
  RandomName,
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
    _editMap( clientId )
    {
      const self = this

      this.webSocketAPI.makeRequest
      (
        "database.getJSON_Table",
        "config",
        function( configuration )
        {
          const query =
          {
            request :
            {
              name : "map.edit",
              parameters :
              {
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
                      function : "click",  // The click function.
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
                      insertSelector : "main",
                      method : "replace",
                      data:
                      {
                        id: 123,
                        first: "Jane",
                        last: "Smith",
                        address: "123 Main St.",
                        city: "Anytown",
                        state: "NY",
                        workPhone: "555-555-5555",
                        sex: "female",

                      }
                    }
                  }
                }
              ) // makeClientRequests
            }
          ) // click

        // Button G
        $( "#command_" + client.id + "_ButtonG" )
          .click
          (
            function()
            {
              const NUMBER = 10

              const records = []
              for ( var count = 0; count < NUMBER; count += 1 )
              {
                const sex = Math.random() <= 0.5 ? "female" : "male"
                const fullName = RandomName.fullName( sex )
                const address  = RandomName.streetName()
                const city     = RandomName.city()
                const state    = RandomName.state()
                const phone    = RandomName.phoneNumber( state )
                records.push
                (
                  {
                    id: count,
                    first: fullName[ 0 ],
                    last: fullName[ 2 ],
                    address: address,
                    city: city,
                    state: state,
                    workPhone: phone,
                    sex: sex,
                  }
                )
              }


              // Sign up to receive clicks from client.
              self.webSocketAPI.makeClientRequests
              (
                client.id,
                {
                  request :
                  {
                    name : "templateArray",
                    parameters :
                    {
                      template: "templates/example3.template.html",
                      wrapperId: "#example3_EditTemplate",
                      elementId: "#example3_Template",
                      insertSelector : "#example3_Edit",
                      wrapperInsert : "main",
                      wrapperMethod : "replace",
                      data: records
                    }
                  }
                }
              ) // makeClientRequests
            }
          ) // click

        $( "#command_" + client.id + "_ButtonH" ).click( () => this._editMap( client.id ) )

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
