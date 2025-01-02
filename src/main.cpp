// if this not included manually, WiFiManager library choked
#include "WiFi.h"
#include "Update.h"
#include "WebServer.h"
#include "DNSServer.h"

#include "Arduino.h"

#include "WiFiIo.cpp"
#include "ButtonIo.cpp"
#include "ServoIo.cpp"
#include "CameraIo.cpp"
#include "HttpIo.cpp"

void setup() {
    Serial.begin(9600);
    Serial.println("[APP] init");

    button_setup();
    // servo_setup();
    // wifi_setup();
    // camera_setup();
    camera_mb_setup();
}

void loop() {
    // Serial.println("[APP] loop");

    button_loop();
    // button_debug();

    if (button_is_pressed()) {
        // camera_fb_t* fb = esp_camera_fb_get();
        //
        // http_send(fb->buf, fb->len);
        //
        // esp_camera_fb_return(fb);

        camera_mb_toggle();
    }

    delay(200);
}

