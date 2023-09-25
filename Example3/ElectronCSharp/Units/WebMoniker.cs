using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BRApplicationUI.App.WebUnits.MsgClasses
{
    public class WebMoniker
    {
        [JsonProperty("id")]
        public string Guid { get; set; }

        [JsonProperty("viewId")]
        public string ViewGuid { get; set; }

        [JsonProperty("angle")]
        public double Angle { get; set; }

        [JsonProperty("xCenter")]
        public double XCenter { get; set; }

        [JsonProperty("yCenter")]
        public double YCenter { get; set; }
       

    }
}
