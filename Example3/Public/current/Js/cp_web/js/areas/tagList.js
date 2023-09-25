//-----------------------------------------------------------------------------
// Uses: Tag list on main screen.
// Date: 2020-02-05
// Author: Andrew Que (http://www.DrQue.net)
//-----------------------------------------------------------------------------

"use strict"

define(
[
  "units/patient",
  "units/tag",
  "screens/tagEdit",
  "library/uuid4",
  "library/template",
  "vendor/w2ui",
  "vendor/jquery"
],
function
(
  Patient,
  Tag,
  TagEdit,
  uuid4,
  Template,
  w2ui
)
{

  // Load templates.
  const templates = $.get
  (
    'templates/tagList.template.html',
    function( data )
    {
      $( "body" ).append( data )
    }
  )

  return class TagList
  {

    //-------------------------------------------------------------------------
    // Uses:
    //   Change a patient's record class.
    // Input:
    //   tagNumber - Tag number.
    //   className - Class to enable/disable.
    //   isSet - True if the class is to be used or not.
    //-------------------------------------------------------------------------
    setRecordClass( tagNumber, className, isSet )
    {
      const tagElement = $( this.babyListElements[ tagNumber ] )
      if ( isSet )
        tagElement.addClass( className )
      else
        tagElement.removeClass( className )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Add a patient record to list.
    // Input:
    //   record - Tag data.
    //-------------------------------------------------------------------------
    displayPatient( patient )
    {
      //---------------------------------------------------
      // $$$DEBUG - Make up things for state of patient.
      //

      // Make up a location for this baby.  ($$$DEBUG)
      const receiverIdList = Object.values( this.system.receivers )
      if ( 0 == receiverIdList.length )
        return

      const receiverId = receiverIdList[ Math.floor( Math.random() * receiverIdList.length ) ].id
      //---------------------------------------------------

      const templateData =
      {
        name: patient.formatDisplayName(),
        room: patient.room,
        display: "none",
      }

      const html = Template.htmlMap( "#patientTemplate", templateData )

      var element = this.babyListElements[ patient.id ]
      if ( ! element )
      {
        element = $( html ).appendTo( "#activePatients" )
        this.babyListElements[ patient.id ] = element
      }
      else
      {
        // Create a new element and replace existing.
        // NOTE: We cannot simply replace with `html` as then we loss the
        // reference to the element.
        const newElement = $( html )
        element.replaceWith( newElement )
        this.babyListElements[ patient.id ] = newElement
      }

      const self = this
      element
        .click
        (
          () => new TagEdit( self.system, patient.id )
        )
        .mouseover
        (
          function()
          {
            const element = self.map.getIcon( receiverId )
            if ( element )
              element.addClass( "svgIconHighlight" )
          }
        )
        .mouseout
        (
          function()
          {
            const element = self.map.getIcon( receiverId )
            if ( element )
              element.removeClass( "svgIconHighlight" )
          }
        )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Find a patient record for tag number.
    // Input:
    //   tag - Tag number.
    // Output:
    //   Patient record if a matching tag record was found.
    //-------------------------------------------------------------------------
    _findPatientForTag( tag )
    {
      var result
      for ( const patient of Object.values( this.system.patients ) )
        if ( patient.tag == tag )
          result = patient

      return result
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Make a tag active.
    // Input:
    //   tag - Instance of `Tag`.
    //-------------------------------------------------------------------------
    _activateTag( tag )
    {
      const patient = this._findPatientForTag( tag.tag )
      if ( patient )
      {
        const element = this.babyListElements[ patient.id ]

        // Change active status.
        element.addClass( "tagActive" )

        // Update low battery icon.
        var battery = "none"
        if ( tag.isLowBattery )
          battery = "block"

        element.find( "img" ).css( "display", battery )
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Make a tag inactive.
    // Input:
    //   tag - Instance of `Tag`.
    //-------------------------------------------------------------------------
    _deactivateTag( tag )
    {
      const patient = this._findPatientForTag( tag.tag )
      if ( patient )
        this.babyListElements[ patient.id ].removeClass( "tagActive" )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Callback when patient is add/changed.
    // Input:
    //   patient - Tag data.
    //-------------------------------------------------------------------------
    _onChange( patient )
    {
      this.displayPatient( patient )
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Callback when patient is removed.
    // Input:
    //   patient - Tag data.
    //-------------------------------------------------------------------------
    _onRemove( patient )
    {
      const element = this.babyListElements[ patient.id ]
      if ( element )
      {
        element.remove()
        delete this.babyListElements[ patient.id ]
      }
    }

    //-------------------------------------------------------------------------
    // Uses:
    //   Editor to assign patients.
    // Input:
    //   accutechAPI - Instance of `AccutachAPI`.
    //-------------------------------------------------------------------------
    constructor( system, map )
    {
      this.system = system
      this.map = map

      // Clear list.
      $( "#activePatients" ).text( "" )

      // Only configure after template are loaded.
      const self = this
      this.babyListElements = {}

      // Callbacks for patient changing state.
      // Add and change do the same thing.
      system.deltaSets.patients.onCreate( $.proxy( this._onChange, this ) )
      system.deltaSets.patients.onUpdate( $.proxy( this._onChange, this ) )
      system.deltaSets.patients.onDelete( $.proxy( this._onRemove, this ) )
      system.deltaSets.patients.onLoad
      (
        function( patients )
        {
          for ( const patient of Object.values( patients ) )
            self._onChange( patient )
        }
      )

      system.deltaSets.tags.onCreate( $.proxy( this._activateTag, this ) )
      system.deltaSets.tags.onUpdate( $.proxy( this._activateTag, this ) )
      system.deltaSets.tags.onDelete( $.proxy( this._deactivateTag, this ) )
      system.deltaSets.tags.onLoad
      (
        function( tags )
        {
          for ( const tag of Object.values( tags ) )
            self._activateTag( tag )
        }
      )

    } // constructor

  } // class

})
