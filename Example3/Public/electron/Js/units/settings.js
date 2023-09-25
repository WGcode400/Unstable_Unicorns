//-----------------------------------------------------------------------------
// Uses: Settings (constants) for user interface.
// Date: 2020-01-28
//-----------------------------------------------------------------------------

"use strict"

define(
[
],
function
(
)
{
  const settings =
  {
    // The URL of the server WebSocket.
    WebSocketURL: window.location.hostname, // <- Same as the HTML server.

    // Port of WebSocket on server.
    WebSocketPort : 9001,

    WebSocketPath : "/client",

    // Delay after a connection failure before trying again.
    WebSocketReconnectTime : 1000,

    // Rotation animate speed when changing views.
    AnimateSpeed  : 2000,

    // Scaling of icon when alarming.
    AlarmIconScale : 1.5,

    // Default icon/font size in pixels.
    DefaultIconSize : 20,
    DefaultFontSize : 20,

    // Speed at which map fade in after loading.
    FadeInSpeed : 1000,

    // Speed at which legend slides in/out.
    panelSpeed : 500,

    // Speed at which menu slides in/out.
    MenuSpeed : 500,

    // Time after menu losses focus before hiding it.
    MenuTimeout: 1000,
  }

  return settings
})
