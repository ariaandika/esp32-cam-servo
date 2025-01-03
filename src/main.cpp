// if this not included manually, WiFiManager library choked
#include "WiFi.h"
#include "Update.h"
#include "WebServer.h"
#include "DNSServer.h"
#include "WebSocketsClient.h"

#include "Arduino.h"
#include "ArduinoJson.h"

#include "WiFiIo.cpp"
#include "ButtonIo.cpp"
#include "ServoIo.cpp"
#include "CameraIo.cpp"
#include "HttpIo.cpp"
#include "WebSocketIo.cpp"

void onmessage(uint8_t* buf, size_t len) {
    JsonDocument json;
    DeserializationError err = deserializeJson(json, buf, len);

    if (err) {
        Serial.print("[WEBSOCKET] JsonError: ");
        Serial.println(err.f_str());
        return;
    }

    const char* event_kind = json["kind"];

    JsonDocument value = json["value"];
    bool door = value["door"];

    Serial.print("[APP] door: ");
    Serial.print(door);
    Serial.println();

    servo_toggle(door);
}

void toggle_door() {
    JsonDocument json;
    json["kind"] = "door:toggle";

    String data;
    serializeJson(json ,data);

    websocket_send(data);
}

void setup() {
    Serial.begin(115200);
    Serial.setDebugOutput(true);
    Serial.println("[APP] init");

    button_setup();
    servo_setup();
    wifi_setup();
    // camera_setup();
    // camera_mb_setup();
    websocket_setup(onmessage);
}

void loop() {
    // Serial.println("[APP] loop");

    websocket_loop();
    button_loop();

    if (button_is_pressed()) {
        toggle_door();

        // camera_fb_t* fb = esp_camera_fb_get();
        //
        // http_send(fb->buf, fb->len);
        //
        // esp_camera_fb_return(fb);

        // camera_mb_toggle();
    }
}


