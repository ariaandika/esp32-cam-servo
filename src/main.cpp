// if this not included manually, WiFiManager library choked
#include "WiFi.h"
#include "Update.h"
#include "WebServer.h"
#include "DNSServer.h"

#include "Arduino.h"
// #include "Hello.cpp"
#include "LibWiFi.cpp"
#include "EspCam.cpp"
// #include "Example.cpp"

void setup() {
    delay(800);

    Serial.begin(9600);
    Serial.println("Init");

    // hello_setup();
    wifi_setup();

    espcam_setup();
    // example_setup();
}

void loop() {
    Serial.println("loop");

    // hello_loop();
    camera_capture();

    // example_loop();
    delay(2000);
}

