#include "Arduino.h"
#include "Config.cpp"

int button_last_state = 0;
int button_held = 0;
int button_state = 0;

void button_setup() {
    Serial.print("[BUTTON] pin ");
    Serial.println(BTN_PIN);

    pinMode(BTN_PIN, INPUT_PULLUP);
    button_last_state = digitalRead(BTN_PIN);
}

void button_loop() {
    int current = !digitalRead(BTN_PIN);

    if (current && button_last_state) {
        button_state = 0;
        button_held = 1;

    } else if (current && !button_last_state) {
        button_last_state = 1;
        button_state = 1;
        button_held = 0;

    } else {
        button_last_state = 0;
        button_state = 0;
        button_held = 0;
    }
}

int button_is_pressed() {
    return button_state;
}

void button_debug() {
    Serial.print("[BUTTON] ");
    Serial.print("raw state: ");
    Serial.print(digitalRead(BTN_PIN));
    Serial.print(", pressed: ");
    Serial.print(button_state);
    Serial.print(", held: ");
    Serial.print(button_held);
    Serial.println();
}

