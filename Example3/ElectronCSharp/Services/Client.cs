using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using WebSocketSharp;
using WebSocketSharp.Server;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Dynamic;
using System.Windows.Input;
using System.Drawing;
using ElectronDisplay.Units;
using BRApplicationUI.App.GlobalDataLibrary;
using BRApplicationUI.App.WebServices;
using BRApplicationUI.App.WebUnits.MsgClasses;
using BRApplicationUI.App;
using SharedContracts;
using BRUtilityClasses;

namespace ElectronDisplay.Services
{
    public class Client : WebSocketBehavior
    {
        public const string SORTBY_TAG = "Tag";
        public const string SORTBY_PATIENT = "Patient";
        public const string SORTBY_ROOM = "Room";
        public const string SORTBY_ACTIVE = "Active";

        public string _currentSort = SORTBY_TAG;
        public int _sortDirection = 0;

        private bool _firstPatientDisplay = true;

         private Dictionary<string, int> _lastColor = new Dictionary<string, int>();

        //for ws behavior
        private string _name;
        private static int _number = 0;
        private string _prefix;
        private int count = 0;

        private MessageHandler _msgHandler = new MessageHandler();
        private bool _doWorkRunning = false;
        private AlarmUtility _alarmUtility = new AlarmUtility();
        //private PatientUtility _patientUtility = new PatientUtility();

        public static AutoResetEvent _doWorkEvent = new AutoResetEvent(false);

        // private AudioHandler _ah = AudioHandler.Instance;

        // // navigation box 
        private NavUtility _navUtil = new NavUtility();
        private List<WebNav> _currentNavBox = new List<WebNav>();

        // patient handling
        private DateTime _lastZonetagTable = DateTime.Now;
        private DateTime _currentAlarmTime = DateTime.Now;
        private DateTime _currentAlarmTime_P = DateTime.Now;

        private DateTime _currentTagTime = DateTime.Now;
        private DateTime _currentTagTime_P = DateTime.Now;

        private DateTime _lastAreaUpdate = DateTime.Now;
        private DateTime _lastAreaUpdate_P = DateTime.Now;

        private DateTime _lastActiveTagUpdate = DateTime.Now;
        private DateTime _lastActiveTagUpdate_P = DateTime.Now;

        private DateTime _lastSettingsUpdate = DateTime.Now;
        private DateTime _lastSettingsUpdate_P = DateTime.Now;

        private AlarmUtilityRecord _latestAlarm = null;
        private DateTime _lastAlarmUpdate = DateTime.Now;

        public List<WebPatient> _patientDisplayList = new List<WebPatient>();

        private GlobalDataLib _gdl = GlobalDataLib.Instance;
        //private EchoBack _echo = new EchoBack();
        private Thread _doWork;
        private string _currentView = string.Empty;
        // dictionary <mapid, alarmid>
        private Dictionary<string, string> _selectedAlarms = new Dictionary<string, string>();

