definition(
    name: "Simple Lights",
    namespace: "com.parrotha",
    author: "Parrot HA",
    description: "Turn on and off lights at certain times",
    category: "",
    iconUrl: "",
    iconX2Url: "")

preferences{
    page(name: "mainPage", install: true, uninstall: true) {
        section("Select switches") {
            input "switches", "capability.switch", title: "Select switch", multiple: true
        }
        section("Configure On/Off") {
            input "onSunsetOffset", "number", title: "Number of minutes before or after sunset to turn on"
            input "offTime", "time", title: "Time to turn off"
        }
    }
}

def installed() {
    log.debug "Installed"
    initialize()
}

def updated() {
    log.debug "Updated"
    log.debug "offTime ${offTime}"
    log.debug "onSunsetOffset ${onSunsetOffset}"
    unsubscribe()
    unschedule()
    initialize()
}

def initialize() {
    log.debug "initialize"
    schedule(toDateTime(offTime), turnOffLights)
    schedule("1 0 0 * * ?", "scheduleOn")
    scheduleOn()
}

def scheduleOn() {
    String offset = "00:00"

    //TODO: handle values greater than 60
    if(onSunsetOffset != null && onSunsetOffset < 60) {
        if (onSunsetOffset < 0) {
            offset = "-00:${onSunsetOffset * -1}"
        } else if (onSunsetOffset > 0) {
            offset = "00:${onSunsetOffset}"
        }
    }

    Date sunset = getSunriseAndSunset(sunsetOffset: offset)["sunset"]
    log.debug "adjusted sunset: $sunset"
    schedule(sunset, "turnOnLights")
}

def turnOffLights() {
    log.warn "turning off lights"
    switches.off()
}

def turnOnLights() {
    log.warn "turning on lights"
    switches.on()
}
