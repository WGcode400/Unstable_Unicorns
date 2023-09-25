using Newtonsoft.Json;


namespace Example3.MsgClasses
{
    public class WebIcon
    {
        [JsonProperty("id")]
        public string Guid { get; set; }

        [JsonProperty("description")]
        public string Name { get; set; }

        [JsonProperty("icon")]
        public string IconSVGId { get; set; }
    }
}