        public Client()
            : this(null)
        {
        }
        public Client(string prefix)
        {
            _prefix = !prefix.IsNullOrEmpty() ? prefix : "client#";
            // RegisterClickHandlers();

        }
        private string getName()
        {
            var name = Context.QueryString["name"];
            return !name.IsNullOrEmpty() ? name : _prefix + getNumber();
        }
        private static int getNumber()
        {
            return Interlocked.Increment(ref _number);
        }
        protected override void OnClose(CloseEventArgs e)
        {
            //Sessions.Broadcast(String.Format("{0} got logged off...", _name));
            //_doWork.Abort();
        }
        protected override void OnMessage(MessageEventArgs e)
        {
            var packet = JsonConvert.DeserializeObject<JObject>(e.Data);

            //specific packets
            var ready = packet["ready"];
            var requests = packet["requests"];
            var request = packet["request"];
            var notification = packet["notification"];
            var echoBack = packet["echoBack"];

            if (ready != null)
                startSequence();
            if (requests != null)
                processRequests(requests, echoBack);
            if (request != null)
                processPacketRequest(request, echoBack);
            if (notification != null)
                processNotifications(notification);
        }
        protected override void OnOpen()
        {
            _name = getName();
        }
        /*
         * registers click event handlers
         */
        private void RegisterClickHandlers()
        {
            //register clicks
            //_msgHandler._provider.Register("sort", args => handleSort((JToken)args[0]));
            _msgHandler._provider.Register("navigation", args => handleNavigation((JToken)args[0]));
            //_msgHandler._provider.Register("patients", args => handlePatients((JToken)args[0]));
            //_msgHandler._provider.Register("alarms", args => handleAlarms((JToken)args[0]));
            //_msgHandler._provider.Register("selected", args => handleSelected((JToken)args[0]));
        }
        /*
        * AQue WS protocol
        */
        private void startSequence()
        {
            //screen is ready, load map and show view
            bool started = false;

            if (_doWork != null)
            {
                if (_doWork.IsAlive)
                {
                    started = true;
                }
            }
            if (!started)
            {
                _doWork = new Thread(DoWorkThread);
                _doWork.Start();
            }

        }
        private void processRequests(JToken requests, JToken echo)
        {
            List<dynamic> responseList = new List<dynamic>();
            Dictionary<string, object> responsePacket = new Dictionary<string, object>();
            foreach (JProperty request in requests)
            {
                var requestVal = request.Children();
                foreach (var val in requestVal)
                {
                    responseList.Add(processRequest(val));
                }
            }
            foreach (dynamic res in responseList)
                responsePacket.Add(res.name, res.obj);

            //MakePacket
            if (responsePacket.Count != 0)
            {
                responsePacket.Add("echoBack", echo);
                Send(JsonConvert.SerializeObject(responsePacket));
            }

        }
        private void processPacketRequest(JToken request, JToken echoBack)
        {
            dynamic response = processRequest(request);
            if (response != null)
            {
                Dictionary<string, object> responsePacket = new Dictionary<string, object>();
                responsePacket.Add("echoBack", echoBack);
                responsePacket.Add(response.name, response.obj);
                Send(JsonConvert.SerializeObject(responsePacket));
            }
        }
        private dynamic processRequest(JToken request)
        {
            string method = (string)request["name"];
            JToken paras = request["parameters"];
            dynamic response = _msgHandler._provider.Intercept<dynamic>(method, paras);
            //IF RETVAL IS NULL THEN IT IS A VOID FUNCTION
            return response;
        }
        /*
         * Enroll button clicks from UI screen to notify server when they have been clicked
         */
        private void RegisterSortClicks()
        {
            sortActiveNotificationEnrollment();
            sortTagNotificationEnrollment();
            sortRoomNotificationEnrollment();
            sortNameNotificationEnrollment();
        }
        private void sortActiveNotificationEnrollment()
        {
            var notificationId = Guid.NewGuid();
            dynamic query = new ExpandoObject();
            dynamic request = new ExpandoObject();
            dynamic parameters = new ExpandoObject();
            parameters.notification = "sort";
            request.name = "jqueryNotification";
            request.parameters = new ExpandoObject();
            request.parameters.function = "click";
            request.parameters.notificationId = "active";
            request.parameters.selector = "#grid_APGrid_column_3";
            request.parameters.parameters = parameters;
            //request.parameters.parameters = null; //should be uuid of button //comesfrom client id
            query.request = request;
            string json = JsonConvert.SerializeObject(query);
            Send(json);
        }
        private void sortTagNotificationEnrollment()
        {
            var notificationId = Guid.NewGuid();
            dynamic query = new ExpandoObject();
            dynamic request = new ExpandoObject();
            dynamic parameters = new ExpandoObject();
            parameters.notification = "sort";
            request.name = "jqueryNotification";
            request.parameters = new ExpandoObject();
            request.parameters.function = "click";
            request.parameters.notificationId = "tags";
            request.parameters.selector = "#grid_APGrid_column_0";
            request.parameters.parameters = parameters;
            //request.parameters.parameters = null; //should be uuid of button //comesfrom client id
            query.request = request;
            string json = JsonConvert.SerializeObject(query);
            Send(json);
        }
        private void sortNameNotificationEnrollment()
        {
            var notificationId = Guid.NewGuid();
            dynamic query = new ExpandoObject();
            dynamic request = new ExpandoObject();
            dynamic parameters = new ExpandoObject();
            parameters.notification = "sort";
            request.name = "jqueryNotification";
            request.parameters = new ExpandoObject();
            request.parameters.function = "click";
            request.parameters.notificationId = "names";
            request.parameters.selector = "#grid_APGrid_column_1";
            request.parameters.parameters = parameters;
            //request.parameters.parameters = null; //should be uuid of button //comesfrom client id
            query.request = request;
            string json = JsonConvert.SerializeObject(query);
            Send(json);
        }
        private void sortRoomNotificationEnrollment()
        {
            var notificationId = Guid.NewGuid();
            dynamic query = new ExpandoObject();
            dynamic request = new ExpandoObject();
            dynamic parameters = new ExpandoObject();
            parameters.notification = "sort";
            request.name = "jqueryNotification";
            request.parameters = new ExpandoObject();
            request.parameters.function = "click";
            request.parameters.notificationId = "rooms";
            request.parameters.selector = "#grid_APGrid_column_2";
            request.parameters.parameters = parameters;
            //request.parameters.parameters = null; //should be uuid of button //comesfrom client id
            query.request = request;
            string json = JsonConvert.SerializeObject(query);
            Send(json);
        }
        private void floorNotificationEnrollment(List<WebNav> floors)
        {

            // if no data, hopefully it shows nothing
            if (floors.Count == 0)
            {
                var notificationId = Guid.NewGuid();
                dynamic query = new ExpandoObject();
                dynamic request = new ExpandoObject();
                //request.parameters.parameters = null; //should be uuid of button //comesfrom client id
                query.request = request;
                string json = JsonConvert.SerializeObject(query);
                Send(json);
            }
            else
            {

                foreach (var floor in floors)
                {
                    var notificationId = Guid.NewGuid();
                    dynamic query = new ExpandoObject();
                    dynamic request = new ExpandoObject();
                    dynamic parameters = new ExpandoObject();
                    parameters.notification = "navigation";
                    request.name = "jqueryNotification";
                    request.parameters = new ExpandoObject();
                    request.parameters.function = "click";
                    request.parameters.notificationId = floor.name;
                    request.parameters.parameters = parameters;
                    request.parameters.selector = "#" + floor.selector;
                    //request.parameters.parameters = null; //should be uuid of button //comesfrom client id
                    query.request = request;
                    string json = JsonConvert.SerializeObject(query);
                    Send(json);
                }
            }
        }
        private void alarmNotificationEnrollment(List<WebAlarm> alarms)
        {
            foreach (var alarm in alarms)
            {
                var notificationId = Guid.NewGuid();
                dynamic query = new ExpandoObject();
                dynamic request = new ExpandoObject();
                dynamic parameters = new ExpandoObject();
                parameters.notification = "alarms";
                request.name = "jqueryNotification";
                request.parameters = new ExpandoObject();
                request.parameters.function = "dblclick";
                request.parameters.notificationId = alarm.id;
                request.parameters.parameters = parameters;
                request.parameters.selector = "#" + alarm.id;
                //request.parameters.parameters = null; //should be uuid of button //comesfrom client id
                query.request = request;
                string json = JsonConvert.SerializeObject(query);
                Send(json);
            }
        }
        private void alarmSelectedNotificationEnrollment(List<WebAlarm> alarms)
        {
            foreach (var alarm in alarms)
            {
                var notificationId = Guid.NewGuid();
                dynamic query = new ExpandoObject();
                dynamic request = new ExpandoObject();
                dynamic parameters = new ExpandoObject();
                parameters.notification = "selected";
                request.name = "jqueryNotification";
                request.parameters = new ExpandoObject();
                request.parameters.function = "click";
                request.parameters.notificationId = alarm.id;
                request.parameters.parameters = parameters;
                request.parameters.selector = "#" + alarm.id;
                //request.parameters.parameters = null; //should be uuid of button //comesfrom client id
                query.request = request;
                string json = JsonConvert.SerializeObject(query);
                Send(json);
            }
        }
        /*
         * Enroll button clicks from UI Map screen to notify when objects on map have been clicked
         */
        private void mapIconNotification()
        {
            dynamic query = new ExpandoObject();
            dynamic request = new ExpandoObject();
            dynamic parameters = new ExpandoObject();
            parameters.notification = "maps";
            request.name = "mapIconNotification";
            request.parameters = new ExpandoObject();
            request.parameters.function = "contextmenu"; //rightclick in js
            request.parameters.notificationId = "notification";
            request.parameters.parameters = parameters;
            query.request = request;
            string json = JsonConvert.SerializeObject(query);
            Send(json);
        }
        /*
         * gathers all data and sends a map config to the screen to be displayed
         */
        private void getConfiguration()
        {
            Dictionary<string, object> msg = new Dictionary<string, object>();

            Dictionary<string, object> areas = new Dictionary<string, object>();
            Dictionary<string, object> controllers = new Dictionary<string, object>();
            Dictionary<string, object> receivers = new Dictionary<string, object>();
            Dictionary<string, object> maps = new Dictionary<string, object>();
            Dictionary<string, object> iconTypes = new Dictionary<string, object>();
            Dictionary<string, object> views = new Dictionary<string, object>();
            Dictionary<string, object> clientViews = new Dictionary<string, object>();

            //get view to show
            string defaultView = (string)_msgHandler._provider.Intercept<string>("get_defaultView");

            //get topologyTimestamp
            var topologyTimestamp = _msgHandler._provider.Intercept<double>("get_topologyTimestamp");

            //get setup
            var setup = _msgHandler._provider.Intercept<WebSetup>("get_setup");

            //get svgs
            var svgList = (List<WebAssets>)_msgHandler._provider.Intercept<List<WebAssets>>("get_assets");
            foreach (var svg in svgList)
            {
                msg.Add(svg.Id, svg.SVG);
                //          _configurations.Add(svg.Id, svg.SVG);
            }

            //get areas
            var areaList = (List<WebArea>)_msgHandler._provider.Intercept<List<WebArea>>("get_areas");
            foreach (var area in areaList)
            {
                areas.Add(area.Guid, area);

            }

            //get iconTypes
            var iconList = (List<WebIcon>)_msgHandler._provider.Intercept<List<WebIcon>>("get_iconTypes");
            foreach (var icon in iconList)
            {
                iconTypes.Add(icon.Guid, icon);
            }

            //get controllers
            var controllerList = (List<WebController>)_msgHandler._provider.Intercept<List<WebController>>("get_controllers");
            foreach (var controller in controllerList)
            {
                controllers.Add(controller.Guid, controller);
            }

            //get receivers
            var receiverList = (List<WebReceiver>)_msgHandler._provider.Intercept<List<WebReceiver>>("get_receivers");
            foreach (var receiver in receiverList)
            {
                receivers.Add(receiver.Guid, receiver);
            }
            //get rcvr in controllers or map


            //get maps
            var mapList = (List<WebMap>)_msgHandler._provider.Intercept<List<WebMap>>("get_maps");
            foreach (var map in mapList)
            {
                maps.Add(map.Guid, map);
            }

            //get views
            var viewList = (List<WebView>)_msgHandler._provider.Intercept<List<WebView>>("get_views");
            foreach (var view in viewList)
            {
                views.Add(view.Guid, view);
            }

            //get client views
            var clientList = (List<WebClientView>)_msgHandler._provider.Intercept<List<WebClientView>>("get_clientViews");
            foreach (var client in clientList)
            {
                clientViews.Add(client.Guid, client);
            }

            //Add to packet
            msg.Add("areas", areas);
            msg.Add("controllers", controllers);
            msg.Add("receivers", receivers);
            msg.Add("maps", maps);
            msg.Add("views", views);
            msg.Add("clientViews", clientViews);
            msg.Add("iconTypes", iconTypes);
            msg.Add("setup", setup);
            msg.Add("topologyTimestamp", topologyTimestamp);

            JsShowMap(msg, _currentView);
            mapIconNotification();

        }
        /*
         * Tells the UI screen to display ...
         */
        private void JsShowMap(dynamic configuration, string defaultView)
        {
            dynamic query = new ExpandoObject();
            Request request = new Request();
            dynamic parameters = new ExpandoObject();

            parameters.view = defaultView;
            parameters.configuration = configuration;

            request.Name = "map.show";
            request.Parameters = parameters;

            query.request = request;
            string json = JsonConvert.SerializeObject(query);
            Send(json);
        }
        //private void JsUpdatePatients(List<WebPatient> patients, bool singleFacility)
        //{
        //    dynamic query = new ExpandoObject();
        //    Request request = new Request();
        //    dynamic parameters = new ExpandoObject();

