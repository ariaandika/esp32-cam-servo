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

#define FLASH_PIN 4

bool enable_flash = false;

void capture() {
    if (true) {
        JsonDocument json;
        json["id"] = "img";
        JsonDocument value;
        value["kind"] = "attempt";
        json["value"] = value;
        String data;
        serializeJson(json ,data);
        websocket_send(data);
    }

    if (enable_flash) {
        digitalWrite(FLASH_PIN, HIGH);
    }

    camera_fb_t* fb = esp_camera_fb_get();

    // of by one error
    // https://github.com/espressif/arduino-esp32/issues/6047
    esp_camera_fb_return(fb);
    fb = esp_camera_fb_get();

    if (enable_flash) {
        digitalWrite(FLASH_PIN, LOW);
    }

    if (!fb) {
        Serial.println("[CAMERA] capture failed");
    } else {
        http_send(fb->buf, fb->len);
    }

    esp_camera_fb_return(fb);
}

void onmessage(uint8_t* buf, size_t len) {
    JsonDocument message;
    DeserializationError err = deserializeJson(message, buf, len);

    if (err) {
        Serial.print("[WEBSOCKET] JsonError: ");
        Serial.println(err.f_str());
        return;
    }

    String id = message["id"];
    JsonDocument value = message["value"];

    Serial.print("[WEBSOCKET] id: ");
    Serial.print(id);

    if (id == "door") {
        String kind = value["kind"];
        Serial.println(kind);

        if (kind == "sync") {
            JsonDocument state = value["value"];
            bool door = state["open"];
            servo_toggle(door);

            Serial.print("[APP] door: ");
            Serial.print(door);
            Serial.println();
        }
    }

    else if (id == "mcu") {
        String kind = value["kind"];

        if (kind == "sync") {
            JsonDocument state = value["value"];
            enable_flash = state["flash"];
            Serial.print(" flash: ");
            Serial.print(enable_flash);
        }

        else if (kind == "capture") {
            capture();
        }
    }

    Serial.println();
}

void setup() {
    Serial.begin(115200);
    Serial.setDebugOutput(true);
    Serial.println("[APP] init");

    pinMode(FLASH_PIN, OUTPUT);

    camera_setup();
    button_setup();
    servo_setup();
    wifi_setup();
    websocket_setup(onmessage);
}

void loop() {
    websocket_loop();
    button_loop();

    if (button_is_pressed()) {
        Serial.println("Press");
        if (is_door_open()) {
            JsonDocument json;
            json["id"] = "door";
            JsonDocument value;
            value["kind"] = "close";
            json["value"] = value;
            String data;
            serializeJson(json ,data);
            websocket_send(data);
        } else {
            capture();
        }
    }
}


