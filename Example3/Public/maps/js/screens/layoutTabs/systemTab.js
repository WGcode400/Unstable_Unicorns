//-----------------------------------------------------------------------------
// Uses: Basic system settings.
// Date: 2020-02-26
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/svgAssist",
  "library/uuid4",
  "library/jsonImportExport",
  'vendor/w2ui',
  'vendor/jquery-ui'
],
function
(
  SVG_Assist,
  uuid4,
  JSON_ImportExport,
  w2ui
)
{

  return class SystemTab
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Call whenever a change is made.
    //-------------------------------------------------------------------------
    _setChanged()
    {
      $( "#systemTab_SaveButton" ).addClass( "highlight" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Call whenever a changes made are cleared/saved.
    //-------------------------------------------------------------------------
    _clearChanged()
    {
      $( "#systemTab_SaveButton" ).removeClass( "highlight" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //  Save base configuration.
    //-------------------------------------------------------------------------
    _save()
    {
      this.system.setup.facilityName = $( "#systemTab_FacilityName" ).val()
      this.system.setup.defaultClient = $( "#systemTab_DefaultClient" ).val()

      $( "#systemTab_SaveButton" ).prop( "disabled", true )

      const self = this
      this.system.saveItem
      (
        "setup",
        function()
        {
          self._clearChanged()
          $( "#systemTab_SaveButton" ).prop( "disabled", false )
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Setup tab for operation.
    //-------------------------------------------------------------------------
    _focus()
    {
      this.map.setLegendTextEnable( true )

      if ( ! this.system.setup.facilityName )
        this.system.setup.facilityName = ""

      $( "#systemTab_FacilityName" ).val( this.system.setup.facilityName )

      // Empty option for icon type selection.
      const emptyOption = $( "<option>" ).val( "" ).text( "" )

      $( "#systemTab_DefaultClient" ).text( "" ).append( emptyOption )
      for ( const clientView of Object.values( this.system.clientViews ) )
      {
        const option =
          $( "<option>" )
            .val( clientView.id )
            .text( clientView.name )

        $( "#systemTab_DefaultClient" ).append( option )
      }

      if ( this.system.setup.defaultClient )
        $( "#systemTab_DefaultClient" ).val( this.system.setup.defaultClient )

      this._clearChanged()
      this._updateTopologyCommit()
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Close out tab.
    //-------------------------------------------------------------------------
    blur()
    {
    }


    //-------------------------------------------------------------------------
    // Uses:
    //   Export entire configuration.
    //-------------------------------------------------------------------------
    _export()
    {
      const configuration = $.removePrivate( this.system )

      // Remove running data as we only want configuration data.
      delete this.system.tags

      JSON_ImportExport.export( this.system, "configuration.json" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Prompt to import entire configuration.
    //-------------------------------------------------------------------------
    _import( event )
    {
      const self = this

      JSON_ImportExport.import
      (
        function( configurationData )
        {
          self.system.loadFromData( configurationData, true )
          self.system.saveAll( () => w2alert( "Done." ) )
          self._focus()
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Clear out all configuration data.
    //-------------------------------------------------------------------------
    _flush()
    {
      const self = this
      this.system.flush()

      // $$$DEBUG - This can be accomplished using `this.system.saveAll`
      // Decide if that is the correct way or if we want the separate database
      // flush.
      this.accutechAPI.flushConfiguration
      (
        function()
        {
          self.map.loadMap( null )
          self._focus()
          w2alert( "Done." )
        }
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Commit topology (i.e. make it active).
    //-------------------------------------------------------------------------
    _commit()
    {
      this.system.commitTopology( () => w2alert( "Done." ) )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Update the commit button base on if topology has been committed.
    //-------------------------------------------------------------------------
    _updateTopologyCommit()
    {
      const facility = Object.values( this.system.facility )[ 0 ]

      const topologyCommitted =
        ( this.system.topologyTimestamp != facility.topologyTimestamp )

      if ( topologyCommitted )
        $( "#systemTab_CommitButton" ).addClass( "highlight" )
      else
        $( "#systemTab_CommitButton" ).removeClass( "highlight" )

    }

    //-------------------------------------------------------------------------
    // Input:
    //   tab - Instance of `Tab` this tab is running.
    //   accutechAPI - Instance of `AccutechAPI`.
    //   system - Instance of `System`.
    //   map - Instance of `Map`.
    //   view - Instance of `View`.
    //-------------------------------------------------------------------------
    constructor( tab, accutechAPI, system, map, view )
    {
      this.accutechAPI   = accutechAPI
      this.system        = system
      this.map           = map
      this.view          = view

      tab.setFocus( $.proxy( this._focus, this ) )
      tab.setBlur( $.proxy( this.blur, this ) )

      $( "#systemTab_FacilityName"  ).off().change( $.proxy( this._setChanged, this ) )
      $( "#systemTab_DefaultClient" ).off().change( $.proxy( this._setChanged, this ) )

      $( "#systemTab_SaveButton" ).off().click( $.proxy( this._save, this ) )

      $( "#systemTab_ImportButton" ).off().click( $.proxy( this._import, this ) )
      $( "#systemTab_ExportButton" ).off().click( $.proxy( this._export, this ) )
      $( "#systemTab_FlushButton"  ).off().click( $.proxy( this._flush, this ) )
      $( "#systemTab_CommitButton" ).off().click( $.proxy( this._commit, this ) )

      // Update the commit button when facility table changes.
      system.deltaSets.facility.onUpdate( $.proxy( this._updateTopologyCommit, this ) )

    } // constructor

  } // class
})
