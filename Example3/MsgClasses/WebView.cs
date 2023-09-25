using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Example3.MsgClasses
{
    public class WebView
    {
        [JsonProperty("id")]
        public string Guid { get; set; }

        [JsonProperty("mapId")]
        public string MapGuid { get; set; }

        [JsonProperty("label")]
        public string Label { get; set; }

        [JsonProperty("xOffset")]
        public double XOffset{ get; set; }

        [JsonProperty("yOffset")]
        public double YOffset { get; set; }

        [JsonProperty("scale")]
        public double Scale { get; set; }

        [JsonProperty("rotation")]
        public double Rotation { get; set; }

    }
}
