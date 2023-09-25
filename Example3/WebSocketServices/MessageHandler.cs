using Example3.MsgClasses;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;

namespace Example3.WebSocketServices
{
    public class MessageHandler
    {
        //probably will make a singleton
        public StringMethodProvider _provider { get; private set; }
        public DBConnection myConn;
        public bool connected = false;
        public MessageHandler()
        {
            _provider = new StringMethodProvider();
            RegisterMethods();
            //ConnectDB();
        }

        private void ConnectDB()
        {
            myConn = DBConnection.Instance();
            myConn.Server = "localhost";
            myConn.DatabaseName = "pulse_test";
            myConn.UserName = "wyattg";
            myConn.Password = "accutech";
            connected = myConn.IsConnect();
            myConn.Select("tbl_areas");
            
        }

        private void RegisterMethods()
        {
            //_provider.Register("database.getConfiguration", args => getConfiguration((JToken)args[0]));
            _provider.Register("database.setConfiguration", args => setConfiguration((JToken)args[0]));
            _provider.Register("database.setAsset", args => setAsset((JToken)args[0]));
            
            //gets
            _provider.Register("get_areas", args => getAreas());
            _provider.Register("get_controllers", args => getControllers());
            _provider.Register("get_receivers", args => getReceivers());
            _provider.Register("get_maps", args => getMaps());
            _provider.Register("get_iconTypes", args => getIcons());
            _provider.Register("get_clientViews", args => getClientViews());
            _provider.Register("get_views", args => getViews());
            _provider.Register("get_setup", args => getSetup());
            _provider.Register("get_topology", args => getTopology());

            //sets
            _provider.Register("set_areas", args => setAreas((JToken)args[0]));
            _provider.Register("set_topologyTimestamp", args => setTopology((JToken)args[0]));
            _provider.Register("set_controllers", args => setControllers((JToken)args[0]));
            _provider.Register("set_iconTypes", args => setIcons((JToken)args[0]));
            _provider.Register("set_maps", args => setMaps((JToken)args[0]));
            _provider.Register("set_receivers", args => setReceivers((JToken)args[0]));
            _provider.Register("set_views", args => setViews((JToken)args[0]));
            _provider.Register("set_setup", args => setSetup((JToken)args[0]));
            _provider.Register("set_clientViews", args => setClientViews((JToken)args[0]));

            //views notify
            //_provider.Register("", args => setActiveView());

            //add any extra methods
            _provider.Register("get_assets", args => getAssets());
            _provider.Register("get_defaultView", args => getDefaultView());


            //versionrequest method
            //notification cancel all request

        }