        //    parameters.patients = patients;
        //    parameters.singleFacility = singleFacility;

        //    request.Name = "patients.update";
        //    request.Parameters = parameters;

        //    query.request = request;
        //    string json = JsonConvert.SerializeObject(query);
        //    Send(json);
        //    RegisterSortClicks();

        //}
        private void JsUpdateNavigation(List<WebNav> floors)
        {
            dynamic query = new ExpandoObject();
            Request request = new Request();
            dynamic parameters = new ExpandoObject();

            parameters.floors = floors;

            request.Name = "navigation.update";
            request.Parameters = parameters;

            query.request = request;
            string json = JsonConvert.SerializeObject(query);
            Send(json);

            floorNotificationEnrollment(floors);
        }
        private void JsUpdateMapAlarms(List<WebMapAlarm> receiverIds)
        {
            dynamic query = new ExpandoObject();
            Request request = new Request();
            dynamic parameters = new ExpandoObject();

            parameters.data = receiverIds;

            request.Name = "mapAlarms.update";
            request.Parameters = parameters;

            query.request = request;
            string json = JsonConvert.SerializeObject(query);
            Send(json);

        }
        private void JsUpdateAlarmImg()
        {
            dynamic query = new ExpandoObject();
            Request request = new Request();
            dynamic parameters = new ExpandoObject();
            var dir = Environment.CurrentDirectory;
            var path = Path.Combine(dir, @"new_op_web\images\", "AlarmBell.svg");
            string file = "data:image/jpeg;base64,";
            using (Image image = Image.FromFile(path))
            {
                using (MemoryStream m = new MemoryStream())
                {
                    image.Save(m, image.RawFormat);
                    byte[] imageBytes = m.ToArray();

                    // Convert byte[] to Base64 String
                    string base64String = Convert.ToBase64String(imageBytes);
                    file += base64String;
                }
            }

            //var exists = File.Exists(path);
            //string imgage = File.ReadAllText(path);
            parameters.path = file;

            request.Name = "alarmImage.update";
            request.Parameters = parameters;

            query.request = request;
            string json = JsonConvert.SerializeObject(query);
            Send(json);
        }
        private void JsTemplate(object data)
        {
            dynamic msg = new ExpandoObject();
            Request request = new Request();
            dynamic parameters = new ExpandoObject();
            //data needed for alarms
            parameters.data = data;
            //template id
            parameters.id = "#alarmTemplate";
            // main,nav, etc left panel?
            parameters.insertSelector = "#alarmSubDiv";
            //replace, append, etc
            parameters.method = "";//"append";
            //template file name
            parameters.template = "templates/alarms.template.html";

            request.Name = "template";
            request.Parameters = parameters;

            msg.request = request;
            string json = JsonConvert.SerializeObject(msg);
            Send(json);
        }
        private void JsAlarmTemplateArray(List<WebAlarm> alarms)
        {
            dynamic msg = new ExpandoObject();
            Request request = new Request();
            dynamic parameters = new ExpandoObject();
            //WebAlarm alarm = getStubAlarm();
            //data needed for alarms
            parameters.data = alarms;
            //template id
            parameters.elementId = "#alarmTemplate";
            //main,nav, etc left panel?
            parameters.insertSelector = "#alarmSubDiv";
            //replace, append, etc
            parameters.wrapperMethod = "replace";//"append";
            //template file name
            parameters.template = "templates/alarms.template.html";

            parameters.wrapperId = "#alarmWrapperTemplate";
            parameters.wrapperInsert = "#leftSubPanel";


            request.Name = "templateArray";
            request.Parameters = parameters;

            msg.request = request;
            string json = JsonConvert.SerializeObject(msg);
            Send(json);
            Thread.Sleep(1000);
            alarmNotificationEnrollment(alarms);
            alarmSelectedNotificationEnrollment(alarms);
        }
        /*
         * system
        */
        private void manageView()
        {
            try
            {
                if ((_gdl.CurrentView != _currentView) && (_gdl.CurrentView != string.Empty))
                {
                     //verify this is a valid view given (should be)
                    var item = _gdl.UIViewTable.get(_gdl.CurrentView);
                    if (item != null)
                    {

                        _currentView = _gdl.CurrentView;
                        var map = _gdl.UIMapTable.get(item.MapID);
                        if (map != null)
                        {
                            // will only have single IDs from now on...
                            _gdl.setCurrentAreaID(map.AreaId);
                        }

                         //get configuration also updates the config - 
                        // example is if we add a new view or something, we need to update the config struct
                        getConfiguration();

                         //when returning to a map, we don't want to maintain the last pointer but possibly go to the first cleared alarm
                        if (_selectedAlarms.ContainsKey(item.MapID))
                        {
                            _selectedAlarms[item.MapID] = string.Empty; ;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                BRUtilityClasses.Logger.Error(ex);
            }

        }
        private void displayNavigationBox()
        {
            List<WebNav> navlist = new List<WebNav>();
            bool changed = false;

            try
            {

                // get views associated with the operator... note the 'client' will do the same but has the ability
                var myviews = _navUtil.getViews();

                if (myviews.Count > 0)
                {

                    foreach (var item in myviews)
                    {
                        // the first view is going to be the default (only needed on startup)
                        if (_gdl.CurrentView == string.Empty)
                        {
                            _gdl.CurrentView = item.ClientID;
                        }

                        // if (_gdl.CurrentView != item.ClientID)
                        {
                            // get info to display



                            // get view/map info
                            var view = _gdl.UIViewTable.get(item.ClientID);
                            var map = _gdl.UIMapTable.get(item.MapID);
                            if (map != null)
                            {
                                bool areaInAlarm = _alarmUtility.isAreaInAlarm(map.AreaId);
                                string name = "" + map.Name;
                                // default current view to green?

                                bool currentfloor = false;

                                // want 3 colors, current view - border?, any alarm red, non alarm bisque 
                                if (_gdl.CurrentView == item.ClientID)
                                {
                                    name = "* " + map.Name;
                                    currentfloor = true;
                                }
                                // else
                                {
                                    var celector = name.Replace(" ", "").Replace("*", "");
                                    if (view != null)
                                    {

                                        if (areaInAlarm)
                                        {
                                            navlist.Add(new WebNav() { name = name, alarm = true, selector = celector, viewID = view.Id, currentFloor = currentfloor });
                                        }
                                        else
                                        {
                                            // set the colors to something milder
                                            navlist.Add(new WebNav() { name = name, alarm = false, selector = celector, viewID = view.Id, currentFloor = currentfloor });
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // now check for changes 
                    if (navlist.Count != _currentNavBox.Count)
                    {
                        changed = true;
                    }
                    else
                    {
                        for (int i = 0; i < navlist.Count; i++)
                        {
                            if ((navlist[i].alarm != _currentNavBox[i].alarm) ||
                                (navlist[i].name != _currentNavBox[i].name) ||
                                (navlist[i].currentFloor != _currentNavBox[i].currentFloor))
                            {
                                changed = true;
                                break;
                            }
                        }
                    }

                    if (changed)
                    {
                        _currentNavBox.Clear();
                        foreach (var item in navlist)
                        {
                            _currentNavBox.Add(new WebNav() { name = item.name, alarm = item.alarm, selector = item.selector, viewID = item.viewID, currentFloor = item.currentFloor });
                        }

                        JsUpdateNavigation(_currentNavBox);
                    }
                }
            }
            catch (Exception ex)
            {
                BRUtilityClasses.Logger.Error(ex);
            }
        }
        //private void displayPatients(string sortBy)
        //{
        //    int sortroom = 0;
        //    bool dataChanged = false;
        //    List<WebPatient> tempList = new List<WebPatient>();
        //    try
        //    {


        //        // before checking, if not logged in, we don't display anything
        //        if (((_gdl.getCurrentLogin() == null) && (!CommonRoutines.ToBool(_gdl.SettingsTable.getSetting(BRSystemSettings.NOTLOGGEDINTAGS)))) ||
        //            (!WorkStationSettings.GetBool(BRWorkStationSettings.ShowTagList)))
        //        {
        //            if (_patientDisplayList.Count > 0)
        //            {
        //                _patientDisplayList.Clear();
        //                JsUpdatePatients(_patientDisplayList, false);

        //                // so when we log back in, the refresh action will happen
        //                _currentTagTime_P = DateTime.Now;
        //            }
        //        }
        //        else
        //        {


        //            if ((_gdl.TagTable.LastRefreshed != _currentTagTime_P) ||
        //                (_gdl.AreaChangedAt != _lastAreaUpdate_P) ||
        //                (_gdl.UIZoneTagTable.LastRefreshed != _lastZonetagTable) ||
        //                (_gdl.ActiveAlarmsViewTable.LastRefreshed != _currentAlarmTime_P) ||
        //                (_lastSettingsUpdate_P != _gdl.SettingsTable.LastRefreshed))

        //            {
        //                //_patientDisplayList.Clear();

        //                _currentAlarmTime_P = _gdl.ActiveAlarmsViewTable.LastRefreshed;
        //                _lastSettingsUpdate_P = _gdl.SettingsTable.LastRefreshed;

        //                _currentTagTime_P = _gdl.TagTable.LastRefreshed;
        //                _lastAreaUpdate_P = _gdl.AreaChangedAt;

        //                _lastZonetagTable = _gdl.UIZoneTagTable.LastRefreshed;

        //                var patientList = _patientUtility.getPatientData(_gdl.getCurrentAreaid());

        //                var xxx = patientList.FirstOrDefault(e => e.Tag == 112);
        //                if (xxx != null)
        //                {

        //                }

        //                if (patientList.Count > 0)
        //                {
        //                    // build the patient display list
        //                    foreach (var item in patientList)
        //                    {
        //                        WebPatient x = new WebPatient();
        //                        x.name = item.LastName + "," + item.FirstName + "," + item.MiddleName;

        //                        // tag display and sort
        //                        x.tag = item.Tag;

        //                        if (!Int32.TryParse(item.Room, out sortroom))
        //                        {
        //                            sortroom = 0;
        //                        }
        //                        x.room = item.Room; // sortroom;

        //                        // get active tag
        //                        var sysactive = _gdl.UIZoneTagTable.getTag(item.Tag);
        //                        var flooractive = _gdl.UIZoneTagTable.getTagArea(item.Tag, item.AreaGUID);

        //                        // - adding a floor and system active... for now we will use the floor
        //                        //x.active = false;
        //                        //x.activeSortNumber = WebPatient.ACTIVESORTNUMBER_NOTACTIVE;
        //                        //if (y != null)
        //                        //{
        //                        //    x.active = true;
        //                        //    x.activeSortNumber = WebPatient.ACTIVESORTNUMBER_ACTIVE;
        //                        //}

        //                        x.active = false;
        //                        x.activeSortNumber = WebPatient.ACTIVESORTNUMBER_NOTACTIVE;
        //                        if (flooractive != null)
        //                        {
        //                            x.active = true;
        //                            x.activeSortNumber = WebPatient.ACTIVESORTNUMBER_ACTIVE;
        //                        }

        //                        if (sysactive != null)
        //                        {
        //                            x.system = true;
        //                            // x.activeSortNumber = WebPatient.ACTIVESORTNUMBER_ACTIVE;
        //                        }

        //                        // now determine if there is an alarm for this 'tag' or patient
        //                        if (_gdl.ActiveAlarmsViewTable.isTagInAlarm(item.Tag))
        //                        {
        //                            x.alarm = true;
        //                            //x.color = Brushes.Red.Color.ToString();
        //                            x.colorSortNumber = WebPatient.COLORSORTNUMBER_RED;
        //                        }
        //                        else
        //                        {
        //                            x.alarm = false;
        //                            //x.color = Brushes.Transparent.Color.ToString();
        //                            x.colorSortNumber = WebPatient.COLORSORTNUMBER_NONE;
        //                        }

        //                        //x.color = x.color.Substring(0, x.color.Length - 2);

        //                        tempList.Add(x);
        //                    }


        //                    // we now have a complete list of patients, now sort
        //                    if (sortBy == SORTBY_TAG)
        //                    {
        //                        if (_sortDirection > 0)
        //                        {
        //                            tempList = tempList.OrderBy(e => e.tag).ToList();
        //                        }
        //                        else
        //                        {
        //                            tempList = tempList.OrderByDescending(e => e.tag).ToList();
        //                        }
        //                    }
        //                    else if (sortBy == SORTBY_PATIENT)
        //                    {
        //                        if (_sortDirection > 0)
        //                        {
        //                            tempList = tempList.OrderBy(e => e.name).ToList();
        //                        }
        //                        else
        //                        {
        //                            tempList = tempList.OrderByDescending(e => e.name).ToList();
        //                        }
        //                    }
        //                    else if (sortBy == SORTBY_ROOM)
        //                    {
        //                        if (_sortDirection > 0)
        //                        {
        //                            tempList = tempList.OrderBy(e => e.room).ToList();
        //                        }
        //                        else
        //                        {
        //                            tempList = tempList.OrderByDescending(e => e.room).ToList();
        //                        }

        //                    }

        //                    else if (sortBy == SORTBY_ACTIVE)
        //                    {
        //                        if (_sortDirection > 0)
        //                        {
        //                            tempList = tempList.OrderBy(e => e.activeSortNumber).ToList();
        //                        }
        //                        else
        //                        {
        //                            tempList = tempList.OrderByDescending(e => e.activeSortNumber).ToList();
        //                        }
        //                    }
        //                }

        //                // now put alarms on top
        //                tempList = tempList.OrderBy(e => e.colorSortNumber).ToList();

        //                // if data changed update
        //                if (tempList.Count != _patientDisplayList.Count)
        //                {
        //                    dataChanged = true;
        //                }
        //                else
        //                {
        //                    for (int i = 0; i < tempList.Count; i++)
        //                    {
        //                        if ((tempList[i].active != _patientDisplayList[i].active) ||
        //                            (tempList[i].alarm != _patientDisplayList[i].alarm) ||
        //                            (tempList[i].name != _patientDisplayList[i].name) ||
        //                            (tempList[i].room != _patientDisplayList[i].room) ||
        //                            (tempList[i].tag != _patientDisplayList[i].tag) ||
        //                            (tempList[i].transfer != _patientDisplayList[i].transfer))
        //                        {
        //                            dataChanged = true;
        //                        }
        //                    }
        //                }


        //                if ((dataChanged) || (_firstPatientDisplay))
        //                {
        //                    _patientDisplayList.Clear();
        //                    foreach (var item in tempList)
        //                    {
        //                        _patientDisplayList.Add(new WebPatient()
        //                        {
        //                            active = item.active,

        //                            activeSortNumber = item.activeSortNumber,
        //                            alarm = item.alarm,
        //                            transfer = item.transfer,
        //                            colorSortNumber = item.colorSortNumber,
        //                            name = item.name,
        //                            room = item.room,
        //                            tag = item.tag,
        //                            system = item.system
        //                        });
        //                    }


        //                    JsUpdatePatients(_patientDisplayList, _gdl.UIMapTable.isSingleMap());

        //                    _firstPatientDisplay = false;
        //                }
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        BRUtilityClasses.Logger.Error(ex);
        //    }

        //}
        private void displayAlarms()
        {
            // alarm list is the displayed alarms - this is different than the ICONs 
            List<WebAlarm> alarmList = new List<WebAlarm>();

            // this is the ICON list - including counts
            List<WebMapAlarm> webMapList = new List<WebMapAlarm>();
            WebMapAlarm wma = new WebMapAlarm();

            string selectedAlarm = string.Empty;
            try
            {
                if ((_gdl.ActiveAlarmsViewTable.LastRefreshed != _currentAlarmTime) ||
                    (_gdl.AreaChangedAt != _lastAreaUpdate) ||
                    (_lastSettingsUpdate != _gdl.SettingsTable.LastRefreshed))

                {
                    _currentAlarmTime = _gdl.ActiveAlarmsViewTable.LastRefreshed;
                    _lastAreaUpdate = _gdl.AreaChangedAt;
                    _lastSettingsUpdate = _gdl.SettingsTable.LastRefreshed;

                    // get the selected item
                    // here is what I am trying to do,
                    //      if there is no selected item yet, then I will select the first cleared one
                    //      otherwise no need to select

                    var viewrecord = _gdl.UIViewTable.get(_gdl.CurrentView);
                    if (viewrecord != null)
                    {
                        if (_selectedAlarms.ContainsKey(viewrecord.MapID))
                        {
                            selectedAlarm = _selectedAlarms[viewrecord.MapID];
                        }
                    }

                    alarmList.Clear();
                    // var dbAlarmList = _alarmUtility.getAlarms(false);
                    if (viewrecord != null)
                    {
                        var dbAlarmList = _alarmUtility.getAlarms(viewrecord.MapID);

                        if (dbAlarmList.Count > 0)
                        {
                            bool alarmselected = false;

                            foreach (var alarm in dbAlarmList)
                            {
                                var x = new WebAlarm();

                                x.id = alarm.ID;
                                x.type = alarm.EventDescription;
                                x.occurredAt = alarm.OccuredAt;
                                x.stateText = "shit";
                                x.name = alarm.AlarmText;
                                x.location = alarm.LocationName;
                                x.tag = alarm.TagID;
                                x.patient = alarm.PatientName;
                                x.room = alarm.Room;
                                x.notes = string.Empty;
                                x.id = alarm.ID;
                                x.location = alarm.LocationName;
                                // state is the color, severity is the ordering (we don't want JS to order) so leave severity at 0
                                x.severity = 0;

                                // for now our selection 

                                // if we haven't selected one
                                if ((!alarmselected) &&
                                    ((x.id == selectedAlarm) ||             // if the alarm IDs match the selected one, select it
                                    ((selectedAlarm == string.Empty) && (alarm.HWStatus == AlarmStatuses.toString(AlarmStatuses.CLEARED)))))   // if alarm is clear and none selected
                                {
                                    x.selected = true;
                                    selectedAlarm = x.id;
                                    alarmselected = true;
                                }

                                // BUT - if the hardware status is clear, then we want the color to be white (transparent)
                                if (alarm.HWStatus == AlarmStatuses.toString(AlarmStatuses.CLEARED))
                                {
                                    x.state = 3;
                                }
                                // otherwise we use the severity color (when alarm is active/inactive
                                else
                                {
                                    x.state = BREventGroupParms.getUISeverity(alarm.Severity); // (3 when state 2)
                                }
                                alarmList.Add(x);


                                //sendAlarm(alarm);
                            }

                            // 
                            //if (!alarmselected)
                            //{
                            //    if (alarmList.Count > 0)
                            //    {
                            //        alarmList[0].selected = true;
                            //        selectedAlarm = alarmList[0].id;
                            //    }
                            //}

                            if ((selectedAlarm != string.Empty) && (viewrecord != null))
                            {
                                if (_selectedAlarms.ContainsKey(viewrecord.MapID))
                                {
                                    _selectedAlarms[viewrecord.MapID] = selectedAlarm;
                                }
                                else
                                {
                                    _selectedAlarms.Add(viewrecord.MapID, selectedAlarm);
                                }
                            }
                        }


                        // build alarm sounds
                        var soundlist = dbAlarmList.Select(e => e.SoundName).Distinct().ToList();
                        //if (dbAlarmList.Count > 0)
                        {
                            //_ah.UpdateList(_alarmUtility.getAlarmSounds(_gdl.getCurrentAreaid()));
                        }


                        JsAlarmTemplateArray(alarmList);

                        //receiverIdList.Clear();

                        // now build the list of receivers
                        foreach (var item in dbAlarmList)
                        {
                            if (item.GroupedAlarms.Count == 0)
                            {
                                // for testing, should never have a count of 0

                            }



                            foreach (var item1 in item.GroupedAlarms)
                            {
                                // find existing web alarm so we can add to the active/inactive count, or add a new one

                                var x = webMapList.FirstOrDefault(e => e.receiverId == item1.ReceiverID);
                                if (x == null)
                                {
                                    wma = new WebMapAlarm();
                                    wma.receiverId = string.Empty;

                                    // 0 is red blinking
                                    // 1 is yellow
                                    // 2 is blue  - this is the red list
                                    wma.severity = 0;


                                    // for band alarms we only add it if active
                                    if ((item.EventType == SharedEventTypes.BANDCOMPROMISE) ||
                                        (item.EventType == SharedEventTypes.BANDREMOVAL))
                                    {
                                        if (item1.HWStatus != AlarmStatuses.CLEARED)
                                        {
                                            wma.receiverId = item1.ReceiverID;
                                            wma.deviceaddress = item1.DeviceAddress;
                                            wma.devicetype = item1.DeviceType;
                                            wma.controlleraddress = item1.ControllerAddress;
                                        }
                                    }
                                    else
                                    {
                                        wma.receiverId = item1.ReceiverID;
                                        wma.deviceaddress = item1.DeviceAddress;
                                        wma.devicetype = item1.DeviceType;
                                        wma.controlleraddress = item1.ControllerAddress;
                                    }


                                    if (wma.receiverId != string.Empty)
                                    {
                                        webMapList.Add(wma);
                                    }
                                }
                            }



                            // we now want to add status alarms in yellow

                            // then add offline in blue

                            // so we need to keep the webmaplist global and have the other functions update/modify

                            // need to keep separate lists and merge them... future


                        }
                    }

                    // the web map contains all receivers, now we need to get active/cleared counts for each
                    if (viewrecord != null)
                    {
                        // we want to add the offline and log and status messages here 
                        var xx = _gdl.ReceiverMapTable.getByMapID(viewrecord.MapID);

                        Dictionary<string, WebMapAlarm> sev = new Dictionary<string, WebMapAlarm>();

                        foreach (var item in xx)
                        {
                            var ddd = webMapList.FirstOrDefault(e => e.receiverId == item.ReceiverID);
                            if (ddd != null)
                            {
                                ddd.numInactive = _gdl.ActiveAlarmsViewTable.getInactiveCount(ddd.controlleraddress, ddd.devicetype, ddd.deviceaddress);
                                ddd.numActive = _gdl.ActiveAlarmsViewTable.getActiveCount(ddd.controlleraddress, ddd.devicetype, ddd.deviceaddress);
                                sev.Add(ddd.receiverId, ddd);

                            }
                            // we dont have an alarm (red flashing) so lets look for offline (yellow)
                            else
                            {
                                // highere
                                if (_gdl.OfflineReceiverIDs.Contains(item.ReceiverID))
                                {
                                    var wa = new WebMapAlarm();
                                    wa.receiverId = item.ReceiverID;
                                    wa.severity = 1;
                                    wa.numInactive = 0;
                                    wa.numActive = 0;
                                    webMapList.Add(wa);
                                    sev.Add(wa.receiverId, wa);


                                }

                                // if no offlines or alarming, do log and status (blue)
                                else if (_gdl.LandSReceiverIDs.Contains(item.ReceiverID))
                                {
                                    var wa = new WebMapAlarm();
                                    wa.receiverId = item.ReceiverID;
                                    wa.severity = 2;
                                    wa.numInactive = 0;
                                    wa.numActive = 0;
                                    webMapList.Add(wa);
                                    sev.Add(wa.receiverId, wa);
                                }
                            }

                    //sev now contains a reference to web alarms in the list, we just want to toggle colors

                            if (sev.Count > 0)
                    {
                        // check the latest severity
                        if (_lastColor.ContainsKey(webMapList.Last().receiverId))
                        {
                            if (_lastColor[webMapList.Last().receiverId] == webMapList.Last().severity)
                            {
                                // get another color - lower if we can
                                WebMapAlarm serverity = sev.Values.FirstOrDefault(e => e.severity < webMapList.Last().severity);

                                if (serverity != null)
                                {
                                    webMapList.Last().severity = serverity.severity;
                                }

                                else
                                {
                                    // get the largest
                                    var tlist = sev.Values.OrderBy(e => e.severity).ToList();
                                    webMapList.Last().severity = tlist[0].severity;

                                }

                            }

                        }
                    }



                    if (_lastColor.ContainsKey(webMapList.Last().receiverId))
                    {
                        _lastColor[webMapList.Last().receiverId] = webMapList.Last().severity;
                    }
                    else
                    {
                        _lastColor.Add(webMapList.Last().receiverId, webMapList.Last().severity);
                    }
                }
                    }


                    //foreach (var item in webMapList)
                    //{
                    //    item.numInactive = _gdl.ActiveAlarmsViewTable.getInactiveCount(item.controlleraddress, item.devicetype, item.deviceaddress);
                    //    item.numActive = _gdl.ActiveAlarmsViewTable.getActiveCount(item.controlleraddress, item.devicetype, item.deviceaddress);
                    //}


                    // now get counts - this is via groupedalarms
                    JsUpdateMapAlarms(webMapList);
                }
            }
            catch (Exception ex)
            {
                //_ah.ClearAll();
            }

        }
        private void CheckForNewAlarms()
        {
            bool newAlarmFound = false;

            // ONLY WANT TO SWITCH VIEWS IF THE COMM SERVER IS STARTED
            if (_gdl.CommServerStarted)
            {

                var x = _alarmUtility.getNewestAlarm();
                if (x != null)
                {
                    if (_latestAlarm == null)
                    {
                        newAlarmFound = true;
                    }
                    else
                    {
                        if ((_latestAlarm == null) || (x.Created > _latestAlarm.Created))
                        {
                            newAlarmFound = true;
                        }

                    }
                }

                if (newAlarmFound)
                {
                    // get view associated with the area
                    var map = _gdl.UIMapTable.getByAreaId(x.AreaGUID);
                    var shit = _navUtil.getViews();
                    var view = shit.FirstOrDefault(e => e.MapID == map.Id);
                    if (view != null)
                    {
                        // only if view is available to user
                        _gdl.CurrentView = view.ClientID;
                    }
                }
                if (x != null)
                {
                    _latestAlarm = new AlarmUtilityRecord(x);
                }
                else
                {
                    _latestAlarm = null;
                }
            }
            else
            {
                _latestAlarm = null;
            }
        }
        private void DoWorkThread()
        {
            _doWorkRunning = true;
            while (_doWorkRunning)
            {
                try
                {
                    // _doWorkEvent.WaitOne(1000);

                    CheckForNewAlarms();

                    // determine view (current view)
                    manageView();

                    // JsUpdateNavigation(getStubFloors());

                    displayNavigationBox();

                    //displayPatients(_currentSort);

                    displayAlarms();

                    _doWorkEvent.WaitOne(1000);

                    //if new alarms

                }

                catch (Exception ex)
                {

                }



                //Thread.Sleep(1000);
            }


        }
        
        /*
         * processes click events 
         */
        private void processNotifications(JToken clicks)
        {
            dynamic clickObj = clicks.ToObject<ExpandoObject>();
            dynamic type = clickObj.data.parameters.notification;
            if (type == "navigation")
                handleNavigation(clicks);
            //else if (type == "alarms")
            //    handleAlarms(clicks);
            //else if (type == "patients")
            //    handlePatients(clicks);
            //else if (type == "sort")
            //    handleSort(clicks);
            //else if (type == "maps")
            //    handleMaps(clicks);
            //else if (type == "clear")
            //    handleClearAlarm(clicks);
            //else if (type == "selected")
            //    handleSelected(clicks);
        }
        private void handleNavigation(JToken floor)
        {
            var x = (string)floor["data"]["id"];
            try
            {
                if (x != string.Empty)
                {
                    var shit = _currentNavBox.FirstOrDefault(e => e.selector == x);
                    if (shit != null)
                    {
                        _gdl.CurrentView = shit.viewID;
                        _doWorkEvent.Set();
                    }
                }

            }
            catch (Exception ex)
            {
                BRUtilityClasses.Logger.Error(ex);
            }

        }
        /*
         * click Handler methods
         */
        //private void handleSelected(JToken selected)
        //{
        //    var id = (string)selected["data"]["id"];

        //    // get current map

        //    var item = _gdl.UIViewTable.get(_gdl.CurrentView);
        //    if (!_selectedAlarms.ContainsKey(item.MapID))
        //    {
        //        _selectedAlarms.Add(item.MapID, id);
        //    }
        //    else
        //    {
        //        _selectedAlarms[item.MapID] = id;
        //    }
        //    //send img

        //    JsUpdateAlarmImg();

        //}
        //private void handleClearAlarm(JToken alarmId)
        //{
        //    if (_gdl.IsPrivAccessible(BRPrivileges.CLEARALARM))
        //    {
        //        // valid creds, so we can call  
        //        try
        //        {
        //            var alarmID = (string)alarmId["data"]["parameters"]["id"];
        //            //var lvitem = (DisplayRec)lvAlarms.Items[x];

        //            // remember, if a grouped alarm, we must return a list
        //            NewFloorPlan.AlarmClearList = _alarmUtility.Alarms2BCleared(alarmID, out NewFloorPlan.AlarmClearNotes);

        //            // if alarm is OK to clear
        //            if (NewFloorPlan.AlarmClearList.Count > 0)
        //            {
        //                // if we need notes, we need to show the box
        //                NewFloorPlan.AlarmClearShow = NewFloorPlan.AlarmClearNotes;

        //                _gdl.RefreshEvent.Set();
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            //BRUtilityClasses.Logger.Error(ex);
        //        }
        //    }
        //}
        //private void handleMaps(JToken mapClicks)
        //{
        //    //demos
        //    var receiverId = mapClicks["data"]["id"];
        //}
        //private void handleAlarms(JToken alarm)
        //{
        //    // need to make sure user is valid for clearing alarms
        //    if (_gdl.IsPrivAccessible(BRPrivileges.CLEARALARM))
        //    {
        //        // valid creds, so we can call  
        //        try
        //        {
        //            var alarmID = (string)alarm["data"]["id"];
        //            //var lvitem = (DisplayRec)lvAlarms.Items[x];
        //            NewFloorPlan.AlarmClearList = _alarmUtility.Alarms2BCleared(alarmID, out NewFloorPlan.AlarmClearNotes);
        //            NewFloorPlan.AlarmClearShow = true;
        //            _gdl.RefreshEvent.Set();
        //        }
        //        catch (Exception ex)
        //        {
        //            BRUtilityClasses.Logger.Error(ex);
        //        }
        //    }
        //}
        //private void handlePatients(JToken patient)
        //{
        //    var x = (string)patient["data"]["parameters"]["tag"];
        //    int y = Int32.Parse(x);
        //    if (x != string.Empty)
        //    {
        //        //_gdl.SelectedTag = _patientDisplayList.FirstOrDefault(e => e.tag == y).tag;
        //        NewFloorPlan.SelectedTag = _patientDisplayList.FirstOrDefault(e => e.tag == y).tag;

        //        // tell the main form (new event page) to open up the tag window - for some reason we cant do it from here - wrong thread 
        //        _gdl.RefreshEvent.Set();

        //        //NavigationCommands.GoToPage.Execute("/Pages/TagPage.xaml", _gdl.TagPicTarget);
        //    }

        //}

        // }
        //private void handleSort(JToken sort)
        //{
        //    var x = (string)sort["data"]["notificationId"];
        //    if (x == "active")
        //        sortColumns(SORTBY_ACTIVE);
        //    else if (x == "tags")
        //        sortColumns(SORTBY_TAG);
        //    else if (x == "names")
        //        sortColumns(SORTBY_PATIENT);
        //    else if (x == "rooms")
        //        sortColumns(SORTBY_ROOM);
        //}
        //private void sortColumns(string sorttype)
        //{
        //    if (_currentSort == sorttype)
        //    {
        //        _sortDirection = (_sortDirection + 1) % 2;
        //    }
        //    else
        //    {
        //        _sortDirection = 0;
        //        _currentSort = sorttype;
        //    }
        //    // update refresh
        //    _currentTagTime_P = DateTime.Now;
        //    // do it now
        //    _doWorkEvent.Set();
        //}

    }
}