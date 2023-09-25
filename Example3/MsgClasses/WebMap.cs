using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Example3.MsgClasses
{
    public class WebMap
    {
        [JsonProperty("id")]
        public string Guid { get; set; }

        [JsonProperty("image")]
        public string ImageGuid { get; set; }

        [JsonProperty("name")]
        public string MapName { get; set; }

        [JsonProperty("iconSize")]
        public int IconSize { get; set; }

        [JsonProperty("fontSize")]
        public int FontSize { get; set; }

        [JsonProperty("receivers")]
        public object Receivers { get; set; }
    }
}
