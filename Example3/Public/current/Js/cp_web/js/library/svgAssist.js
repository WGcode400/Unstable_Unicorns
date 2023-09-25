//-----------------------------------------------------------------------------
// Uses: SVG manipulation functions.
// Date: 2019-11-07
// Notes:
//   SVG files can be a bit tricky to work with dynamically.  The more common
//   functions have been placed here.
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
  return class SVG_Assist
  {
    //-------------------------------------------------------------------------
    // Uses:
    //   Create an SVG element with correct namespace.
    // Input:
    //   element - Type of element to create.
    // Output:
    //   New element.
    //-------------------------------------------------------------------------
    static createElement( element )
    {
      return document.createElementNS( "http://www.w3.org/2000/svg", element )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Create a link attribute for element.
    // Input:
    //   element - Element instance to add link attribute.
    //   link - What to link to the element.
    // Output:
    //   Returns `element`.
    //-------------------------------------------------------------------------
    static createLink( element, link )
    {
      element.setAttributeNS( 'http://www.w3.org/1999/xlink', 'xlink:href', link )
      return element
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Insert an SVG into HTML.
    // Input:
    //   selector - Selector for where SVG will be inserted.
    //   fileName - File name of SVG to load.
    //   callback - Function to run after SVG has been loaded.
    //-------------------------------------------------------------------------
    static insertSVG( selector, fileName, callback, isPrepend=false )
    {
      // Create an <object> to hold SVG.
      const objectInstance = document.createElement( "object" )

      // Setup callback to run after SVG loading is complete.
      objectInstance.addEventListener
      (
        'load',
        function()
        {
          if ( callback )
          {
            const objectElement = $( objectInstance )
            const svg = objectElement.contents()
            callback( objectElement, svg )
          }
        }
      )

      // Setup <object> and start load.
      objectInstance.setAttribute( "type" , "image/svg+xml" )
      objectInstance.setAttribute( "data", fileName )

      // Add <object> to specified location.
      if ( ! isPrepend )
        $( selector ).append( objectInstance )
      else
        $( selector ).prepend( objectInstance )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add an SVG into another SVG.
    // Input:
    //   parentSVG_Element - Parent SVG to add into.
    //   childFileName - File name of SVG to be added.
    //   x - X-location.
    //   y - Y-location.
    //   callback( element ) - Callback to run once definition has been loaded.
    //     element - Newly created element.
    //-------------------------------------------------------------------------
    static embedSVG( parentSVG_Element, childFileName, x, y, callback = null, id = null )
    {
      return $.get
      (
        childFileName,
        null,
        function( childSVG )
        {
          // Set location.
          childSVG.firstChild.setAttribute( "x", x )
          childSVG.firstChild.setAttribute( "y", y )

          if ( null !== id )
            childSVG.firstChild.setAttribute( "id", id )

          // Add to parent SVG.
          const element = parentSVG_Element.appendChild( childSVG.firstChild )

          if ( callback )
            callback( element )
        },
        'xml'
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add an SVG into another SVG.
    // Input:
    //   parentSVG_Element - Parent SVG to add into.
    //   childDataString - SVG data as string.
    //   x - X-location.
    //   y - Y-location.
    //-------------------------------------------------------------------------
    static embedSVG_FromString( parentSVG_Element, childDataString, x, y, id = null )
    {
      const childSVG = $.parseXML( childDataString ).firstChild

      var gElement = SVG_Assist.createElement( 'g' )

      // Set map position.
      childSVG.setAttribute( "x", x )
      childSVG.setAttribute( "y", y )

      if ( null !== id )
        gElement.setAttribute( "id", id )

      gElement.append( childSVG )
      parentSVG_Element.append( gElement )

      return [ gElement, childSVG ]
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Load an SVG into a new definition (<def> tag) inside SVG.
    // Input:
    //   svg - SVG in which to add definition.
    //   childFileName - File name of SVG to be loaded.
    //   id - Id for new definition.
    //   callback - Callback to run once definition has been loaded.
    //-------------------------------------------------------------------------
    static embedDef( svg, childFileName, id, callback )
    {
      return $.get
      (
        childFileName,
        null,
        function( childSVG )
        {
          // Setup the id of definition.
          // This is how the definition is referenced after creation.
          childSVG.firstChild.setAttribute( "id", id )

          // Create <def> element.
          var defElement = SVG_Assist.createElement( 'def' )

          // Place the loaded SVG into the <def>.
          defElement.appendChild( childSVG.firstChild )

          // Add new <def> to parent SVG.
          //svg.appendChild( defElement )
          svg.append( defElement )

          // Run callback.
          if ( callback )
            callback( defElement, childSVG )
        },
        'xml'
      )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Load an SVG into a new definition (<def> tag) inside SVG.
    // Input:
    //   svg - SVG in which to add definition.
    //   childDataString - SVG data as string.
    //   id - Id for new definition.
    //   callback - Callback to run once definition has been loaded.
    //-------------------------------------------------------------------------
    static embedDef_FromString( svg, childDataString, id, callback )
    {
      const childSVG = $.parseXML( childDataString ).firstChild

      // Setup the id of definition.
      // This is how the definition is referenced after creation.
      childSVG.setAttribute( "id", id )

      // Create <def> element.
      var defElement = SVG_Assist.createElement( 'def' )
      //document.createElementNS( "http://www.w3.org/2000/svg", 'def' )

      // Place the loaded SVG into the <def>.
      defElement.appendChild( childSVG )

      // Add new <def> to parent SVG.
      //svg.appendChild( defElement )
      svg.append( defElement )

      // Run callback.
      if ( callback )
        callback( defElement, childSVG )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a <use> tag to SVG.
    // Input:
    //   insertLocation - Location to place new tag.
    //   id - Id of definition.
    //   x - X-location.
    //   y - Y-location.
    // Output:
    //   Returns instance of <use>.
    //-------------------------------------------------------------------------
    static addUse( insertLocation, id, x, y )
    {
      // Create new <use> element and use the static band template.
      const element = SVG_Assist.createElement( 'use' )
      SVG_Assist.createLink( element, "#" + id )

      // Set map position.
      element.setAttribute( "x", x )
      element.setAttribute( "y", y )

      insertLocation.append( element )

      return element
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add an SVG to document from a text string.
    // Input:
    //   insertLocation - Selector for where SVG is placed.
    //   svgString - String data with SVG content.
    //   id - New id to label SVG.  `null` to not assign an id.
    // Output:
    //   Returns newly created SVG element.
    //-------------------------------------------------------------------------
    static addSVG_FromString( insertLocation, svgString, id, isPrepend=false )
    {
      // Convert the string to XML object.
      const svgBody = $.parseXML( svgString )
      const svgElement = $( svgBody ).find( 'svg' )

      // Give object an id.
      if ( null != id )
        svgElement.attr( "id", id )

      // Add object to requested location.
      if ( ! isPrepend )
        $( insertLocation ).append( svgElement );
      else
        $( insertLocation ).prepend( svgElement );

      return $( svgElement )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Get a jQuery object of SVG embedded in an <object> tag.
    // Input:
    //   selector - Selector to SVG object.
    // Output:
    //   The embedded SVG.
    //-------------------------------------------------------------------------
    static getSVG_InObject( selector )
    {
      const svgObject = $( selector )[ 0 ]
      const svg = svgObject.contentDocument
      const result = $( svg )
      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Set animation enable.
    // Input:
    //   svg -- jqueyr instance of SVG.
    //   isEnabled - True to enable animation.
    //-------------------------------------------------------------------------
    static setAnimate( svg, isEnabled )
    {
      const enableFunction = function( index, element )
      {
        if ( isEnabled )
          element.beginElement()
        else
          element.endElement()
      }

      svg.find( "animate,animateTransform,animateColor,animateMotion" ).each( enableFunction )
    }

  } // class
})
