using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace BRApplicationUI.App.WebUnits.MsgClasses
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

        // build the json receiver list - 
        public static object AddReceiverIds(Dictionary<string, string> dic)
        {
            object retVal = null;
            retVal = JsonConvert.DeserializeObject<JObject>(JsonConvert.SerializeObject(dic));
            return retVal;
        }

        public static Dictionary<string, string> GetReceiverIds(object rids)
        {
            Dictionary<string, string> retVal = new Dictionary<string, string>();

            retVal = JsonConvert.DeserializeObject <Dictionary<string, string>>(JsonConvert.SerializeObject(rids));

            return retVal;
        }
 
        // the object is what?
        // I think it is a JSON serialized dictionary - 
        [JsonProperty("receiverIds")]
        public object ReceiverIds { get; set; }
    }
}
