using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BRApplicationUI.App.WebUnits.MsgClasses
{
    public class WebArea
    {
        [JsonProperty("id")]
        public string Guid { get; set; }

        [JsonProperty("description")]
        public string Name { get; set; }
    }
}
