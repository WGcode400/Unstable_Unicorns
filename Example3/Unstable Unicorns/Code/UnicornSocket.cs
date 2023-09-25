using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using WebSocketSharp;
using WebSocketSharp.Server;
using Newtonsoft.Json;
using Example3.MsgClasses;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Dynamic;
using QuickType;
using System.Drawing;
using Example3.Units;

namespace Example3.Unstable_Unicorns.Code
{
    public class UnicornSocket : WebSocketBehavior
    {
        private string _name;
        private static int _number = 0;
        private string _prefix;
        //private int count = 0;
        private UnicornMessageHandler _msgHandler;
        //private Dictionary<string, string> _clickMap;

        public UnicornSocket()
            : this(null)
        {
        }

        public UnicornSocket(string prefix)
        {
            _prefix = !prefix.IsNullOrEmpty() ? prefix : "client#";

            _msgHandler = new UnicornMessageHandler();

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
        }

        protected override void OnOpen()
        {
            _name = getName();
        }

        protected override void OnMessage(MessageEventArgs e)
        {
            //fakestartup
            //if (count <= 11)
            //fakeStartup(e.Data);
            //else
           // {
                var packet = JsonConvert.DeserializeObject<JObject>(e.Data);

                //specific packets
                //var ready = packet["ready"];
                //var requests = packet["requests"];
                //var notificationRequest = packet["notificationRequest"];
                //var request = packet["request"];
                //var notificationCancelAllRequest = packet["notificationCancelAllRequest"];
                //var versionRequest = packet["versionRequest"];

                ////all Packets
                //var echoBack = packet["echoBack"];

                //if (ready != null)
                //    startSequence();
                //if (requests != null)
                //    processRequests(requests, echoBack);
                //if (notificationRequest != null)
                //    processNotificationRequest(notificationRequest);
                //if (notificationCancelAllRequest != null)
                //    processNotificationCancelAllRequest(notificationCancelAllRequest);
                //if (versionRequest != null)
                //    processVersionRequest(versionRequest);
                //if (request != null)
                //{
                //    dynamic response = processRequest(request);
                //    Dictionary<string, object> responsePacket = new Dictionary<string, object>();
                //    responsePacket.Add("echoBack", echoBack);
                //    responsePacket.Add(response.name, response.obj);
                //    Send(JsonConvert.SerializeObject(responsePacket));
                //}

                //handle buttonclick messages

            //}
           // count++;
        }

        //private void startSequence()
        //{
        //    string TEST_CONFIG = System.IO.File.ReadAllText(@"C:\Users\wyattg\Downloads\websocket-sharp-master\websocket-sharp-master\Example3\WebFakes\test.json");
        //    string TEST_button = System.IO.File.ReadAllText(@"C:\Users\wyattg\Downloads\websocket-sharp-master\websocket-sharp-master\Example3\WebFakes\testNoti.json");

        //    //gte configuration to show

        //    //if ((bool)isReady == true)
        //    {
        //        //getConfiguration();
        //        StubGetMap();
        //        //JsEditMap(new object());
        //        //Send(TEST_button);
        //        //Send(TEST_CONFIG);
        //        //notificationEnrollment();
        //        //mapIconNotification();
        //        updateNavigation(fakeFloors());
        //        updateTagList(fakeTags());
        //        lockdownNotificationEnrollment();
        //        updateAlarmGrid(fakeAlarmRecords());
        //        updateLockdown();

        //    }
        //    //send configuration and view
        //    //Send MapIcon Notification
        //}



        //private void processRequests(JToken requests, JToken echo)
        //{
        //    List<dynamic> responseList = new List<dynamic>();
        //    Dictionary<string, object> responsePacket = new Dictionary<string, object>();
        //    foreach (JProperty request in requests)
        //    {
        //        var requestVal = request.Children();
        //        foreach (var val in requestVal)
        //        {
        //            responseList.Add(processRequest(val));
        //        }
        //    }
        //    foreach (dynamic res in responseList)
        //        responsePacket.Add(res.name, res.obj);

