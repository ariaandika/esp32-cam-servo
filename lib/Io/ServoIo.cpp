#include "Arduino.h"
#include "Config.cpp"
#include "ESP32Servo.cpp"

int degree = 0;

Servo servo;

void servo_setup() {
    Serial.print("[SERVO] pin ");
    Serial.println(SERVO_PIN);

    servo.attach(SERVO_PIN);
    servo.write(degree);
}

void servo_toggle(bool open) {
    servo.write(open ? 90 : 0);
}

void servo_debug() {
    degree = degree == 90 ? 0 : degree + 45;
    servo.write(degree);

    Serial.print("[SERVO] ");
    Serial.println(degree);
}

