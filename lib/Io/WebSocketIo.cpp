#include "Arduino.h"
#include "WebSocketsClient.h"
#include "ArduinoJson.h"
#include "Config.cpp"

WebSocketsClient ws;
JsonDocument json;

void websocket_onevent(WStype_t type, uint8_t* buf, size_t len) {
    if (type == WStype_DISCONNECTED) {
        Serial.println("[WEBSOCKET] Disconnected");

    } else if (type == WStype_CONNECTED) {
        Serial.println("[WEBSOCKET] Connected");

    } else if (type == WStype_TEXT) {
        DeserializationError err = deserializeJson(json, buf, len);

        if (err) {
            Serial.print("[WEBSOCKET] JsonError: ");
            Serial.println(err.f_str());
            return;
        }

        const char* event_kind = json["kind"];

        Serial.print("[WEBSOCKEt] event_kind: ");
        Serial.println(event_kind);

    // } else if (type == WStype_BIN) {
    } else {
        Serial.print("[WEBSOCKET] unhandled event: ");
        Serial.println(type);
    }
}

void websocket_setup() {
    ws.begin(WS_HOST, WS_PORT, WS_PATH);
    ws.onEvent(websocket_onevent);
    ws.setReconnectInterval(5000);
}

void websocket_loop() {
    ws.loop();
}

