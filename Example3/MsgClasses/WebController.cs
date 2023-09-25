using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Example3.MsgClasses
{
    public class WebController
    {
        [JsonProperty("id")]
        public string Guid { get; set; }

        [JsonProperty("address")]
        public int Address { get; set; }

        [JsonProperty("areaId")]
        public string AssociatedAreaGuid { get; set; }

        [JsonProperty("isDoor")]
        public bool isDoor { get; set; }

        [JsonProperty("isTx")]
        public bool isTx { get; set; }

        [JsonProperty("description")]
        public string Name { get; set; }
        //[JsonProperty("isTX2")]
        //public bool HasTx2 { get; set; }

        [JsonProperty("receiverIds")]
        public object ReceiverIds { get; set; }
    }
}
