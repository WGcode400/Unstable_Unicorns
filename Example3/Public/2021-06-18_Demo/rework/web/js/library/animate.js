//-----------------------------------------------------------------------------
// Uses: Cosine curved animated callback.
// Date: 2020-01-17
// Author: Andrew Que (http://www.DrQue.net)
//
//                          (C) 2020 by Andrew Que
//-----------------------------------------------------------------------------

"use strict"

define(
[
],
function
(
)
{
  //---------------------------------------------------------------------------
  // Uses:
  //   Setup an animation callback that will last a specified duration and
  //   use cosine easing (smooth start, smooth stop).
  // Input:
  //   duration - Time (in milliseconds) to run animation.
  //   stepCallback( progress ) - Callback to run each step of animation.
  //     progress - Value between 0 and 1 denoting animation progress.
  //---------------------------------------------------------------------------
  return function( duration, stepCallback )
  {
    let start
    function tick( timestamp )
    {
      if ( ! start )
        start = timestamp

      // Linear progress.
      let progress = ( timestamp - start ) / duration

      // Clip at 100%.
      progress = Math.min( progress, 1.0 )

      // Non-linear easing.
      progress = 0.5 - 0.5 * Math.cos( progress * Math.PI )

      stepCallback( progress)

      // If there is still time, ask for another animation frame.
      if ( progress < 1.0 )
        window.requestAnimationFrame( tick )
    }

    // Start animation.
    window.requestAnimationFrame( tick )
  }
})
