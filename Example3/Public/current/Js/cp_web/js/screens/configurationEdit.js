//-----------------------------------------------------------------------------
// Uses: System configuration edit.
// Date: 2020-02-11
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "library/svgAssist",
  "library/tabs",

  "screens/layoutTabs/assetsTab",
  "screens/layoutTabs/clientsTab",
  "screens/layoutTabs/placementTab",
  "screens/layoutTabs/viewsTab",
  "screens/layoutTabs/receiversTab",
  "screens/layoutTabs/systemTab",
  "screens/layoutTabs/areasTab",
  "screens/layoutTabs/controllersTab",

  "vendor/jquery"
],
function
(
  SVG_Assist,
  Tabs,

  AssetsTab,
  ClientsTab,
  PlacementTab,
  ViewsTab,
  ReceiversTab,
  SystemTab,
  AreasTab,
  ControllersTab,
)
{
  // Load templates.
  const template = $.get
  (
    'templates/configurationEdit.template.html',
    function( data )
    {
      $( "body" ).append( data )
    }
  )

  return class ConfigurationEdit
  {
    //-------------------------------------------------------------------------
    // Input:
    //   accutechAPI - Instance of `AccutachAPI`.
    //-------------------------------------------------------------------------
    constructor( accutechAPI, system, map, view )
    {
      $.when( template ).done
      (
        function()
        {
          // Hide the normal navigation menu.
          $( "#mainNavigation,#leftPanel,#rightPanel" ).hide()

          // Show the configuration area.
          const configurationEditTemplate = $( "#configurationEditTemplate" ).html()
          $( "#configuration" ).html( configurationEditTemplate )
          $( "#configuration" ).show()

          const tabs = new Tabs( "#configuration .tabs li", "systemTab", false )

          const tabClasses = {}
          tabClasses.assets         = new AssetsTab(      tabs.get( "assetsTab"      ), accutechAPI, system, map, view )
          tabClasses.clients        = new ClientsTab(     tabs.get( "clientsTab"     ), accutechAPI, system, map, view )
          tabClasses.placement      = new PlacementTab(   tabs.get( "placementTab"   ), accutechAPI, system, map, view )
          tabClasses.views          = new ViewsTab(       tabs.get( "viewsTab"       ), accutechAPI, system, map, view )
          tabClasses.receivers      = new ReceiversTab(   tabs.get( "receiversTab"   ), accutechAPI, system, map, view )
          tabClasses.systemTab      = new SystemTab(      tabs.get( "systemTab"      ), accutechAPI, system, map, view )
          tabClasses.areasTab       = new AreasTab(       tabs.get( "areasTab"       ), accutechAPI, system, map, view )
          tabClasses.controllersTab = new ControllersTab( tabs.get( "controllersTab" ), accutechAPI, system, map, view )

          tabs.open()

          // Setup the close button (situated where the menu button is normally).
          SVG_Assist.getSVG_InObject( "#closeConfigurationButton" ).off().click
          (
            function()
            {
              function closeEdit()
              {

                tabs.close()
                for ( const tabClass of Object.values( tabClasses ) )
                  tabClass.blur()

                $( "#mainNavigation" ).show()
                $( "#configuration" ).hide()
                system.reload()
              }

              const facility = Object.values( system.facility )[ 0 ]

              const topologyCommitted =
                ( system.topologyTimestamp == facility.topologyTimestamp )

              if ( ! topologyCommitted )
              {
                w2confirm
                (
                  'Topology has not been committed.  Committing now?',
                  function( answer )
                  {
                    if ( "Yes" == answer )
                      system.commitTopology( closeEdit )
                    else
                      closeEdit()
                  }
                )
              }
              else
                closeEdit()

            }
          )

        }
      )
    } // constructor

  } // class

})
