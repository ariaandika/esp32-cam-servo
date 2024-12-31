#include "Arduino.h"

int flashPin = 4;

void hello_setup() {
    pinMode(flashPin, OUTPUT);
}

void hello_loop() {
    digitalWrite(flashPin, HIGH);
    delay(200);
    digitalWrite(flashPin, LOW);
    delay(1000);
}

