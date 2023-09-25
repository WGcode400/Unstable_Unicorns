using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BRApplicationUI.App.WebUnits.MsgClasses
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
        public double IconSize { get; set; }

        [JsonProperty("fontSize")]
        public double FontSize { get; set; }

        [JsonProperty("receivers")]
        public object Receivers { get; set; }
    }
}