        private string getConfiguration(JToken paras)
        {
            //get the data information from db to return to a packet
            var retVal = _provider.Intercept<string>("get" + paras, paras);
                
            Console.WriteLine(retVal);

            return retVal;

        }
        private dynamic setConfiguration(JToken paras)
        {
            string method = "set_" + (string)paras[0];
            JToken parameters = paras[1];
            var retVal = _provider.Intercept<dynamic>(method, parameters);
            
            return retVal;
        }
        private dynamic setAsset(JToken paras) 
        {
            Response res = new Response();
            dynamic retVal = new ExpandoObject();
            string name = (string)paras[0];
            string svg = (string)paras[1];
            //optional put into object

            //call database to save


            //response
            res.Data = true;
            retVal.name = name;
            retVal.obj = res;

            return retVal;
        }
        private dynamic setAreas(JToken paras)
        {
            Dictionary<string, object> map = JsonConvert.DeserializeObject<Dictionary<string, object>>(paras.ToString());
            WebArea area;
            Response res = new Response();
            dynamic retVal = new ExpandoObject();

            foreach (JObject kV in map.Values)
            {
                //convert jobj to my class obj
                area = kV.ToObject<WebArea>();

                //To Do: call db to save
                
            }

            //response
            res.Data = true;
            retVal.name = "areas";
            retVal.obj = res;

            return retVal;
        }
        private dynamic setTopology(JToken paras)
        {
            double topologyTimestamp = (double)paras;
            dynamic retVal = new ExpandoObject();
            Response res = new Response();
             
            //To Do: call db to save
            
            //response
            res.Data = true;
            retVal.name = "topologyTimestamp";
            retVal.obj = res;

            return retVal;            
        }
        private dynamic setControllers(JToken paras)
        {
            Dictionary<string, object> map = JsonConvert.DeserializeObject<Dictionary<string, object>>(paras.ToString());
            WebController controller;
            Response res = new Response();
            dynamic retVal = new ExpandoObject();

            foreach (JToken kV in map.Values)
            {
                //convert jobj to my class obj
                controller = kV.ToObject<WebController>();

                //To Do: call db to save

            }

            //response
            res.Data = true;
            retVal.name = "controllers";
            retVal.obj = res;

            return retVal;
        }
        private dynamic setIcons(JToken paras)
        {
            Dictionary<string, object> map = JsonConvert.DeserializeObject<Dictionary<string, object>>(paras.ToString());
            WebIcon icon;
            Response res = new Response();
            dynamic retVal = new ExpandoObject();

            foreach (JToken kV in map.Values)
            {
                //convert jobj to my class obj
                icon = kV.ToObject<WebIcon>();

                //To Do: call db to save

            }

            //response
            res.Data = true;
            retVal.name = "iconTypes";
            retVal.obj = res;

            return retVal;
        }
        private dynamic setReceivers(JToken paras)
        {
            Dictionary<string, object> map = JsonConvert.DeserializeObject<Dictionary<string, object>>(paras.ToString());
            WebReceiver receiver;
            Response res = new Response();
            dynamic retVal = new ExpandoObject();

            foreach (JToken kV in map.Values)
            {
                //convert jobj to my class obj
                receiver = kV.ToObject<WebReceiver>();

                //To Do: call db to save

            }

            //response
            res.Data = true;
            retVal.name = "receivers";
            retVal.obj = res;

            return retVal;

        }
        private dynamic setViews(JToken token)
        {
            Dictionary<string, object> map = JsonConvert.DeserializeObject<Dictionary<string, object>>(token.ToString());
            WebView view;
            Response res = new Response();
            dynamic retVal = new ExpandoObject();

            foreach (JObject kV in map.Values)
            {                
                //convert jobj to my class obj
                view = kV.ToObject<WebView>();

                //call db to save


            }
            //response
            res.Data = true;
            retVal.name = "views";
            retVal.obj = res;

            return retVal;
        }
        private dynamic setMaps(JToken paras)
        {
            Dictionary<string, object> dictionary = JsonConvert.DeserializeObject<Dictionary<string, object>>(paras.ToString());
            WebMap map;
            Response res = new Response();
            dynamic retVal = new ExpandoObject();

            foreach (JToken kV in dictionary.Values)
            {
                //convert jobj to my class obj
                map = kV.ToObject<WebMap>();

                //To Do: call db to save

            }

            //response
            res.Data = true;
            retVal.name = "maps";
            retVal.obj = res;

            return retVal;
        }               
        private dynamic setSetup(JToken paras)
        {            
            WebSetup setup;            
            Response res = new Response();
            dynamic retVal = new ExpandoObject();
                        
            //convert jobj to my class obj
            setup = paras.ToObject<WebSetup>();

            //To Do: call db to save
                    

            //response
            res.Data = true;
            retVal.name = "setup";
            retVal.obj = res;

            return retVal;
        }
        private dynamic setClientViews(JToken paras)
        {
            Dictionary<string, object> map = JsonConvert.DeserializeObject<Dictionary<string, object>>(paras.ToString());
            WebClientView clientView;
            Response res = new Response();
            dynamic retVal = new ExpandoObject();

            foreach (JObject kV in map.Values)
            {
                //convert jobj to my class obj
                clientView = kV.ToObject<WebClientView>();

                //call db to save


            }
            //response
            res.Data = true;
            retVal.name = "views";
            retVal.obj = res;

            return retVal;
        }

        private List<WebAssets> getAssets()
        {
            var retVal = new List<WebAssets>();
            //Future: ask database for assets/svgs

            //fake for testing
            WebAssets asset = new WebAssets();
            asset.Id = "map";
            //read svg from file
            //asset.SVG = ;
            return retVal;
        }
        private List<WebArea> getAreas()
        {
            List<WebArea> retVal = new List<WebArea>();
            //Future: ask database for areas

            //fake for testing
            WebArea area = new WebArea();
            area.Guid = Guid.NewGuid().ToString();
            area.Name = "Wyatt's Fake Floor";
            //add to list
            retVal.Add(area);

            //wrap in response
            //dynamic retVal = new ExpandoObject();
            //Response res = new Response();
            //res.Data = area;
            //retVal.name = "areas";
            //retVal.obj = res;

            return retVal;
        }
        private List<WebController> getControllers()
        {
            List<WebController> retVal = new List<WebController>();
            //ask database for 

            //fake for testing 
            WebController controller = new WebController();


            return retVal;
        }
        private List<WebReceiver> getReceivers()
        {
            List<WebReceiver> retVal = new List<WebReceiver>();
            //ask database for

            //fake for testing 
            WebReceiver receiver = new WebReceiver();

            return retVal;
        }
        private List<WebClientView> getClientViews()
        {
            List<WebClientView> retVal = new List<WebClientView>();
            //ask database for

            //fake for testing
            WebClientView client = new WebClientView();

            return retVal;
        }
        private List<WebMap> getMaps()
        {
            List<WebMap> retVal = new List<WebMap>();
            //ask database for 

            //fake for testing 
            WebMap map = new WebMap();

            return retVal;
        }
        private List<WebIcon> getIcons()
        {
            List<WebIcon> retVal = new List<WebIcon>();
            //ask database for 

            //fake
            WebIcon icon = new WebIcon();

            return retVal;
        }
        private List<WebView> getViews()
        { 
            List<WebView> retVal = new List<WebView>();
            //ask database for 

            //fake 
            WebView view = new WebView();

            return retVal;
        }
        private WebSetup getSetup()
        {
            //ask database for 

            //fake
            WebSetup setup = new WebSetup();

            return setup;
        }
        private double getTopology()
        {
            //ask database for
            
            //fake
            double topologyTimestamp = .01;

            return topologyTimestamp;
        }
        private string getDefaultView()
        {
            //ask db 

            //fake
            var defaultView = "fakeView"; //Guid.NewGuid().ToString();

            //return a view guid to show from the views table
            return defaultView;
        }
    }
}
