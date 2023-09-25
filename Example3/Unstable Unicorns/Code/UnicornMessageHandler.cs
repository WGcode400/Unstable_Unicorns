using Example3.WebSocketServices;

namespace Example3.Unstable_Unicorns.Code
{
    public class UnicornMessageHandler
    {
        public class MessageHandler
        {
            //probably will make a singleton
            public StringMethodProvider _provider { get; private set; }
            //public DBConnection myConn;
            //public bool connected = false;
            public MessageHandler()
            {
                _provider = new StringMethodProvider();
                RegisterMethods();
                //ConnectDB();
            }

            //private void ConnectDB()
            //{
            //    myConn = DBConnection.Instance();
            //    myConn.Server = "localhost";
            //    myConn.DatabaseName = "pulse_test";
            //    myConn.UserName = "wyattg";
            //    myConn.Password = "accutech";
            //    connected = myConn.IsConnect();
            //    myConn.Select("tbl_areas");

            //}

            private void RegisterMethods()
            {
                //_provider.Register("database.getConfiguration", args => getConfiguration((JToken)args[0]));
                //_provider.Register("database.setConfiguration", args => setConfiguration((JToken)args[0]));
                //_provider.Register("database.setAsset", args => setAsset((JToken)args[0]));

                ////gets
                //_provider.Register("get_areas", args => getAreas());
                //_provider.Register("get_controllers", args => getControllers());
                //_provider.Register("get_receivers", args => getReceivers());
                //_provider.Register("get_maps", args => getMaps());
                //_provider.Register("get_iconTypes", args => getIcons());
                //_provider.Register("get_clientViews", args => getClientViews());
                //_provider.Register("get_views", args => getViews());
                //_provider.Register("get_setup", args => getSetup());
                //_provider.Register("get_topology", args => getTopology());

                ////sets
                //_provider.Register("set_areas", args => setAreas((JToken)args[0]));
                //_provider.Register("set_topologyTimestamp", args => setTopology((JToken)args[0]));
                //_provider.Register("set_controllers", args => setControllers((JToken)args[0]));
                //_provider.Register("set_iconTypes", args => setIcons((JToken)args[0]));
                //_provider.Register("set_maps", args => setMaps((JToken)args[0]));
                //_provider.Register("set_receivers", args => setReceivers((JToken)args[0]));
                //_provider.Register("set_views", args => setViews((JToken)args[0]));
                //_provider.Register("set_setup", args => setSetup((JToken)args[0]));
                //_provider.Register("set_clientViews", args => setClientViews((JToken)args[0]));

                ////views notify
                ////_provider.Register("", args => setActiveView());

                ////add any extra methods
                //_provider.Register("get_assets", args => getAssets());
                //_provider.Register("get_defaultView", args => getDefaultView());

                //versionrequest method
                //notification cancel all request

            }
        }
    }
}