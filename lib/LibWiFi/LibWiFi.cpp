#include "Arduino.h"
#include "WiFiManager.h"

void wifi_setup() {
    WiFiManager wifiManager;
    wifiManager.autoConnect("FOO", "BARBARBAR");
}