        //    //MakePacket
        //    if (responsePacket.Count != 0)
        //    {
        //        responsePacket.Add("echoBack", echo);
        //        Send(JsonConvert.SerializeObject(responsePacket));
        //    }

        //}
        //private void processNotificationRequest(JToken request)
        //{
        //    string name = (string)request["name"];
        //    int requestId = (int)request["echoBack"]["requestId"];
        //    string response = _msgHandler._provider.Intercept<string>("requestNotification", name);
        //    //IF RETVAL IS NULL THEN IT IS A VOID FUNCTION
        //    if (response != null)
        //    {
        //        Send(response);
        //    }
        //}
        //private dynamic processRequest(JToken request)
        //{
        //    string method = (string)request["name"];
        //    JToken paras = request["parameters"];
        //    dynamic response = _msgHandler._provider.Intercept<dynamic>(method, paras);
        //    //IF RETVAL IS NULL THEN IT IS A VOID FUNCTION
        //    return response;
        //}

        //private void processNotificationCancelAllRequest(JToken request)
        //{

        //}
        //private void processVersionRequest(JToken request)
        //{

        //}
        //private void lockdownNotificationEnrollment()
        //{
        //    var notificationId = Guid.NewGuid();
        //    dynamic query = new ExpandoObject();
        //    dynamic request = new ExpandoObject();
        //    dynamic parameters = new ExpandoObject();
        //    parameters.notification = "id";
        //    request.name = "jqueryNotification";
        //    request.parameters = new ExpandoObject();
        //    request.parameters.function = "click";
        //    request.parameters.notificationId = "clicked";
        //    request.parameters.selector = "#lockdownButtonActive";
        //    request.parameters.parameters = parameters;
        //    //request.parameters.parameters = null; //should be uuid of button //comesfrom client id
        //    query.request = request;
        //    string json = JsonConvert.SerializeObject(query);
        //    Send(json);
        //}
        //private void updateLockdown()
        //{
        //    dynamic query = new ExpandoObject();
        //    //initialize request and parameters 
        //    Request request = new Request();
        //    dynamic parameters = new ExpandoObject();
        //    //set request name
        //    request.Name = "lockdown.update";
        //    //set parameters
        //    //parameters.parameters = Guid.NewGuid(); // example = "db082c3a-8190-4f8d-8d6e-34b1c4495f3c";
        //    parameters.notificationId = "wyatt map"; // example = "506428d8-3a12-40e8-a17f-9aa20db4b296";
        //    parameters.lockdown = false;
        //    //set parameters in the request
        //    request.Parameters = parameters;
        //    // set the request to the query
        //    query.request = request;
        //    string json = JsonConvert.SerializeObject(query);
        //    Send(json);
        //}
        //private List<WebTagRecords> fakeTags()
        //{
        //    var tags = new List<WebTagRecords>();
        //    WebTagRecords a = new WebTagRecords();
        //    a.Tag = "10";
        //    a.Alarming = true;
        //    WebTagRecords b = new WebTagRecords();
        //    b.Tag = "111";
        //    b.Alarming = false;

        //    tags.Add(a);
        //    tags.Add(b);
        //    tags.Add(a);

