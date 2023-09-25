//-----------------------------------------------------------------------------
// Uses: Fill in a template using a dictionary.
// Date: 2019-01-30
// Author: Andrew Que (http://www.DrQue.net/)
// Example:
//  template = new Template()
//  template.load( 'template.html' )
//
//  // Replace the `{foo}` with `bar`.
//  template.add( "foo", "bar" )
//
//  // Replace "id" with a unique and parameter.
//  template.add
//  (
//    "id",
//    function( parameter )
//    {
//      return uuid4() + "_" + parameter
//    }
//  )
//
//                         (C) 2019/2020 by Andrew Que
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
  return class Template
  {
    //---------------------------------------------------------------------------
    constructor()
    {
      this.template = null
      this.handlers = {}
      this.resultMap = {}
      this.contexts = {}
    }

    //---------------------------------------------------------------------------
    load( url, loadCallback=null )
    {
      let self = this
      this.templateLoader =
        $.get
        (
          url,
          function( templateData )
          {
            self.template = templateData
            if ( loadCallback )
              loadCallback( self )
          }
        )
    }

    //---------------------------------------------------------------------------
    getLoader()
    {
      return this.templateLoader
    }

    //---------------------------------------------------------------------------
    add( name, handler )
    {
      this.handlers[ name ] = handler
      return this
    }

    //---------------------------------------------------------------------------
    addMap( map )
    {
      this.handlers = $.extend( this.handlers, map )
      return this
    }

    //---------------------------------------------------------------------------
    handle( name, parameters, subset=this.handlers )
    {
      var result = ""

      const search = /(.+?)\.(.+)/g
      const searchResult = search.exec( name )

      if ( searchResult )
      {
        const [ fullSearch, field, subField ] = searchResult
        if ( ( subset )
          && ( field in subset ) )
        {
          result = this.handle( subField, parameters, subset[ field ] )
        }
      }
      else
      if ( ( subset )
        && ( name in subset ) )
      {
        const handler = subset[ name ]
        if ( typeof handler === "function" )
        {
          const bindFunction = handler.bind( subset )
          result = bindFunction( parameters, this )
        }
        else
          result = handler

        // Make reverse map.
        if ( name in this.resultMap )
          this.resultMap[ name ].push( result )
        else
          this.resultMap[ name ] = [ result ]
      }

      return result
    }

    //---------------------------------------------------------------------------
    process( inputString = null )
    {
      const self = this
      const search = /\{(.+?)(?::(.+?))?\}/g
      this.resultMap = {}

      if ( null === inputString )
        inputString = self.template

      let outputString = inputString

      var searchResult
      while ( ( searchResult = search.exec( inputString ) ) !== null )
      {
        const [ fullSearch, field, parameters ] = searchResult

        const replaceResult = self.handle( field, parameters )
        outputString = outputString.replace( fullSearch, replaceResult )
      }

      return outputString
    }

    //---------------------------------------------------------------------------
    getResultMap()
    {
      return this.resultMap
    }

    //---------------------------------------------------------------------------
    static processMap( string, map )
    {
      const template = new Template()
      template.addMap( map )
      return template.process( string )
    }

    //---------------------------------------------------------------------------
    static htmlMap( selector, map )
    {
      const string = $( selector ).html()
      return Template.processMap( string, map )
    }
  }


})