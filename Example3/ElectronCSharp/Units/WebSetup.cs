using Newtonsoft.Json;

namespace BRApplicationUI.App.WebUnits.MsgClasses
{
    public class WebSetup
    {
        [JsonProperty("facilityName")]
        public string FacilityName { get; set; }

        [JsonProperty("defaultClient")]
        public string DefaultClient { get; set; }
    }
}