using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BRApplicationUI.App.WebUnits.MsgClasses
{
    public class WebReceiver
    {
        [JsonProperty("id")]
        public string Guid { get; set; }

        [JsonProperty("number")]
        public string Number { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("type")]
        public string IconTypeGuid { get; set; }

        [JsonProperty("controllerId")]
        public string ControllerGuid { get; set; }

        [JsonProperty("channel")]
        public int Channel { get; set; }

    }
}
