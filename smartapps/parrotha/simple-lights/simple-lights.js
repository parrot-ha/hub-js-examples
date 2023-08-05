definition({
    name: "Simple Lights",
    namespace: "com.parrotha",
    author: "Parrot HA",
    description: "Turn on and off lights at certain times",
    category: "",
    iconUrl: "",
    iconX2Url: ""})

preferences(() => {
    page({name: "mainPage", install: true, uninstall: true}, () => {
        section({title:"Select switches"}, () => {
            input({name: "switches", type: "capability.switch", title: "Select switch", multiple: true});
        });
        section({title: "Configure On/Off"}, () => {
            input({name: "onSunsetOffset", type:"number", title: "Number of minutes before or after sunset to turn on"});
            input({name: "offTime", type:"time", title: "Time to turn off"});
        });
    });
});

function installed() {
    log.debug("Installed")
    initialize()
}

function updated() {
    log.debug("Updated")
    log.debug("offTime ${offTime}")
    log.debug("onSunsetOffset ${onSunsetOffset}")
    unsubscribe()
    unschedule()
    initialize()
}

function initialize() {
    log.debug("initialize")
    schedule(toDateTime(offTime), turnOffLights)
    schedule("1 0 0 * * ?", "scheduleOn")
    scheduleOn()
}

function scheduleOn() {
    let offset = "00:00"

    //TODO: handle values greater than 60
    if(onSunsetOffset != null && onSunsetOffset < 60) {
        if (onSunsetOffset < 0) {
            offset = "-00:${onSunsetOffset * -1}"
        } else if (onSunsetOffset > 0) {
            offset = "00:${onSunsetOffset}"
        }
    }

    let sunset = getSunriseAndSunset({sunsetOffset: offset})["sunset"]
    log.debug("adjusted sunset: $sunset")
    schedule(sunset, "turnOnLights")
}

function turnOffLights() {
    log.warn("turning off lights")
    switches.off()
}

function turnOnLights() {
    log.warn("turning on lights")
    switches.on()
}
