using Newtonsoft.Json;

namespace Example3.Units
{
    public class WebTagRecords
    {
        [JsonProperty("tag")]
        public string Tag { get; set; }
        [JsonProperty("alarming")]
        public bool Alarming { get; set; }
    }
}