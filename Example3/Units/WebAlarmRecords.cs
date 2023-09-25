using Newtonsoft.Json;

namespace Example3.Units
{
    public class WebAlarmRecords
    {
        [JsonProperty("event")]
        public string Event { get; set; }
        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("tag")]
        public string Tag { get; set; }
        [JsonProperty("action")]
        public string Action { get; set; }
        [JsonProperty("time")]
        public string EventTime { get; set; }
    }
}