"use strict"
export { PatientGrid }

class PatientGrid {
    //-------------------------------------------------------------------------
    // Input:
    //   address - WebSocket server for which to connect.
    //   port - Port on server.
    //   onOpenCallback - Callback to run once connection is established.
    //   onErrorCallback - Callback should there be an error.
    //   onCloseCallback - Callback if connection is closed.
    //   onPacketErrorCallback - Callback for any packet errors.
    //-------------------------------------------------------------------------
    
    constructor() {//leftPanel,rightPanel, mapPanel) {
        //this._alarmPanel = leftPanel
        //this._patientPanel = rightPanel

        //w2alert('system', 'el title')
        //w2confirm('enter oblivian')
        //    .yes(() => w2alert('yes'))
        //    .no(() => w2alert('no'))

        this.date = new Date()
        this._patientGrid = this._makePatientGrid()
        var obj = {tag: 100, name: 'wyatt', room: 5 }
        
       /// this.addRecord(obj)
        
        //$('#map').click(() => ($('#rightPanel').css('display', 'none')))
       
     
    }

    addRecord(patient)
    {
        //getmonth returns 0-11
        const [day, month , year] = [this.date.getDate(), this.date.getMonth() + 1, this.date.getFullYear()]
        
        console.log("add",this)
        var numRecs = this._patientGrid.records.length;
        //this._patientGrid.add({ recid: numRecs + 1, tag: '100', name: 'YG', room: '5', sdate: `${month}/${day}/${year}` });
        this._patientGrid.add({ recid: numRecs + 1, tag: patient.tag, name: patient.name, room: patient.room, sdate: `${month}/${day}/${year}` });
    }

    removeRecords(id)
    {

        //w2ui.grid.clear()
        //w2ui.grid.records = [
        //    { recid: 1, tag: 'Jane', name: 'Doe', room: 'jdoe@gmail.com', sdate: '4/3/2012' },
        //    { recid: 2, tag: 'Stuart', name: 'Motzart', room: 'jdoe@gmail.com', sdate: '4/3/2012' }
        //];

    }           
    _makePatientGrid() {                
        const grid = $('#activePatients').w2grid({
            name: 'activePatientsGrid',
            fixedBody: false,
            columns: [
                //{ field: 'recid', text: 'ID', size: '50px', sortable: true },
                { field: 'tag', text: 'Tag#', size: '33%', sortable: true },
                { field: 'name', text: 'Name', size: '33%', sortable: true },
                { field: 'room', text: 'Room#', size: '33%', sortable: true },
                //{ field: 'sdate', text: 'Date', size: '30%', sortable: true},
                //{ field: 'edate', text: 'End Date', size: '120px' }
            ],
            records: [
                { recid: 1, tag: 1, name: 'doe', room: 100 },
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
                //{ recid: 30, tag: 30, name: 'Gatos', room: 0 }
            ],
            //style: 'overflow: auto'

            });
                    
        //console.log(w2ui['grid'].records.length, 'Numrecs')
        //w2ui['activePatientsGrid'].sort('tag', 'asc');
        //w2ui['grid'].select(2, 5, 6);
        
        //console.log(w2ui['activePatientsGrid'].fixedBody, '1')
        //w2ui['grid'].fixedBody = false

        //w2ui['activePatientsGrid'].remove(w2ui['activePatientsGrid'].find({ tag: 'poop' }))
        //w2ui['grid'].remove(2, 5, 6);

       // grid.search('fname', 'm');
        // or
       // grid.search('all', 'm');
        // or
       // grid.search([{ field: 'date', value: ['1/1/2012', '1/10/2012'], operator: 'between' }], 'OR');
     
       // var recs = w2ui['grid'].find({ email: 'jdoe@gmail.com' });
        //console.log(recs);

        //show html elements
        $('#rightPanel').css('display', 'block')
        //$('#leftPanel').css('display', 'block')

        return grid;
    }


    setTimer() {
    //var millisecondsToWait = 5000;
    //setTimeout(function () {
    //    // Whatever you want to do after the wait
    //}, millisecondsToWait);
    }


}