        //    return tags;
        //}
        //private void updateTagList(List<WebTagRecords> tags)
        //{
        //    dynamic query = new ExpandoObject();
        //    //initialize request and parameters 
        //    Request request = new Request();
        //    dynamic parameters = new ExpandoObject();
        //    //set request name
        //    request.Name = "tags.update";
        //    //set parameters
        //    //parameters.parameters = Guid.NewGuid(); // example = "db082c3a-8190-4f8d-8d6e-34b1c4495f3c";
        //    parameters.notificationId = "wyatt map"; // example = "506428d8-3a12-40e8-a17f-9aa20db4b296";
        //    parameters.tags = tags;
        //    //set parameters in the request
        //    request.Parameters = parameters;
        //    // set the request to the query
        //    query.request = request;
        //    string json = JsonConvert.SerializeObject(query);
        //    Send(json);
        //}
        //public List<string> fakeFloors()
        //{
        //    var floors = new List<string>();
        //    floors.Add("1");
        //    floors.Add("2");
        //    floors.Add("3");
        //    return floors;
        //}
        //private void updateNavigation(List<string> floors)
        //{
        //    dynamic query = new ExpandoObject();
        //    //initialize request and parameters 
        //    Request request = new Request();
        //    dynamic parameters = new ExpandoObject();
        //    //set request name
        //    request.Name = "navigation.update";
        //    //set parameters
        //    //parameters.parameters = Guid.NewGuid(); // example = "db082c3a-8190-4f8d-8d6e-34b1c4495f3c";
        //    parameters.notificationId = "wyatt map"; // example = "506428d8-3a12-40e8-a17f-9aa20db4b296";
        //    parameters.floors = floors;
        //    //set parameters in the request
        //    request.Parameters = parameters;
        //    // set the request to the query
        //    query.request = request;
        //    string json = JsonConvert.SerializeObject(query);
        //    Send(json);
        //}
        //private void updateAlarmGrid(List<WebAlarmRecords> alarms)
        //{
        //    dynamic query = new ExpandoObject();
        //    //initialize request and parameters 
        //    Request request = new Request();
        //    dynamic parameters = new ExpandoObject();
        //    //set request name
        //    request.Name = "alarmGrid.update";
        //    //set parameters
        //    //parameters.parameters = Guid.NewGuid(); // example = "db082c3a-8190-4f8d-8d6e-34b1c4495f3c";
        //    parameters.notificationId = "wyatt map"; // example = "506428d8-3a12-40e8-a17f-9aa20db4b296";
        //    parameters.alarms = alarms;
        //    //set parameters in the request
        //    request.Parameters = parameters;
        //    // set the request to the query
        //    query.request = request;
        //    string json = JsonConvert.SerializeObject(query);
        //    Send(json);
        //}
        //private List<WebAlarmRecords> fakeAlarmRecords()
        //{
        //    List<WebAlarmRecords> alarms = new List<WebAlarmRecords>();
        //    WebAlarmRecords a = new WebAlarmRecords() { Action = "test", Event = "1", Name = "bob", EventTime = "ccc", Tag = "10" };
        //    for (int i = 0; i < 6; i++) { alarms.Add(a); }
        //    return alarms;
        //}
        /*
         * Enroll button clicks from UI screen to notify when they have been clicked
         */
        //private void notificationEnrollment()
        //{
        //    var notificationId = Guid.NewGuid();
        //    dynamic query = new ExpandoObject();
        //    dynamic request = new ExpandoObject();
        //    request.name = "jqueryNotification";
        //    request.parameters = new ExpandoObject();
        //    request.parameters.function = "click";
        //    request.parameters.notificationId = "button1";
        //    request.parameters.selector = "#button";
        //    //request.parameters.parameters = null; //should be uuid of button //comesfrom client id
        //    query.request = request;
        //    string json = JsonConvert.SerializeObject(query);
        //    Send(json);
        //}
        /*
         * Enroll button clicks from UI Map screen to notify when objects on map have been clicked
         */
        //private void mapIconNotification()
        //{
        //    //make object
        //    dynamic query = new ExpandoObject();
        //    //initialize request and parameters 
        //    Request request = new Request();
        //    dynamic parameters = new ExpandoObject();
        //    //set request name
        //    request.Name = "mapIconNotification";
        //    //set parameters
        //    //parameters.parameters = Guid.NewGuid(); // example = "db082c3a-8190-4f8d-8d6e-34b1c4495f3c";
        //    parameters.notificationId = "wyatt map"; // example = "506428d8-3a12-40e8-a17f-9aa20db4b296";
        //    //set parameters in the request
        //    request.Parameters = parameters;
        //    // set the request to the query
        //    query.request = request;
        //    string json = JsonConvert.SerializeObject(query);
        //    Send(json);
        //}
        //private void getConfiguration()
        //{
        //    Dictionary<string, object> msg = new Dictionary<string, object>();

