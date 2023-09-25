export { MessageHandler }

class MessageHandler {
    constructor() {

    }
    handleAreas(areaList) {
        for (const area of areaList) {
            console.log("WE in area handler", area)
        }
    }
    handleControllers(controllerList) {
        for (const controller of controllerList) {
            console.log("WE in controller handler", controller)
        }
    }
    handleViews(viewList) {
        for (const view of viewList) {
            console.log("WE in view handler", view)
        }
    }
    handleMaps(mapList) {
        for (const map of mapsList) {
            console.log("WE in map handler", map)
        }
    }
    handleMonikers(monikerList) {
        for (const moniker of monikerList) {
            console.log("WE in moniker handler", moniker)
        }
    }
    handleReceiverViews(rvList) {
        for (const rv of rvList) {
            console.log("WE in rcvrView handler", rv)
        }
    }
    handleIcons(iconList) {
        for (const icon of iconList) {
            console.log("WE in icon handler", icon)
        }
    }
     handleSettings(settingsList) {
        for (const setting of settingsList) {
            console.log("WE in setting handler", area)
        }
    }   
    //handle<newHandler>(areaList) {
    //    for (const area of areaList) {
    //        console.log("WE in area hangler yo", area)
    //    }
    //}   

}