using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BRApplicationUI.App.WebUnits.MsgClasses
{
    public class WebClientView
    {        
        [JsonProperty("id")]
        public string Guid { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        public static object addViews(List<Guid> views)
        {
            JArray retVal = new JArray();
            foreach (var item in views)
            {
                retVal.Add(item);
            }
            return retVal;
        }

        // views are just a Jarray of GUIDS - I think
        [JsonProperty("views")]
        public object Views { get; set; }
                
    }
}
