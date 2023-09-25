//-----------------------------------------------------------------------------
// Uses: Menu buttons.
// Date: 2019-12-18
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/urlParameters",
  "library/svgAssist",
  "units/settings",
  "screens/help",
  "screens/tagEdit",
  "screens/eventEdit",
  "screens/configurationEdit",
],
function
(
  urlParameters,
  SVG_Assist,
  Settings,
  Help,
  TagEdit,
  EventEdit,
  ConfigurationEdit,
)
{
  return class Menu
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Toggle visibility of menu buttons.
    //-------------------------------------------------------------------------
    toggleMenu()
    {
      $( "#navigationButtons" )
        .toggle
        (
          "slide",
          { direction: "right" },
          Settings.MenuSpeed,
          $.proxy( this._setupButtons, this )
        )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Setup an SVG image button.
    // Input:
    //   selector - Selector to apply button.
    //   callback - Callback to run.
    //-------------------------------------------------------------------------
    _makeButton( selector, description, callback )
    {
      SVG_Assist
        .getSVG_InObject( selector )
        .off()
        .click( callback )

     $( selector )
        .hover
        (
          function()
          {
            // Show the name of this view when hovered.
            $( this ).w2tag( description, { position: "top", left: 17, top: 7 } )
          },
          function()
          {
            // Remove hover tag when mouse leaves.
            $( this ).w2tag( "" )
          }
        )

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Run configuration editor.
    //-------------------------------------------------------------------------
    _configurationEdit()
    {
      const configurationEdit =
        new ConfigurationEdit
        (
          this.accutechAPI,
          this.system,
          this.map,
          this.view
        )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Setup menu buttons.
    //-------------------------------------------------------------------------
    _setupButtons()
    {
      const self = this

      this._makeButton
      (
        "#menuButton",
        "Main menu",
        $.proxy( this.toggleMenu, this )
      )

      this._makeButton
      (
        "#helpButton",
        "Help",
        () => new Help( self.accutechAPI, self.system )
      )

      this._makeButton
      (
        "#configureButton",
        "Layout edit",
        $.proxy( this._configurationEdit, this )
      )

      this._makeButton
      (
        "#setupButton",
        "Configuration",
        () => new EventEdit( self.accutechAPI, self.system )
      )

      this._makeButton
      (
        "#reportsButton",
        "Report generation"
      )

      this._makeButton
      (
        "#userButton",
        "User menu"
      )

      this._makeButton
      (
        "#transferButton",
        "Patient transfers"
      )

      this._makeButton
      (
        "#tagsButton",
        "Patient tag assignments",
        () => new TagEdit( self.system )
      )

    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Initialize menu buttons.
    // Input:
    //   accutechAPI - Instance of `AccutechAPI`.
    //   system - Instance of `System`.
    //   map - Instance of `Map`.
    //   view - Instance of `view`.
    //-------------------------------------------------------------------------
    constructor( accutechAPI, system, map, view )
    {
      this.accutechAPI   = accutechAPI
      this.system        = system
      this.map           = map
      this.view          = view

      this._setupButtons()

      const parameters = urlParameters()
      if ( parameters.config )
        new ConfigurationEdit( accutechAPI, system, map, view )

      const self = this

      // Hide navigation menu on loss of focus.
      var navigationTimer = null
      $( "#navigationMenu" )
        .off()
        .mouseenter
        (
          function()
          {
            if ( null !== navigationTimer )
              clearTimeout( navigationTimer )

            navigationTimer = null
          }
        )
        .mouseleave
        (
          function()
          {
            // Hide menu bar, but delay slight.
            // This takes care of moving the navigation before a button in the menu
            // is registered as pressed, which can cause that button not to activate.
            if ( $( "#navigationButtons" ).is( ':visible' ) )
              navigationTimer = setTimeout( self.toggleMenu, Settings.MenuTimeout )
          }
        )

    }

  }

})
