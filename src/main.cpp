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

bool flash_enabled = false;

String door_close_message;
String attempt_message;

void capture() {
    websocket_send(attempt_message);

    if (flash_enabled) {
        digitalWrite(FLASH_PIN, HIGH);
    }

    camera_fb_t* fb = esp_camera_fb_get();

    // of by one error
    // https://github.com/espressif/arduino-esp32/issues/6047
    esp_camera_fb_return(fb);
    fb = esp_camera_fb_get();

    if (flash_enabled) {
        digitalWrite(FLASH_PIN, LOW);
    }

    if (!fb) {
        Serial.println("[CAMERA] capture failed");
    } else {
        Serial.print("[CAMERA] capture ok, size: ");
        Serial.println(fb->len);
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

    Serial.print("[WEBSOCKET] message id: ");
    Serial.println(id);

    if (id == "door") {
        String kind = value["kind"];

        if (kind == "sync") {
            JsonDocument state = value["value"];
            bool door = state["open"];
            servo_toggle(door);
            Serial.print("[APP] door: ");
            Serial.println(door);
        }
    }

    else if (id == "mcu") {
        String kind = value["kind"];

        if (kind == "sync") {
            JsonDocument state = value["value"];
            flash_enabled = state["flash"];
            Serial.print("[APP] flash: ");
            Serial.println(flash_enabled);
        }

        else if (kind == "capture") {
            capture();
        }
    }
}

void setup_messages() {
    JsonDocument json;
    JsonDocument value;
    json["value"] = value;

    json["id"] = "door";
    value["kind"] = "close";
    serializeJson(json, door_close_message);

    json["id"] = "img";
    value["kind"] = "attempt";
    serializeJson(json, attempt_message);
}

void setup() {
    Serial.begin(115200);
    Serial.println("[APP] init");
    // Serial.setDebugOutput(true);

    pinMode(FLASH_PIN, OUTPUT);

    camera_setup();
    button_setup();
    servo_setup();
    wifi_setup();
    websocket_setup(onmessage);

    setup_messages();
}

void loop() {
    websocket_loop();
    button_loop();

    if (button_is_pressed()) {
        if (is_door_open()) {
            websocket_send(door_close_message);
        } else {
            capture();
        }
    }
}