        //    Dictionary<string, object> areas = new Dictionary<string, object>();
        //    Dictionary<string, object> controllers = new Dictionary<string, object>();
        //    Dictionary<string, object> receivers = new Dictionary<string, object>();
        //    Dictionary<string, object> maps = new Dictionary<string, object>();
        //    Dictionary<string, object> iconTypes = new Dictionary<string, object>();
        //    Dictionary<string, object> views = new Dictionary<string, object>();
        //    Dictionary<string, object> clientViews = new Dictionary<string, object>();

        //    //get view to show
        //    string defaultView = _msgHandler._provider.Intercept<string>("defualtView");

        //    //get topologyTimestamp
        //    var topologyTimestamp = _msgHandler._provider.Intercept<double>("topologyTimestamp");

        //    //get setup
        //    var setup = _msgHandler._provider.Intercept<WebSetup>("get_setup");

        //    //get svgs
        //    var svgList = _msgHandler._provider.Intercept<List<WebAssets>>("get_assets");
        //    foreach (var svg in svgList)
        //    {
        //        msg.Add(svg.Id, svg.SVG);
        //    }

        //    //get areas
        //    var areaList = _msgHandler._provider.Intercept<List<WebArea>>("get_areas");
        //    foreach (var area in areaList)
        //    {
        //        areas.Add(area.Guid, area);
        //    }

        //    //get iconTypes
        //    var iconList = _msgHandler._provider.Intercept<List<WebIcon>>("get_iconTypes");
        //    foreach (var icon in iconList)
        //    {
        //        iconTypes.Add(icon.Guid, icon);
        //    }

        //    //get controllers
        //    var controllerList = _msgHandler._provider.Intercept<List<WebController>>("get_controllers");
        //    foreach (var controller in controllerList)
        //    {
        //        controllers.Add(controller.Guid, controller);
        //    }

        //    //get receivers
        //    var receiverList = _msgHandler._provider.Intercept<List<WebReceiver>>("get_receivers");
        //    foreach (var receiver in receiverList)
        //    {
        //        receivers.Add(receiver.Guid, receiver);
        //    }
        //    //get rcvr in controllers or map


        //    //get maps
        //    var mapList = _msgHandler._provider.Intercept<List<WebMap>>("get_maps");
        //    foreach (var map in mapList)
        //    {
        //        maps.Add(map.Guid, map);
        //    }

        //    //get views
        //    var viewList = _msgHandler._provider.Intercept<List<WebView>>("get_views");
        //    foreach (var view in viewList)
        //    {
        //        views.Add(view.Guid, view);
        //    }

        //    //get client views
        //    var clientList = _msgHandler._provider.Intercept<List<WebClientView>>("get_clientViews");
        //    foreach (var client in clientList)
        //    {
        //        clientViews.Add(client.Guid, client);
        //    }

        //    //Add to packet
        //    msg.Add("areas", areas);
        //    msg.Add("controllers", controllers);
        //    msg.Add("receivers", receivers);
        //    msg.Add("maps", maps);
        //    msg.Add("views", views);
        //    msg.Add("clientViews", clientViews);
        //    msg.Add("iconTypes", iconTypes);
        //    msg.Add("setup", setup);
        //    msg.Add("topologyTimestamp", topologyTimestamp);

