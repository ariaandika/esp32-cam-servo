#include "Arduino.h"
#include "HTTPClient.h"
#include "Config.cpp"

void http_send(uint8_t* buf, size_t len) {
    HTTPClient client;

    client.begin(URL);

    int responseCode = client.POST(buf, len);

    if (responseCode > 0) {
        Serial.print("[HTTP] Response code: ");
        Serial.println(responseCode);

        String payload = client.getString();
        Serial.print("[HTTP] Response: ");
        Serial.println(payload);

    } else {
        Serial.print("[HTTP] Error: ");
        Serial.println(responseCode);
    }

    client.end();
}

