//-----------------------------------------------------------------------------
// Uses: jQuery plug-in to get a full path to node.
// Date: 2021-06-07
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
  $.getPath = function( node )
  {
    var path

    node = $( node )
    var name = "n/a"
    while ( ( node.length )
         && ( name ) )
    {
      const realNode = node.get( 0 )
      name = realNode.localName

      if ( realNode.id )
        name += '#' + realNode.id
      else
      if ( realNode.className )
        name += '.' + realNode.className

      if ( name )
      {
        name = name.toLowerCase()

        const siblings = node.siblings( name )
        if ( siblings.length > 1 )
        {
          var index = node.index() + 1
          if ( index > 1 )
            name += ':nth-child(' + index + ')'
        }

        if ( path )
          path = " > " + path
        else
          path = ""

        path = name + path

        node = node.parent()
      }
    }

    return path
  }
})
