using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BRApplicationUI.App.GlobalDataLibrary;
//using BRClientInterface.DataClasses;
//using SharedContracts;
//using BRUtilityClasses;
using ElectronDisplay.Services;
using ElectronDisplay.Units;
using BRApplicationUI.App.WebUnits.MsgClasses;

namespace BRApplicationUI.App.WebServices
{
    public class MessageHandler
    {
        private GlobalDataLib _gdl;
        public StringMethodProvider _provider { get; private set; }

        public MessageHandler()
        {
            _provider = new StringMethodProvider();
            _gdl = GlobalDataLib.Instance;
            RegisterMethods();

        }

        private void RegisterMethods()
        {
            //router methods for saving
            _provider.Register("database.getConfiguration", args => getConfiguration((JToken)args[0]));
            _provider.Register("database.setConfiguration", args => setConfiguration((JToken)args[0]));

            //for SVGs
            _provider.Register("database.setAsset", args => setAsset((JToken)args[0]));

            //gets for startup/changing config
            _provider.Register("get_areas", args => getAreas());
            _provider.Register("get_controllers", args => getControllers());
            _provider.Register("get_receivers", args => getReceivers());
            _provider.Register("get_maps", args => getMaps());
            _provider.Register("get_iconTypes", args => getIcons());
            _provider.Register("get_clientViews", args => getClientViews());
            _provider.Register("get_views", args => getViews());
            _provider.Register("get_setup", args => getSetup());
            _provider.Register("get_topologyTimestamp", args => getTopology());

            //sets for saving whole configuration
            _provider.Register("set_areas", args => setAreas((JToken)args[0]));
            _provider.Register("set_topologyTimestamp", args => setTopology((JToken)args[0]));
            _provider.Register("set_controllers", args => setControllers((JToken)args[0]));
            _provider.Register("set_iconTypes", args => setIcons((JToken)args[0]));
            _provider.Register("set_maps", args => setMaps((JToken)args[0]));
            _provider.Register("set_receivers", args => setReceivers((JToken)args[0]));
            _provider.Register("set_views", args => setViews((JToken)args[0]));
            _provider.Register("set_setup", args => setSetup((JToken)args[0]));
            _provider.Register("set_clientViews", args => setClientViews((JToken)args[0]));

            //registering notifications
            //_provider.Register("requestNotification", args => requestNotification());

            //add any extra methods
            _provider.Register("get_assets", args => getAssets());
            _provider.Register("get_defaultView", args => getDefaultView());



            //versionrequest method

            //notification cancel all request

        }



        private dynamic requestNotification()
        {
            dynamic retVal = new ExpandoObject();
            retVal.echoBack = new EchoBack() { RequestId = 7 };
            retVal.notificationResponse = true;
            return JsonConvert.SerializeObject(retVal);
        }

        //old but keeping, could be useful if js screens make requests of c# server
        private string getConfiguration(JToken paras)
        {
            //get the data information from db to return to a packet
            var retVal = _provider.Intercept<string>("get" + paras, paras);

            Console.WriteLine(retVal);

            return (string)retVal;

        }

        // not sure what to do here
        //router
        private dynamic setConfiguration(JToken paras)
        {
            string method = "set_" + (string)paras[0];
            JToken parameters = paras[1];
            var retVal = _provider.Intercept<dynamic>(method, parameters);

            return retVal;
        }

