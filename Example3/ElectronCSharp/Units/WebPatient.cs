using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BRApplicationUI.App.WebUnits.MsgClasses
{
    public class WebPatient
    {
        public const int COLORSORTNUMBER_RED = 0;
        public const int COLORSORTNUMBER_YELLOW = 1;
        public const int COLORSORTNUMBER_NONE = 2;

        public const int ACTIVESORTNUMBER_NOTACTIVE = 0;
        public const int ACTIVESORTNUMBER_ACTIVE = 1;
        // last, first, middle
        public string name { get; set; }

        // int, so it is sortable 
        public string room { get; set; }

        // int, so it is sortable
        public int tag { get; set; }

        // bool is not sortable - we give it a number 
        public bool active { get; set; }
        public bool system { get; set; }
        public int activeSortNumber = 0;    // 0: not active, 1: active

        // color is not sortable, so we want to sort putting red on top, followed by yellow, then none
        public bool alarm { get; set; } = false;
        public bool transfer { get; set; } = false;
        public int colorSortNumber;         // 0 - red, 1, yellow, 2 transparent

    }
}
