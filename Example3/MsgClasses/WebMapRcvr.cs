using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Example3.MsgClasses
{
    public class WebMapRcvr
    {
        [JsonProperty("id")]
        public string Guid { get; set; }
        [JsonProperty("xCenter")]
        public double XCenter { get; set; }
        [JsonProperty("yCenter")]
        public double YCenter { get; set; }
        [JsonProperty("labelRadius")]
        public double LabelRadius { get; set; }
        [JsonProperty("labelAngle")]
        public double LabelAngle { get; set; }
    }
}
