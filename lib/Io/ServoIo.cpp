#include "Arduino.h"
#include "Config.cpp"
#include "ESP32Servo.cpp"

int servo_degree = 0;

Servo servo;

void servo_setup() {
    Serial.print("[SERVO] pin ");
    Serial.println(SERVO_PIN);

    servo.attach(SERVO_PIN);
    servo.write(servo_degree);
}

void servo_toggle(bool open) {
    servo_degree = open ? 90 : 0;
    servo.write(servo_degree);
}

int is_door_open() {
    return servo_degree == 90;
}

void servo_debug() {
    servo_degree = servo_degree == 90 ? 0 : servo_degree + 45;
    servo.write(servo_degree);

    Serial.print("[SERVO] ");
    Serial.println(servo_degree);
}

