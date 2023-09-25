using System;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;

namespace Units
{
   public class JsonParser : IDisposable
   {
      protected enum JsonContainerTypes
      {
         Object,
         Array,
      }

      public void Dispose()
      {
      }

      public virtual object Parse( string data )
      {
         object result = null;

         Stack<Tuple<string, IDictionary<string, object>>> objects = new Stack<Tuple<string, IDictionary<string, object>>>();
         Stack<IList<object>> arrays = new Stack<IList<object>>();
         Stack<JsonContainerTypes> containerTypes = new Stack<JsonContainerTypes>();

         using( TextReader textReader = new StringReader( data ) )
         using( JsonReader reader = new JsonTextReader( textReader ) )
         {
            string propertyName = null;
            object value = null;
            bool containerClosing = false;

            while( reader.Read() )
            {
               if( reader.TokenType == JsonToken.PropertyName )
               {
                  if( containerTypes.Count > 0 && containerTypes.Peek() == JsonContainerTypes.Object )
                     propertyName = reader.Value as string;
                  else
                     throw new InvalidDataException( "Invalid JSON string: invalid value token." );
               }
               else if( reader.TokenType == JsonToken.StartArray )
               {
                  arrays.Push( new List<object>() );
                  containerTypes.Push( JsonContainerTypes.Array );
               }
               else if( reader.TokenType == JsonToken.EndArray )
               {
                  if( containerTypes.Peek() == JsonContainerTypes.Array )
                     containerClosing = true;
                  else
                     throw new InvalidDataException( "Invalid JSON string: invalid array end token." );
               }
               else if( reader.TokenType == JsonToken.StartObject )
               {
                  objects.Push( new Tuple<string, IDictionary<string, object>>( propertyName, new Dictionary<string, object>() ) );
                  containerTypes.Push( JsonContainerTypes.Object );
               }
               else if( reader.TokenType == JsonToken.EndObject )
               {
                  if( containerTypes.Peek() == JsonContainerTypes.Object )
                     containerClosing = true;
                  else
                     throw new InvalidDataException( "Invalid JSON string: invalid object end token." );
               }
               else if( reader.TokenType == JsonToken.Boolean || reader.TokenType == JsonToken.Bytes || reader.TokenType == JsonToken.Date || reader.TokenType == JsonToken.Float || reader.TokenType == JsonToken.Integer || reader.TokenType == JsonToken.String || reader.TokenType == JsonToken.Null )
               {
                  value = reader.Value;

                  if( containerTypes.Count > 0 )
                  {
                     JsonContainerTypes containerType = containerTypes.Peek();

                     switch( containerType )
                     {
                        case JsonContainerTypes.Array:
                        {
                           arrays.Peek().Add( value );
                        }
                        break;
                        case JsonContainerTypes.Object:
                        {
                           objects.Peek().Item2.Add( propertyName, value );
                        }
                        break;
                     }
                  }
                  else // The value we received is just a value so we are done.
                     containerClosing = true;
               }

               if( containerClosing )
               {
                  if( containerTypes.Count > 0 )
                  {
                     JsonContainerTypes containerType = containerTypes.Pop();

                     switch( containerType )
                     {
                        case JsonContainerTypes.Array:
                        {
                           value = arrays.Pop();
                        }
                        break;
                        case JsonContainerTypes.Object:
                        {
                           Tuple<string, IDictionary<string, object>> container = objects.Pop();

                           propertyName = container.Item1;
                           value = container.Item2;
                        }
                        break;
                     }
                  }

                  if( containerTypes.Count == 0 )
                     result = value;
                  else
                  {
                     switch( containerTypes.Peek() )
                     {
                        case JsonContainerTypes.Array:
                        {
                           arrays.Peek().Add( value );
                        }
                        break;
                        case JsonContainerTypes.Object:
                        {
                           objects.Peek().Item2.Add( propertyName, value );
                           propertyName = null;
                        }
                        break;
                     }

                     value = null;
                  }

                  containerClosing = false;
               }
            }
         }

         return result;
      }
   }
}
