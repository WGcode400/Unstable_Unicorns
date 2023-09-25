using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Example3.MsgClasses
{
    class WebOverHead
    {
    }
    public partial class TopLevel
    {
        [JsonProperty("_accutechAPI")]
        public AccutechApi AccutechApi { get; set; }

        [JsonProperty("deltaSets")]
        public DeltaSets DeltaSets { get; set; }

        [JsonProperty("facility")]
        public TopLevelFacility Facility { get; set; }
    }

    public partial class AccutechApi
    {
        [JsonProperty("webSocketAPI")]
        public WebSocketApi WebSocketApi { get; set; }

        [JsonProperty("errorHandlers")]
        public object[] ErrorHandlers { get; set; }

        [JsonProperty("tags")]
        public Events Tags { get; set; }

        [JsonProperty("events")]
        public Events Events { get; set; }

        [JsonProperty("patients")]
        public Events Patients { get; set; }

        [JsonProperty("facility")]
        public Events Facility { get; set; }
    }

    public partial class Events
    {
        [JsonProperty("_webSocketAPI")]
        public WebSocketApi WebSocketApi { get; set; }

        [JsonProperty("_source")]
        public string Source { get; set; }
    }

    public partial class WebSocketApi
    {
        [JsonProperty("requestHandlers")]
        public RequestHandlersClass RequestHandlers { get; set; }

        [JsonProperty("responseHandlers")]
        public RequestHandlersClass ResponseHandlers { get; set; }

        [JsonProperty("responseTimeouts")]
        public RequestHandlersClass ResponseTimeouts { get; set; }

        [JsonProperty("requestId")]
        public long RequestId { get; set; }

        [JsonProperty("isFirstRequest")]
        public bool IsFirstRequest { get; set; }

        [JsonProperty("webSocket")]
        public RequestHandlersClass WebSocket { get; set; }
    }

    public partial class RequestHandlersClass
    {
    }

    public partial class DeltaSets
    {
        [JsonProperty("facility")]
        public RequestHandlersClass Facility { get; set; }
    }

    public partial class TopLevelFacility
    {
        [JsonProperty("0")]
        public The0 The0 { get; set; }
    }

    public partial class The0
    {
        [JsonProperty("topologyTimestamp")]
        public long TopologyTimestamp { get; set; }
    }
}
