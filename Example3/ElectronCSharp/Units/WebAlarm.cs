using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace BRApplicationUI.App.WebUnits.MsgClasses
{
    public class WebAlarm
    {
        public string id { get; set; }
        public int severity { get; set; }
        public int state { get; set; }
        public string type { get; set; }
        public string occurredAt { get; set; }
        public string stateText { get; set; }
        public string name { get; set; }
        public string location { get; set; }
        public string tag { get; set; }
        public string patient { get; set; }
        public string room { get; set; }
        public string notes { get; set; }
        public bool selected { get; set; }

        //    Id = alarm.ID;
        //    severity = alarm.severity (3 when state 2)
        //    state = 1 - high (active), 2 low (cleared)
        //    type = alarm.EventDescription;
        //    occuredat = alarm.OccuredAt;
        //    stateText = n/a
        //    name = alarm.AlarmText;
        //    location =  alarm.LocationName;
        //    tag = alarm.TagID;
        //    patient = alarm.PatientName;
        //    room = alarm.Room;
        //    notes = string.empty;

        //    uiAlarm.PatientName = alarm.PatientName;
        //    uiAlarm.Room = alarm.Room;
        //    uiAlarm.ActivationTime = (double) alarm.Created.Ticks;
        //uiAlarm.OccurredAt = alarm.OccuredAt;

        //    uiAlarm.Tag = alarm.TagID;
        //    uiAlarm.Name = alarm.AlarmText;
        //    uiAlarm.ReceiverId = alarm.ReceiverUIIDs.ToArray();
        //    uiAlarm.AreaId = alarm.UIAreaID;
        //    uiAlarm.Order = alarm.sortOrder;
        //    uiAlarm.Location = alarm.LocationName;
        //    uiAlarm.Type = alarm.EventDescription;
        //    response.Name = "events";
        //    noti.Type = alarm.Status;
        //    noti.Id = alarm.ID;
        //    noti.Data = uiAlarm;
        //    response.Data = noti;
    }
}
