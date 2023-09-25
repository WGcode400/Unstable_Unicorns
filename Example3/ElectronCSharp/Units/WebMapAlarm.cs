using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BRApplicationUI.App.WebUnits.MsgClasses
{
    public class WebMapAlarm
    {
        public int numActive { get; set; } //num active/inactive alarms associated with receiver
        public int numInactive { get; set; }
        public string receiverId { get; set; }      
        public int severity { get; set; } // 0 = red, 1 = yellow, 2 = blue 
        
        public int controlleraddress { get; set; }
        public int devicetype { get; set; }
        public int deviceaddress { get; set; }
    }
}