        //    //showMap
        //    JsShowMap(msg, defaultView);
        //}
        //private void StubGetMap()
        //{
        //    //initalize elements
        //    dynamic packet = new ExpandoObject();
        //    Dictionary<string, object> dic = new Dictionary<string, object>();
        //    //Dictionary<string, object> svgFiles = new Dictionary<string, object>();
        //    Dictionary<string, object> areas = new Dictionary<string, object>();
        //    Dictionary<string, object> controllers = new Dictionary<string, object>();
        //    Dictionary<string, object> receivers = new Dictionary<string, object>();
        //    Dictionary<string, object> maps = new Dictionary<string, object>();
        //    Dictionary<string, object> iconTypes = new Dictionary<string, object>();
        //    Dictionary<string, object> views = new Dictionary<string, object>();
        //    Dictionary<string, object> clientViews = new Dictionary<string, object>();

        //    //Stub timestamp
        //    double topologyTimestamp = 0.1;

        //    //stub assets
        //    //stub single door icon
        //    WebAssets sd = new WebAssets();
        //    sd.Id = "SingleDoor";
        //    sd.SVG = System.IO.File.ReadAllText("./Public/maps/demoSetup/singleDoor.svg");
        //    Console.WriteLine(sd.SVG);
        //    //stub map
        //    WebAssets map = new WebAssets();
        //    map.Id = "overview_hospital";
        //    map.SVG = System.IO.File.ReadAllText("./Public/maps/demoSetup/Alpha_Overview.svg");
        //    Console.WriteLine(map.SVG);
        //    //stub areas
        //    WebArea a = new WebArea();
        //    a.Guid = Guid.NewGuid().ToString();
        //    a.Name = "Wyatt Test area";

        //    //stub iconTypes
        //    WebIcon type = new WebIcon();
        //    type.Guid = Guid.NewGuid().ToString();
        //    type.IconSVGId = sd.Id;
        //    type.Name = "single_door";

        //    //stub controllers
        //    WebController c = new WebController();
        //    c.Guid = Guid.NewGuid().ToString();
        //    c.Address = 1;
        //    c.AssociatedAreaGuid = a.Guid;
        //    c.isDoor = true;
        //    c.isTx = true;
        //    c.Name = "Get in the Zone; Wyatts Zone!";

        //    //stub receivers
        //    WebReceiver r = new WebReceiver();
        //    r.ControllerGuid = c.Guid;
        //    r.Guid = Guid.NewGuid().ToString();
        //    r.Description = "Wyatts Door Receiver";
        //    r.Number = "1";
        //    r.Channel = 0;
        //    r.IconTypeGuid = type.Guid;

        //    //stub jobj controller c.ReceiverIds
        //    Dictionary<string, string> cRcvr = new Dictionary<string, string>();
        //    cRcvr.Add("0", r.Guid);
        //    JObject jobc = new JObject();
        //    jobc = JsonConvert.DeserializeObject<JObject>(JsonConvert.SerializeObject(cRcvr));
        //    c.ReceiverIds = jobc;

        //    //stub maps
        //    WebMap mapObj = new WebMap();
        //    mapObj.Guid = Guid.NewGuid().ToString();
        //    mapObj.MapName = "OverView";
        //    mapObj.IconSize = 40;
        //    mapObj.FontSize = 40;
        //    mapObj.ImageGuid = map.Id;

        //    //jobj stub map rcvrs
        //    JObject job = new JObject();
        //    WebMapRcvr mRcvr = new WebMapRcvr();
        //    //wrap rcvrs in a map
        //    Dictionary<string, object> rcvrMap = new Dictionary<string, object>();
        //    mRcvr.Guid = r.Guid;
        //    mRcvr.XCenter = 200;
        //    mRcvr.YCenter = 141;
        //    mRcvr.LabelAngle = 60;
        //    mRcvr.LabelRadius = .7;
        //    job = JsonConvert.DeserializeObject<JObject>(JsonConvert.SerializeObject(mRcvr));
        //    rcvrMap.Add(mRcvr.Guid, job);
        //    mapObj.Receivers = JsonConvert.DeserializeObject<JObject>(JsonConvert.SerializeObject(rcvrMap));

