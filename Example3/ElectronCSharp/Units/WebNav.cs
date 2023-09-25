using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BRApplicationUI.App.WebUnits.MsgClasses
{
    public class WebNav
    {
        public string name { get; set; }
        public bool alarm { get; set; } = false;
        public bool currentFloor { get; set; } = false;
        public string selector {get;set;}
        public string viewID { get; set; }
    }
}
