#include "Arduino.h"
#include "WebSocketsClient.h"
#include "Config.cpp"

WebSocketsClient ws;
void (*websocket_onmessage)(uint8_t*,size_t);

void websocket_onevent(WStype_t type, uint8_t* buf, size_t len) {
    if (type == WStype_DISCONNECTED) {
        Serial.println("[WEBSOCKET] Disconnected");

    } else if (type == WStype_CONNECTED) {
        Serial.println("[WEBSOCKET] Connected");

    } else if (type == WStype_TEXT) {
        (*websocket_onmessage)(buf, len);

    // } else if (type == WStype_BIN) {

    } else {
        Serial.print("[WEBSOCKET] unhandled event: ");
        Serial.println(type);
    }
}

void websocket_setup(void (*onmessage)(uint8_t*,size_t)) {
    websocket_onmessage = onmessage;
    ws.begin(WS_HOST, WS_PORT, WS_PATH);
    ws.onEvent(websocket_onevent);
    ws.setReconnectInterval(5000);
}

void websocket_send(String val) {
    ws.sendTXT(val);
}

void websocket_loop() {
    ws.loop();
}

