using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ElectronDisplay.Units
{
    public partial class Response
    {
        [JsonProperty("data")]
        public object Data { get; set; }

        [JsonProperty("error")]
        public object Error { get; set; }

    }
}
