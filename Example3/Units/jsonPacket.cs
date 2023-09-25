namespace QuickType
{
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;

    public partial class EchoBack
    {
        [JsonProperty("requestId")]
        public long RequestId { get; set; }
    }

    public partial class NotificationRequest
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("echoBack")]
        public EchoBack EchoBack { get; set; }
    }

    public partial class Request
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("parameters")]
        public object Parameters { get; set; }
    }

    public partial class ParaMaps
    {
        public string configuration { get; set; }
        public string view { get; set; }
    }

}
