#include "Arduino.h"
#include "Config.cpp"
#include "ESP32Servo.cpp"

int degree = 0;
int direction = 0;

Servo servo;

void servo_setup() {
    Serial.print("[SERVO] pin ");
    Serial.println(SERVO_PIN);

    servo.attach(SERVO_PIN);
    servo.write(degree);
}

void servo_debug() {
    if (degree == 180) {
        direction = -1;
    } else if (degree == 0) {
        direction = 1;
    }

    degree += 90 * direction;

    Serial.print("[SERVO] ");
    Serial.println(degree);
}

void servo_loop() {
}