        //    //stub views
        //    WebView view = new WebView();
        //    view.Guid = Guid.NewGuid().ToString();
        //    view.MapGuid = mapObj.Guid;
        //    view.Label = "overView_View";
        //    view.Rotation = 0;
        //    view.XOffset = 0;
        //    view.YOffset = 0;
        //    view.Scale = 1;

        //    //stub client views
        //    WebClientView client = new WebClientView();
        //    client.Guid = Guid.NewGuid().ToString();
        //    client.Name = "Default";
        //    //client.Views is jarray stub jarray
        //    JArray jar = new JArray();
        //    jar.Add(view.Guid);
        //    client.Views = jar;

        //    //stub setup
        //    WebSetup setup = new WebSetup();
        //    setup.FacilityName = "Wyatts House";
        //    setup.DefaultClient = client.Guid;

        //    //add objs to dictionaries
        //    areas.Add(a.Guid, a);
        //    controllers.Add(c.Guid, c);
        //    receivers.Add(r.Guid, r);
        //    maps.Add(mapObj.Guid, mapObj);
        //    views.Add(view.Guid, view);
        //    clientViews.Add(client.Guid, client);
        //    iconTypes.Add(type.Guid, type);

        //    //add to requests/responses dictionary
        //    dic.Add("areas", areas);
        //    dic.Add("controllers", controllers);
        //    dic.Add("receivers", receivers);
        //    dic.Add("maps", maps);
        //    dic.Add("views", views);
        //    dic.Add("clientViews", clientViews);
        //    dic.Add("iconTypes", iconTypes);
        //    dic.Add("setup", setup);
        //    dic.Add("topologyTimestamp", topologyTimestamp);
        //    dic.Add(sd.Id, sd.SVG);
        //    dic.Add(map.Id, map.SVG);

        //    JsShowMap(dic, view.Guid);
        //}
        /*
         * Tells the UI screen to display this map view
         */
        //private void JsShowMap(dynamic configuration, string defaultView)
        //{
        //    dynamic query = new ExpandoObject();
        //    Request request = new Request();
        //    dynamic parameters = new ExpandoObject();

        //    parameters.view = defaultView;
        //    parameters.configuration = configuration;

        //    request.Name = "map.show";
        //    request.Parameters = parameters;

        //    query.request = request;
        //    string json = JsonConvert.SerializeObject(query);
        //    Send(json);
        //}
        /*
         * Tells the UI screen to display edit map controls view
         */
        /*private void fakeStartup(string msg)
        {
            //System.IO.File.WriteAllText(@"C:\Users\wyattg\Documents\workspace\brcatacombsapp\BRApplicationUI.App\WebUnits\" + count+11 +".json", msg);
            //fake startup
            if (count >= 11) { }
            else
            {
                // get folder for json stuff - it is now mvoed to the run folder
                //string folder = Directory.GetCurrentDirectory();
                //folder += @"\WebFakes\" + count + ".json";

                 Send(System.IO.File.ReadAllText(@"C:\Users\wyattg\Documents\workspace\brcatacombsapp\BRApplicationUI.App\WebUnits\" + count + ".json"));


                //Send(System.IO.File.ReadAllText(folder));
                //Sessions.Broadcast(System.IO.File.ReadAllText(@"C:\Users\daveb\Documents\Development\GitSpace\BR5200-accutech\Cuddles\brcatacombsapp\BRApplicationUI.App\WebUnits\" + count + ".json"));
                // Sessions.Broadcast(System.IO.File.ReadAllText(folder));




            }
            // Sessions.Broadcast(System.IO.File.ReadAllText(@"C:\Users\daveb\Documents\Development\GitSpace\BR5200-accutech\Cuddles\brcatacombsapp\BRApplicationUI.App\WebUnits\" + count + ".json"));
        }
        */    
    }
}

