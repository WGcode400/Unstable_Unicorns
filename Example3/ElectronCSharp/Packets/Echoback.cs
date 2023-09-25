using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ElectronDisplay.Units
{
    public partial class EchoBack
    {
        [JsonProperty("requestId")]
        public long RequestId { get; set; }
    }
}
