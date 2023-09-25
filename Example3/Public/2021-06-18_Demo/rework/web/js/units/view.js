//-----------------------------------------------------------------------------
// Uses: Map view setup.
// Date: 2019-12-12
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/animate",
  "units/settings",
  "vendor/jquery"
],
function
(
  animate,
  Settings
)
{
  return class View
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Map view setup.
    // Input:
    //   system - Instance of `System`.
    //   map - Instance of `Map`.
    //-------------------------------------------------------------------------
    constructor( system, map )
    {
      this.system       = system
      this.map          = map
      this.currentMapId = null
      this.viewButtons  = 0

      let isHold = false
      this.views = {}

      // Set to true to disable normal view button functions.
      // Used when setting up buttons.
      this.isHold = false

      // Flush any existing view selections (in case of reload).
      $( "#viewButtonsDiv" ).text( "" )

      // Are there any views?
      if ( Object.keys( system.clientViews ).length > 0 )
      {
        // What client are we?
        var clientViewId = system.clientId
        if ( null == clientViewId )
          clientViewId = system.setup.defaultClient

        // Get the views this client has available.
        const clientViews = system.clientViews[ clientViewId ]

        if ( clientViews )
        {
          // Alias all the views.
          this.views = system.views

          // If there is more than one view, add the view switch icons.
          if ( clientViews.views.length > 1 )
            for ( const viewId of clientViews.views )
            {
              const view = system.views[ viewId ]
              this._add( view )
            }

          // Set the initial view.
          this.changeViewById( clientViews.views[ 0 ] )
        }
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Display the view name.
    // Input:
    //   view - View record.
    //-------------------------------------------------------------------------
    _setName( view )
    {
      $( "#viewNameDiv" ).text( view.label )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Change to new view.
    // Input:
    //   id - The view id to switch into.
    //-------------------------------------------------------------------------
    changeViewById( id )
    {
      const view = this.views[ id ]
      if ( ( ! this.isHold )
        && ( view ) )
      {
        this.changeView( view )
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Change to specified view.
    // Input:
    //   view - View record.
    //-------------------------------------------------------------------------
    changeView( view )
    {
      this.currentView = view.id

      this._setName( view )
      this.map.loadMap( view.mapId )
      this.currentMapId = view.mapId
      this.map.setView( view )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Translate between start and end value.
    // Input:
    //   start - Initial value.
    //   end - Finial value.
    //   progress - Desired ratio between start and end (0-1).
    // Output:
    //   Translated value.
    //-------------------------------------------------------------------------
    _translate( start, end, progress )
    {
      return ( end - start ) * progress + start
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Animate a change to new view.
    // Input:
    //   id - The view id to switch into.
    //-------------------------------------------------------------------------
    _animateView( id )
    {
      const start = this.map.getView()
      const end = this.views[ id ]

      const view = this.views[ id ]

      this._setName( view )

      if ( view.mapId != this.currentMapId )
      {
        this.map.loadMap( view.mapId )
        this.currentMapId = view.mapId
        this.map.setView( view )
      }
      else
      if ( ( ! this.isHold )
        && ( end )
        && ( this.map.isViewDifferent( start, end ) ) )
      {
        const self = this
        animate
        (
          Settings.AnimateSpeed,
          function( progress )
          {
            const view =
            {
              xOffset  : self._translate( start.xOffset,  end.xOffset,  progress ),
              yOffset  : self._translate( start.yOffset,  end.yOffset,  progress ),
              scale    : self._translate( start.scale,    end.scale,    progress ),
              rotation : self._translate( start.rotation, end.rotation, progress )
            }
            self.map.setView( view )
          }
        )

        this.currentView = id
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Draw a new view button.
    // Input:
    //   view - View data to be used when button is pressed.
    //-------------------------------------------------------------------------
    _add( view )
    {
      this.viewButtons += 1
      $( "<div>" )
        .html( this.viewButtons )
        .data( "id", view.id )
        .click( () => this._animateView( view.id ) )
        .addClass( "viewDiv" )
        .appendTo( "#viewButtonsDiv" )
        .hover
        (
          function()
          {
            // Show the name of this view when hovered.
            $( this ).w2tag( view.label, { position: "top" } )
          },
          function()
          {
            // Remove hover tag when mouse leaves.
            $( this ).w2tag( "" )
          }
        )
    }

  } // class
})
