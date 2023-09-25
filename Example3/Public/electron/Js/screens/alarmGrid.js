"use strict"

define(
    [
        'vendor/w2ui',
        'vendor/jquery-ui'
    ],
    function
        (
            w2ui,
    ) {
        return class AlarmGrid {
            //-------------------------------------------------------------------------
            // Input:
            //   address - WebSocket server for which to connect.
            //   port - Port on server.
            //   onOpenCallback - Callback to run once connection is established.
            //   onErrorCallback - Callback should there be an error.
            //   onCloseCallback - Callback if connection is closed.
            //   onPacketErrorCallback - Callback for any packet errors.
            //-------------------------------------------------------------------------

            constructor(webSocketAPI) {
                const self = this

                this.webSocketAPI = webSocketAPI

                this._patientGrid = this._makePatientGrid()
                //this.checkeredStyle()
            }

            addRecords(alarms) {
                //if (patients.length > 0) {
                //    $('#activePatients').css('display', 'block')
                //    $('#patientPicture').css('display', 'block')
                //}
                //else {
                //    $('#activePatients').css('display', 'none')
                //}
                //getmonth returns 0-11
                //const [day, month, year] = [this.date.getDate(), this.date.getMonth() + 1, this.date.getFullYear()]
                this.removeRecords()
                alarms = this.checkeredStyle(alarms)
                //this.scrollableGrid()
                for (const alarm of alarms) {
                    // console.log (patient)
                    if (this._patientGrid.records.length > 4) {
                        this._patientGrid.fixedBody = true
                    }
                    this._patientGrid.add({ recid: alarms.indexOf(alarm)+1, action: alarm.action, event: alarm.event, time: alarm.time, name: alarm.name, tag: alarm.tag, w2ui: alarm.w2ui }); //sdate: `${patient.month}/${patient.day}/${patient.year}` });
                }

            }
            //scrollableGrid() {
            //    if (this._patientGrid.records.length > 5)
            //        this._patientGrid.fixedBody = true
            //    else
            //        this._patientGrid.fixedbody = false
                
            //}
            checkeredStyle(records) {
                for (const rec of records) {
                    const n = records.indexOf(rec)
                    if (n === 0 || !!(n && !(n % 2))) {
                        rec.w2ui = { style: "background-color: #C2F5B4" }
                    }
                }
                return records
            }
            
            removeRecords() {
                this._patientGrid.clear()
                this._patientGrid.refresh()
                //w2ui['activePatientsGrid'].remove(w2ui['activePatientsGrid'].find({ tag: '10' }))
                //this._patientGrid.remove( patient.recid );
            }

            findRecord(recid) {
                return this._patientGrid.get(recid);
            }

            addEvents() {
                const self = this
                var recs = this._patientGrid.records;
                for (const rec of recs) {
                    var timeoutId = 0;
                    $(`#grid_AGrid_rec_${recs.indexOf(rec) + 1}`).bind('mousedown', function () {
                        timeoutId = setTimeout(self.clickHold, 1000); //i think 2 sec hold
                    }).bind('mouseup mouseleave', function () {
                        clearTimeout(timeoutId);
                    });
                }
            }

            clickHold() {
                const self = this
                //websocket
                console.log("poop")
            }

            _makePatientGrid() {
                const self = this;
                const grid = $('#alarmGrid').w2grid({
                    name: 'AGrid',
                    fixedBody: false,
                    columns: [
                        //{ field: 'recid', text: 'ID', size: '50px', sortable: true },

                        { field: 'event', text: 'Event', size: '20%', sortable: false },
                        { field: 'name', text: 'Name', size: '20%', sortable: false },
                        { field: 'tag', text: 'Tag', size: '20%', sortable: false },
                        { field: 'action', text: 'Action', size: '20%', sortable: false },
                        { field: 'time', text: 'Event Time', size: '20%', sortable: false },
                        //{ field: 'sdate', text: 'Date', size: '30%', sortable: true},
                        //{ field: 'edate', text: 'End Date', size: '120px' }
                    ],
                    records: [
                        { recid: 1, tag: 1, name: 'doe', event: 100, action: 100, time: 1111,   },
                        { recid: 2, tag: 2, name: 'Motzart', event: 200, action: 100, time: 1111, },//w2ui: { style: "background-color: #C2F5B4" } },
                        { recid: 3, tag: 3, name: '-----', event: 300, action: 100, time: 1111,  },
                    { recid: 4, tag: 4, name: 'Ottie', event: 300, action: 100, time: 1111, },//w2ui: { style: "background-color: #C2F5B4" } },
                        { recid: 5, tag: 5, name: 'Ottie', event: 300, action: 100, time: 1111,  },
                     
                        //{ recid: 31, tag: 31, name: 'Silver2', room: 2080 },
                    ],
                    onSelect: function (event) {
                       // event.preventDefault()
                        //console.log(event)
                    },
                    //style: 'overflow: auto',
                    onClick: function (event) {
                        //get record
                        //ask for patient pic
                        //display it
                      //  event.preventDefault()
                        //console.log(event)

                    },
                    //onDblClick: function (event) {
                    //    const rec = self._patientGrid.get(event.recid)

                    //    self.webSocketAPI.sendNotification
                    //        (
                    //            "notification",
                    //            {
                    //                parameters:
                    //                {
                    //                    notification: "alarms",
                    //                    recid: event.recid,
                    //                },
                    //            }

                    //        )
                    //},
                });
                //grid.sort('tag', 'asc');
                //w2ui['grid'].select(2, 5, 6);
               // $('#alarmGrid').css('display', 'block')
                //for (var rec of grid.records) {
                //    const n = grid.records.indexOf(rec)
                //    if (n === 0 || !!(n && !(n % 2))) {
                //        rec.w2ui = { style: "background-color: #C2F5B4" }
                //    }
                //}
                //grid.refresh()
                return grid;
            }
          

      
            //resizeList() {
            //    const numRecs = this._patientGrid.records.length;
            //    $("#activePatients").css("max-height", "508px")
            //    if (numRecs >= this.MAX_RECS_PIC) {
            //        this._patientGrid.fixedBody = true;
            //    }

            //    //if (maxHeight == this.MAX_RECS_NONE) {
            //    //    $("#activePatients").css("max-height", "628px")
            //    //    if (numRecs >= this.MAX_RECS_NONE) {
            //    //        this._patientGrid.fixedBody = true;
            //    //    }
            //    //}

            //    this._patientGrid.refresh()

            //    //setTimer() {
            //    //var millisecondsToWait = 5000;
            //    //setTimeout(function () {
            //    //    // Whatever you want to do after the wait
            //    //}, millisecondsToWait);
            //    //}
            //}
        }
})