        // an asset is an svg string.... it could be a map or some sort of icon (so far)...
        // this is call ONLY when an asset has been added (not deleted)...
        // the set map or icon must check for deleted - basically sync up the map/icon with svgs... easiest way
        private dynamic setAsset(JToken paras)
        {
            // set asset defines the SVG table... this is just an upload of the SVG file to be
            // put into the database... via key/valuse(svg string)

            // only one notification per upload so no looping through

            Response res = new Response();
            dynamic retVal = new ExpandoObject();


            string id = (string)paras[0];
            string svg = (string)paras[1];

            // basically SVGs cannot be modified or updated - even their names (as that is a key)
            // SVGs are either deleted or added
            var svgDB = _gdl.UISVGTable.AddUpdate(id, svg);

            //using (CLDBUIHandling uih = new CLDBUIHandling())
            //{
            //    uih.addSVG(svgDB);
            //}

            //response
            res.Data = true;
            retVal.name = id;
            retVal.obj = res;

            return retVal;
        }
        private dynamic setAreas(JToken paras)
        {
            Dictionary<string, object> map = JsonConvert.DeserializeObject<Dictionary<string, object>>(paras.ToString());
            WebArea area;
            Response res = new Response();
            dynamic retVal = new ExpandoObject();

            List<UIAreaRecord> areaList = new List<UIAreaRecord>();


            foreach (JObject kV in map.Values)
            {
                //convert jobj to my class obj
                area = kV.ToObject<WebArea>();

                // build a list of areas
                areaList.Add(new UIAreaRecord(string.Empty, area.Guid, area.Name));

            }

            // call gbl to compare? 
            bool updated = _gdl.UIAreasTable.Load(areaList);

            // an extra check - we want to make sure all areas have a event group associated
            // event groups are empty, but when we write we will fill in with the defaults

            //call db
            //    if (updated)
            {
                var x = _gdl.UIAreasTable.getAllDB();



                //using (CLDBArea dbarea = new CLDBArea())
                //{
                //    dbarea.UpdateArea(x);
                //}
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

            List<UIControllerRecord> controllaList = new List<UIControllerRecord>();

            foreach (JToken kV in map.Values)
            {
                //convert jobj to my class obj
                controller = kV.ToObject<WebController>();

                var record = _gdl.UIControllerTable.getNewRecord(controller.Address);
                record.GUID = controller.Guid;
                record.IsTX1 = controller.isTx;
                record.IsDoor = controller.isDoor;
                record.Description = controller.Name;
                record.UIAreaUIID = controller.AssociatedAreaGuid;
                record.AreaGUID = _gdl.UIAreasTable.getIDbyUIID(record.UIAreaUIID);

                // convert from JSON to dictionary
                record.Receivers = WebController.GetReceiverIds(controller.ReceiverIds);

                controllaList.Add(record);
            }

            // load controllers and their associated receiver IDs
            _gdl.UIControllerTable.Load(controllaList);

            var x = _gdl.UIControllerTable.getAllDB();
            //using (CLDBZoneConfiguration zd = new CLDBZoneConfiguration())
            //{
            //    // modified gat all devices to support a device type... 
            //    var dbcontrollers = zd.getAllDevices(DeviceTypes.toString(DeviceTypes.CONTROLLER));

            //    // we want to find receivers to delete
            //    foreach (var item in dbcontrollers)
            //    {
            //        var shit = x.FirstOrDefault(e => e.ControlModule.Id == item.ControlModule.Id);
            //        if (shit == null)
            //        {
            //            zd.deleteDevice(item);
            //        }
            //    }

            //    // make sure our database ID's get updated in our saved data
            //    _gdl.UIControllerTable.UpdateIDs(zd.addZoneDevices(x));
            //}

            //response
            res.Data = true;
            retVal.name = "controllers";
            retVal.obj = res;

            return retVal;
        }

        // whenever an icon is added or deleted, this gets called - we update the ICON table but we also need to make sure the 
        // SVG table is in-sync
        private dynamic setIcons(JToken paras)
        {
            Dictionary<string, object> map = JsonConvert.DeserializeObject<Dictionary<string, object>>(paras.ToString());
            WebIcon icon;
            Response res = new Response();
            dynamic retVal = new ExpandoObject();

            // we get ALL icons - so we don't need to sort through them in order to update, just reload them
            List<UIIconTypeRecord> iconList = new List<UIIconTypeRecord>();

            foreach (JToken kV in map.Values)
            {
                //convert jobj to my class obj
                icon = kV.ToObject<WebIcon>();

                iconList.Add(new UIIconTypeRecord(icon.Guid, icon.IconSVGId, icon.Name));
            }

            var x = _gdl.UIIconTypeTable.Load(iconList);

            //using (CLDBUIHandling uic = new CLDBUIHandling())
            //{
            //    uic.loadIconTypes(x);
            //}

            syncronizeSVG();

            //response
            res.Data = true;
            retVal.name = "iconTypes";
            retVal.obj = res;

            return retVal;
        }

        // updates the receiver map table - from set map
        private dynamic setMapReceivers(string mapid, JToken paras)
        {
            Dictionary<string, object> map = JsonConvert.DeserializeObject<Dictionary<string, object>>(paras.ToString());
            WebMapRcvr receiver;
            Response res = new Response();
            dynamic retVal = new ExpandoObject();

            List<ReceiverMapRecord> tmpList = new List<ReceiverMapRecord>();

            //  List<UIReceiverRecord> receiverList = new List<UIReceiverRecord>();
            foreach (JToken kV in map.Values)
            {
                //convert jobj to my class obj
                receiver = kV.ToObject<WebMapRcvr>();

                tmpList.Add(new ReceiverMapRecord(mapid, receiver.Guid, receiver.XCenter, receiver.YCenter, receiver.LabelAngle, receiver.LabelRadius));


                //_gdl.ReceiverMapTable.UpdateMapInfo(mapid, receiver.Guid, receiver.XCenter, receiver.YCenter, receiver.LabelAngle, receiver.LabelRadius);

            }

            _gdl.ReceiverMapTable.Load(mapid, tmpList);

            // we need to make sure everything is in-sync with the controllers and maps
            var x = _gdl.ReceiverMapTable.getAllDB(mapid);


            // we need to sync up with the receivers in the database - we could do this at the DB level or here
            // because the database level needs to play games with the zone device views, its just easier
            // to do it here...
            //using (CLDBUIHandling uih = new CLDBUIHandling())
            //{
            //    // make sure our database ID's get updated in our saved data - shouldn't matter as the EF should only use GUIDs
            //    _gdl.ReceiverMapTable.UpdateIDs(uih.loadReceiverMaps(mapid, x));
            //}

            //response
            res.Data = true;
            retVal.name = "receivers";
            retVal.obj = res;

            return retVal;
        }

        private dynamic setReceivers(JToken paras)
        {
            Dictionary<string, object> map = JsonConvert.DeserializeObject<Dictionary<string, object>>(paras.ToString());
            WebReceiver receiver;
            Response res = new Response();
            dynamic retVal = new ExpandoObject();

            List<UIReceiverRecord> receiverList = new List<UIReceiverRecord>();
            foreach (JToken kV in map.Values)
            {
                //convert jobj to my class obj
                receiver = kV.ToObject<WebReceiver>();

                //make record, make a List of them
                var record = _gdl.UIReceiverTable.getNewRecord(receiver.ControllerGuid, receiver.Channel);
                record.Id = receiver.Guid;
                record.ChannelAddress = receiver.Channel;
                record.Description = receiver.Description; //or description
                record.ControllerGUID = receiver.ControllerGuid;
                record.UINumber = receiver.Number;
                record.IconID = receiver.IconTypeGuid;

                receiverList.Add(record);
            }


            // we need to make sure everything is in-sync with the controllers and maps
            //_gdl.LoadReceivers(receiverList);
            _gdl.UIReceiverTable.Load(receiverList);
            var x = _gdl.UIReceiverTable.getAllDB();


            // we need to sync up with the receivers in the database - we could do this at the DB level or here
            // because the database level needs to play games with the zone device views, its just easier
            // to do it here...
            //using (CLDBZoneConfiguration zd = new CLDBZoneConfiguration())
            //{
            //    // modified gat all devices to support a device type... 
            //    var dbreceivers = zd.getAllDevices(DeviceTypes.toString(DeviceTypes.RECEIVER));

            //    // we want to find receivers to delete - 
            //    foreach (var item in dbreceivers)
            //    {
            //        var shit = x.FirstOrDefault(e => e.Receiver.Id == item.Receiver.Id);
            //        if (shit == null)
            //        {
            //            zd.deleteDevice(item);
            //        }
            //    }

            //    // make sure our database ID's get updated in our saved data - shouldn't matter as the EF should only use GUIDs
            //    _gdl.UIReceiverTable.UpdateIDs(zd.addZoneDevices(x));
            //}

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
            List<UIViewRecord> viewList = new List<UIViewRecord>();

            Response res = new Response();
            dynamic retVal = new ExpandoObject();

            foreach (JObject kV in map.Values)
            {
                try
                {
                    //convert jobj to my class obj
                    view = kV.ToObject<WebView>();
                    viewList.Add(new UIViewRecord(view.Guid, view.Label, view.MapGuid, view.Scale, view.XOffset, view.YOffset, (long)view.Rotation));
                }
                catch (Exception ex)
                {
                    //Logger.Error(ex);
                }
            }
            // this gives us a full list of views... 
            // so what we do is just blow away previous list and reload this list... 
            // but it will return whether we have made any changes
            var dbviews = _gdl.UIViewTable.Load(viewList);

            // udpate database - its not like this is continuously done - only on setup, so don't worry about the extra db hits
            //using (CLDBUIHandling uih = new CLDBUIHandling())
            //{
            //    uih.loadViews(dbviews);
            //}

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

            List<UIMapRecord> mapList = new List<UIMapRecord>();
            foreach (JToken kV in dictionary.Values)
            {
                //convert jobj to my class obj
                map = kV.ToObject<WebMap>();

                // find a matchig area ID
                string matchingareaid = _gdl.UIAreasTable.findMapMatch(map.MapName);

                mapList.Add(new UIMapRecord(map.Guid, map.MapName, matchingareaid, map.ImageGuid, (long)map.FontSize, (long)map.IconSize));

                // we now have to update the receiver table... this is done because we get a 'setmaps' on a place command...
                setMapReceivers(map.Guid, JsonConvert.DeserializeObject<JToken>(JsonConvert.SerializeObject(map.Receivers)));

            }

            // get list of existing map IDs
            List<string> oldMapIDs = _gdl.UIMapTable.getAllIds();


            // need to worry about deleting a map... if we delete it, then we have to remove all controller associations... ? 
            // or maybe I just delete them on the load of receivers...
            var x = _gdl.UIMapTable.Load(mapList);

            List<string> newMapIDs = _gdl.UIMapTable.getAllIds();

            var toDelete = oldMapIDs.Except(newMapIDs).ToList();


            //using (CLDBUIHandling uic = new CLDBUIHandling())
            //{
            //    // first get rid of any deleted 
            //    foreach (var item in toDelete)
            //    {
            //        uic.deleteMap(item);
            //    }

            //    // i am worried about setting all the maps in one transaction as they can be large, so take a few extra ms and do them one at a time
            //    // wcf has size limits - in future when we go to grpc (if there isn't anything better by then)... we will know better
            //    foreach (var item in x)
            //    {
            //        uic.addMap(item);
            //    }
            //}

            // syncronize maps, icons with svg
            syncronizeSVG();        // gets rid of any 'leftover' svg files
            syncronizeViews();      // gets rid of any associated views
            syncronizeReceiverMaps();  // gets rid of any associated receiver maps


            //response
            res.Data = true;
            retVal.name = "maps";
            retVal.obj = res;

            return retVal;
        }
        private void syncronizeSVG()
        {
            try
            {
                // get a list of SVG Id's from both the ICON and MAP tables
                List<string> iconSVGIDs = _gdl.UIIconTypeTable.getSVGIDs();
                List<string> mapSVGIDs = _gdl.UIMapTable.getSVGIDs();

                List<string> merged = iconSVGIDs.Union(mapSVGIDs).ToList();


                // now the list of SVG IDs
                List<string> SVGIDs = _gdl.UISVGTable.getSVGIDs();


                // find SVG
                var x = SVGIDs.Except(merged).ToList();

                if (x.Count > 0)
                {
                    //using (var ui = new CLDBUIHandling())
                    //{
                    //    // delete the elements
                    //    foreach (var item in x)
                    //    {
                    //        ui.deleteSVG(item);

                    //    }
                    //}
                }



                // merge the two lists

            }
            catch (Exception ex)
            {
               // Logger.Error(ex);
            }
        }
        private void syncronizeReceiverMaps()
        {
            try
            {
                // get a list of SVG Id's from both the ICON and MAP tables
                List<string> mapIDs = _gdl.UIMapTable.getAllIds();

                List<string> receiverMapIDs = _gdl.ReceiverMapTable.getAllMapIds();

                List<string> deleteList = new List<string>();

                foreach (var item in receiverMapIDs)
                {
                    if (!mapIDs.Contains(item))
                    {
                        deleteList.Add(item);
                    }
                }

                if (deleteList.Count > 0)
                {
                    //using (var ui = new CLDBUIHandling())
                    //{
                    //    // delete the elements
                    //    foreach (var item in deleteList)
                    //    {
                    //        ui.deleteReceiverMap(item);
                    //    }
                    //}
                }



                // merge the two lists

            }
            catch (Exception ex)
            {
               // Logger.Error(ex);
            }
        }

        private void syncronizeViews()
        {
            try
            {
                // get a list of SVG Id's from both the ICON and MAP tables
                List<string> mapIDs = _gdl.UIMapTable.getAllIds();

                List<string> viewMapIDs = _gdl.UIViewTable.getAllMapIds();

                List<string> deleteList = new List<string>();

                foreach (var item in viewMapIDs)
                {
                    if (!mapIDs.Contains(item))
                    {
                        deleteList.Add(item);
                    }
                }


                if (deleteList.Count > 0)
                {
                    //using (var ui = new CLDBUIHandling())
                    //{
                    //    // delete the elements
                    //    foreach (var item in deleteList)
                    //    {
                    //        ui.deleteView(item);

                    //    }
                    //}
                }

                // merge the two lists

            }
            catch (Exception ex)
            {
                //Logger.Error(ex);
            }
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

        // probably not going to use this - this is original where the brainiacs thought they could assign 
        // views to workstations - 
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

            }

            // response
            res.Data = true;
            retVal.name = "views";
            retVal.obj = res;

            return retVal;
        }

