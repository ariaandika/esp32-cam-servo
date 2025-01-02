#include "WiFiManager.h"
#include "Config.cpp"

void wifi_setup() {
    WiFiManager wifiManager;
    wifiManager.autoConnect(WIFI_AP_NAME, WIFI_AP_PASS);
}
