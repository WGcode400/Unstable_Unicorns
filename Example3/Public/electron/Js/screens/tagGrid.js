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
        return class TagGrid {
            //-------------------------------------------------------------------------
            // Input:
            //   address - WebSocket server for which to connect.
            //   port - Port on server.
            //   onOpenCallback - Callback to run once connection is established.
            //   onErrorCallback - Callback should there be an error.
            //   onCloseCallback - Callback if connection is closed.
            //   onPacketErrorCallback - Callback for any packet errors.
            //-------------------------------------------------------------------------

            constructor(webSocketAPI, tags) {


                this.webSocketAPI = webSocketAPI

                this._patientGrid = this._makePatientGrid()
                this.addRecords(tags)

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
                alarms = this.addAlarmStyle(alarms)
                for (const alarm of alarms) {
                    // console.log (patient)
                    var numRecs = this._patientGrid.records.length;
                    this._patientGrid.add({ recid: numRecs + 1, tag: alarm.tag, w2ui: alarm.w2ui }); //sdate: `${patient.month}/${patient.day}/${patient.year}` });
                }
                //this._patientGrid.refresh()
            }

            addAlarmStyle(alarms) {
                for (const alarm of alarms) {
                    if (alarm.alarming) {
                        alarm.w2ui = {
                            style: "background-color: rgba( 255, 0, 0, 0.25 )"
                        }
                    }
                }
                return alarms
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
      

            _makePatientGrid() {
                const self = this;
                $().w2destroy("tGrid")
                const grid = $('#tagGrid').w2grid({
                    name: 'tGrid',
                    fixedBody: false,
                    columns: [
                        //{ field: 'recid', text: 'ID', size: '50px', sortable: true },
                        { field: 'tag', text: 'Tag', size: '30%', sortable: true },
                        //{ field: 'lname', text: 'Last Name', size: '30%', sortable: true },
                        //{ field: 'email', text: 'Email', size: '40%' },
                        //{ field: 'sdate', text: 'Start Date', size: '120px' }
                    ],
                    records: [
                        //{ recid: 1, tag: 22, w2ui: { style: "background-color: red" } }
                    ]
                });
                //grid.sort('tag', 'asc');
                //w2ui['grid'].select(2, 5, 6);
                // $('#alarmGrid').css('display', 'block')
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