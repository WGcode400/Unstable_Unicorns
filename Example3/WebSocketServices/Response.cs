using Newtonsoft.Json;

namespace Example3.WebSocketServices
{
    public class Response
    {
        [JsonProperty("data")]
        public object Data { get; set; }
        [JsonProperty("error")]
        public object Error { get; set; }
    }
}