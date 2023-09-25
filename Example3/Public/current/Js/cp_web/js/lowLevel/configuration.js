//-----------------------------------------------------------------------------
// Uses: Configuration for RequreJS.
// Date: 2020-01-14
// Notes:
//   This file is mainly for the shims section.
//-----------------------------------------------------------------------------

"use strict"

require.config
(
  {
    // Base URL for all Javascript (relative to the web directory).
    baseUrl : 'js',

    // Shims are used for libraries that doesn't directly support AMD.
    shim :
    {
      // Mouse wheel.
      // JQuery plugin and exports nothing else.
      'vendor/mousewheel' :
      {
        deps : [ 'vendor/jquery' ]
      },

      // JQuery UI.
      // JQuery plugin and exports nothing else.
      'vendor/jquery-ui' :
      {
        deps : [ 'vendor/jquery' ]
      },

      // W2UI widget library.
      'vendor/w2ui' :
      {
        deps : [ 'vendor/jquery' ],
        exports : 'w2ui'
      },

      // FileSaver saving library.
      'vendor/FileSaver' :
      {
        //deps : [ 'vendor/FileSaver' ],
        exports : 'FileSaver'
      }
    },

    // Wait timeout for slow Raspberry Pi 1.
    // $$$FUTURE - Remove when no longer using Pi 1 for demo.
    waitSeconds : 60
  }
)
