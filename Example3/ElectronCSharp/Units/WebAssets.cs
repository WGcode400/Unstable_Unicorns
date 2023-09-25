using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BRApplicationUI.App.WebUnits.MsgClasses
{
    public class WebAssets
    {
        [JsonProperty("id")]
        public string Id { get; set; }
        [JsonProperty("svg")]
        public string SVG { get; set; }
    }
}