        private List<WebAssets> getAssets()
        {
            var retVal = new List<WebAssets>();

            var assets = _gdl.UISVGTable.getAll();
            foreach (var ass in assets)
            {
                retVal.Add(new WebAssets() { Id = ass.Id, SVG = ass.SVGString });
            }

            return retVal;
        }
        private List<WebArea> getAreas()
        {
            List<WebArea> retVal = new List<WebArea>();
            var areashit = _gdl.UIAreasTable.getAll();
            foreach (var item in areashit)
            {
                retVal.Add(new WebArea { Guid = item.AreaRecord.AreaUIID, Name = item.AreaRecord.AreaName });
            }
            return retVal;
        }
        private List<WebController> getControllers()
        {
            List<WebController> retVal = new List<WebController>();

            var controllerList = _gdl.UIControllerTable.getAll();
            {
                foreach (var item in controllerList)
                {
                    // turn the receiver list into a json object
                    var rcvrList = WebController.AddReceiverIds(item.Receivers);

                    // hopefully the receiver list matches
                    retVal.Add(new WebController()
                    {
                        Address = item.ControllerAddress,
                        isDoor = item.IsDoor,
                        Guid = item.GUID,
                        AssociatedAreaGuid = item.UIAreaUIID,
                        isTx = item.IsTX1,
                        Name = item.Description,
                        ReceiverIds = rcvrList
                    });
                }
            }

            return retVal;
        }
        private List<WebReceiver> getReceivers()
        {
            List<WebReceiver> retVal = new List<WebReceiver>();

            var x = _gdl.UIReceiverTable.getAll();

            // create an array of receiver elements to give to screen
            foreach (var item in x)
            {
                // the ui shits itself if a receiver is not pointing to a valid controller
                if (_gdl.UIControllerTable.FindByUIControllerID(item.ControllerGUID))
                {
                    retVal.Add(new WebReceiver()
                    {
                        Channel = item.ChannelAddress,
                        ControllerGuid = item.ControllerGUID,
                        Description = item.Description,
                        Guid = item.Id,
                        IconTypeGuid = item.IconID,
                        Number = item.UINumber
                    });
                }
            }

            return retVal;
        }
        private List<WebClientView> getClientViews()
        {
            List<WebClientView> retVal = new List<WebClientView>();

            WebClientView clientViews = new WebClientView();

            var viewList = _gdl.UIViewTable.getAll();
            clientViews.Guid = "01838714-91c8-46de-ac80-ef82781d06eb"; //default clientview guid
            clientViews.Name = "Default";
            var temp = new List<string>();
            foreach (var item in viewList)
            {
                if (clientViews.Guid == "01838714-91c8-46de-ac80-ef82781d06eb")
                {
                    clientViews.Guid = item.Id;
                }
                if (clientViews.Name == "Default")
                {
                    clientViews.Name = item.Label;
                }
                temp.Add(item.Id);
            }

            clientViews.Views = temp.ToArray();
            retVal.Add(clientViews);


            return retVal;
        }
        private List<WebMap> getMaps()
        {
            List<WebMap> retVal = new List<WebMap>();

            var x = _gdl.UIMapTable.getAll();

            // fore each MAP
            foreach (var item in x)
            {
                //wrap rcvrs in a map
                Dictionary<string, object> rcvrMap = new Dictionary<string, object>();

                // get associated reciever map information
                var rmaps = _gdl.ReceiverMapTable.get(item.Id);

                // build the receiver mapping
                foreach (var rcvr in rmaps)
                {
                    JObject job = new JObject();
                    WebMapRcvr mRcvr = new WebMapRcvr();
                    mRcvr.Guid = rcvr.ReceiverID;
                    mRcvr.XCenter = rcvr.XCenter; // 200;
                    mRcvr.YCenter = rcvr.YCenter; // 141;
                    mRcvr.LabelAngle = rcvr.LabelAngel; // 60;
                    mRcvr.LabelRadius = rcvr.LabelRadius; // .7;

                    // possibly validate receivers against the map ID - maybe check at read?
                    job = JsonConvert.DeserializeObject<JObject>(JsonConvert.SerializeObject(mRcvr));
                    rcvrMap.Add(mRcvr.Guid, job);
                }

                retVal.Add(new WebMap()
                {
                    FontSize = item.FontSize,
                    Guid = item.Id,
                    IconSize = item.IconSize,
                    ImageGuid = item.SVGID,
                    MapName = item.Name,
                    Receivers = rcvrMap
                });
            }

            return retVal;
        }
        private List<WebIcon> getIcons()
        {
            List<WebIcon> retVal = new List<WebIcon>();

            var x = _gdl.UIIconTypeTable.getAll();
            foreach (var item in x)
            {
                retVal.Add(new WebIcon()
                {
                    Guid = item.IconID,
                    IconSVGId = item.IconSVG,

                    Name = item.Description
                });
            }

            return retVal;
        }
        private List<WebView> getViews()
        {
            List<WebView> retVal = new List<WebView>();

            WebView view = new WebView();
            var x = _gdl.UIViewTable.getAll();
            foreach (var item in x)
            {
                retVal.Add(new WebView()
                {
                    Guid = item.Id,
                    Label = item.Label,
                    MapGuid = item.MapID,
                    Rotation = item.Rotation,
                    Scale = item.Scale,
                    XOffset = item.XOffset,
                    YOffset = item.YOffset
                });
            }

            return retVal;
        }
        private WebSetup getSetup()
        {
            //ask database for 

            WebSetup setup = new WebSetup();
            setup.FacilityName = _gdl.UIMiscTable.getSystemName();


            return setup;
        }
        private double getTopology()
        {

            double topologyTimestamp = _gdl.UIMiscTable.getTS();

            return topologyTimestamp;
        }
        private string getDefaultView()
        {
            //ask db 

            //fake
            var defaultView = "fakeView"; //Guid.NewGuid().ToString();
                                          // for now just 

            // first we want to read the default view of the system by reading
            // 1 - local save view file
            //
            // if not found, just take the first view fromt the views 
            WebView view = new WebView();
            var x = _gdl.UIViewTable.getAll();
            if (x.Count > 0)
            {
                defaultView = x.Last().Id;
            }


            //return a view guid to show from the views table
            return defaultView;
        }
    }
}

