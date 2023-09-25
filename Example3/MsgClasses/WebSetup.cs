using Newtonsoft.Json;

namespace Example3.MsgClasses
{
    public class WebSetup
    {
        [JsonProperty("facilityName")]
        public string FacilityName { get; set; }

        [JsonProperty("defaultClient")]
        public string DefaultClient { get; set; }
    }
}