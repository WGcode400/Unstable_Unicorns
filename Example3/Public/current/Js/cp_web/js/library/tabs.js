//-----------------------------------------------------------------------------
// Uses: Tab-style area enabling.
// Date: 2020-02-11
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "vendor/jquery"
],
function
(
)
{
  //-------------------------------------------------------------------------
  // Uses:
  //   Individual tab.
  //-------------------------------------------------------------------------
  class Tab
  {
    //-----------------------------------------------------------------------
    // Uses:
    //   Set callback to run when this tab as active.
    // Input:
    //   callback - Function to run.
    //-----------------------------------------------------------------------
    setFocus( callback )
    {
      this._focus = callback
    }

    //-----------------------------------------------------------------------
    // Uses:
    //   Set callback to run when this tab becomes inactive.
    // Input:
    //   callback - Function to run.
    //-----------------------------------------------------------------------
    setBlur( callback )
    {
      this._blur = callback
    }

    //-----------------------------------------------------------------------
    // Uses:
    //   Make this tab active.
    //-----------------------------------------------------------------------
    focus()
    {
      const tabSet = this.element.parent()
      const masterSet = tabSet.parent()

      masterSet.append( tabSet )

      this.body.show()
      this.element.addClass( "activeTab" )

      if ( this._focus )
        this._focus()
    }

    //-----------------------------------------------------------------------
    // Uses:
    //   Make this tab inactive.
    //-----------------------------------------------------------------------
    blur()
    {
      this.body.hide()
      this.element.removeClass( "activeTab" )

      if ( this._blur )
        this._blur()
    }

    //-----------------------------------------------------------------------
    // Input:
    //   element - Element instance for the tab.
    //   body - Element instance that has the tab's content.
    //-----------------------------------------------------------------------
    constructor( element, body  )
    {
      this.element = element
      this.body    = body
      this._focus  = null
      this._blur   = null
    }
  }

  //-------------------------------------------------------------------------
  // Uses:
  //   Set of tabs.
  //-------------------------------------------------------------------------
  return class Tabs
  {
    //-----------------------------------------------------------------------
    // Uses:
    //   Set focus callback for specified tab.
    // Input:
    //   tabName - Which tab.
    //   callback - Focus function to run.
    //-----------------------------------------------------------------------
    setFocus( tabName, callback )
    {
      this.tabs[ tabName ].setFocus( callback )
    }

    //-----------------------------------------------------------------------
    // Uses:
    //   Set blur callback for specified tab.
    // Input:
    //   tabName - Which tab.
    //   callback - Focus function to run.
    //-----------------------------------------------------------------------
    setBlur( tabName, callback )
    {
      this.tabs[ tabName ].setBlur( callback )
    }

    //-----------------------------------------------------------------------
    // Uses:
    //   Return name of title of tab.
    // Input:
    //   tabName - Which tab.
    //-----------------------------------------------------------------------
    get( tabName )
    {
      return this.tabs[ tabName ]
    }

    //-----------------------------------------------------------------------
    // Uses:
    //   Shutdown tabs.
    // Notes:
    //   Requires `open` be called before tabs are again available.
    //-----------------------------------------------------------------------
    close()
    {
      if ( this.activeTab )
        this.activeTab.blur()

      this.activeTab = null
    }

    //-----------------------------------------------------------------------
    // Uses:
    //   Start tab operations.
    //-----------------------------------------------------------------------
    open()
    {
      this._select( this.defaultTab )
    }

    //-----------------------------------------------------------------------
    // Uses:
    //   Switch to specified tab.
    // Input:
    //   tabName - Which tab.
    //-----------------------------------------------------------------------
    _select( tabName )
    {
      // De-activate the current tab (if there is one).
      if ( this.activeTab )
        this.activeTab.blur()

      // Activate new tab and remember save the instance for latter.
      this.activeTab = this.tabs[ tabName ]
      this.activeTab.focus()
    }

    //-----------------------------------------------------------------------
    // Input:
    //   selector - A selector that captures each tab.
    //   defaultTab - Which tab to run by default.
    //   isOpen - True (default) to start open/active.
    //-----------------------------------------------------------------------
    constructor( selector, defaultTab = null, isOpen = true )
    {
      const self = this

      this.tabs = {}
      this.tabSets = {}
      this.defaultTab = defaultTab

      this.activeTab = null
      this.activeTabSet = null

      // Every item the selector finds is a tab.
      $( selector ).each
      (
        function( index, rawElement )
        {
          // The tab element as jquery object.
          const element = $( rawElement )

          // Name of the tab is held in "data-tabName" attribute.
          const tabName = element.data( "tabName" )

          // Body of the data is held in an element identified by tab name.
          const tabBody = $( "#" + tabName )

          // Create `Tab` instance for this new tab.
          self.tabs[ tabName ] = new Tab( element, tabBody )
          element.click( () => self._select( tabName ) )

          // If there is no default tab, use first tab.
          if ( null === self.defaultTab )
            self.defaultTab = tabName
        }
      )

      if ( isOpen )
        self.open()
    }
  }
})
