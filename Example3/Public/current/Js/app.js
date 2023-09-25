"use strict"
import { Websocket } from './CommConnection/Websocket.js';
import { PatientGrid } from './PatientGrid.js';

//jquery and w2ui libraries already imported to html so can access without import statement
class App
{
    constructor()
    {
        this._webSocket = new Websocket()
        $("#loadingDiv").fadeOut(1000)
        this._patients = new PatientGrid()
       
    }    
}
const app = new App()
//self.app = app
//console.log(self)
