"use strict"

define(
[
    'vendor/w2ui',
    'vendor/jquery-ui'
],
function
(
    w2ui,
)
{
    return class ViewPicker {
        //-------------------------------------------------------------------------
        // Input:
        //   address - WebSocket server for which to connect.
        //   port - Port on server.
        //   onOpenCallback - Callback to run once connection is established.
        //   onErrorCallback - Callback should there be an error.
        //   onCloseCallback - Callback if connection is closed.
        //   onPacketErrorCallback - Callback for any packet errors.
        //-------------------------------------------------------------------------

        constructor() {
            const self = this;
        }

        addRecord(patient) {
            //getmonth returns 0-11
            //const [day, month, year] = [this.date.getDate(), this.date.getMonth() + 1, this.date.getFullYear()]

            const numRecs = this._patientGrid.records.length;

           // this.dynamicTagList()

            //this._patientGrid.add({ recid: numRecs + 1, tag: patient.tag, name: patient.name, room: patient.room, sdate: `${month}/${day}/${year}` });
        }

        removeRecord(patient) {
            //w2ui.grid.clear()
            //w2ui.grid.records = [
            //    { recid: 1, tag: 'Jane', name: 'Doe', room: 'jdoe@gmail.com', sdate: '4/3/2012' },
            //    { recid: 2, tag: 'Stuart', name: 'Motzart', room: 'jdoe@gmail.com', sdate: '4/3/2012' }
            //];

            //w2ui['activePatientsGrid'].remove(w2ui['activePatientsGrid'].find({ tag: '10' }))
            this._patientGrid.remove(patient.recid);
          //  this.dynamicTagList();
        }

        _makeViewPickerGrid() {
            const grid = $('#tagGrid').w2grid({
                name: 'ATGrid',
                fixedBody: true,
                columns: [
                    //{ field: 'recid', text: 'ID', size: '50px', sortable: true },
                    { field: 'tag', text: "Tag# show", size: '33%', sortable: true },
                    { field: 'name', text: 'Name show', size: '33%', sortable: true },
                    { field: 'room', text: 'Room# show', size: '33%', sortable: true }
                    //{ field: 'sdate', text: 'Date', size: '30%', sortable: true},
                    //{ field: 'edate', text: 'End Date', size: '120px' }
                ],
                records: [
                    //{ recid: 1, tag: 1, name: 'doe', room: 100 },
                    //{ recid: 2, tag: 2, name: 'Motzart', room: 200 },
                    //{ recid: 3, tag: 3, name: 'Franson', room: '--' },
                    //{ recid: 4, tag: 4, name: 'Ottie', room: 300 },
                    //{ recid: 5, tag: 5, name: 'Silver', room: 400 },
                    //{ recid: 6, tag: 6, name: 'Gatos', room: 500 },
                    //{ recid: 7, tag: 7, name: 'doe', room: 600 },
                    //{ recid: 8, tag: 8, name: 'Motzart', room: 700 },
                    //{ recid: 9, tag: 9, name: 'Franson', room: '--' },
                    //{ recid: 10, tag: 10, name: 'Ottie', room: 800 },
                    //{ recid: 11, tag: 11, name: 'Silver', room: 900 },
                    //{ recid: 12, tag: 12, name: 'Gatos', room: 901 },
                    //{ recid: 13, tag: 13, name: 'doe', room: 76 },
                    //{ recid: 14, tag: 14, name: 'Motzart', room: 1 },
                    //{ recid: 15, tag: 15, name: 'Franson', room: '--' },
                    //{ recid: 16, tag: 16, name: 'Ottie', room: 1000 },
                    //{ recid: 17, tag: 17, name: 'Silver', room: 6000 },
                    //{ recid: 18, tag: 18, name: 'Gatos', room: 1200 },
                    //{ recid: 19, tag: 19, name: 'doe', room: 1300 },
                    //{ recid: 20, tag: 20, name: 'Motzart', room: 1400 },
                    //{ recid: 21, tag: 21, name: 'Franson', room: '--' },
                    //{ recid: 22, tag: 22, name: 'Ottie', room: 1500 },
                    //{ recid: 23, tag: 23, name: 'Silver', room: 1600 },
                    //{ recid: 24, tag: 24, name: 'Gatos', room: 1700 },
                    //{ recid: 25, tag: 25, name: 'doe', room: 1800 },
                    //{ recid: 26, tag: 26, name: 'Motzart', room: 1900 },
                    //{ recid: 27, tag: 27, name: 'Franson', room: '--' },
                    //{ recid: 28, tag: 28, name: 'Ottie', room: 1100 },
                    //{ recid: 29, tag: 29, name: 'Silver', room: 2000 },                    
                    //{ recid: 30, tag: 30, name: 'Gatos', room: 0 },
                    //{ recid: 31, tag: 31, name: 'Silver2', room: 2080 },
                ],
                //style: 'overflow: auto'

            });

            grid.sort('tag', 'asc');
            //w2ui['grid'].select(2, 5, 6);

            return grid;
        }

    }
})