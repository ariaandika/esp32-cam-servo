#include "Arduino.h"
#include "CameraIoInit.cpp"

void camera_setup(){
    esp_err_t err = esp_camera_init(&camera_config);

    while (err != ESP_OK) {
        Serial.print("[CAMERA] setup failed: ");
        Serial.println(err, HEX);
        Serial.println("[CAMERA] retrying...");

        delay(1000);
        err = esp_camera_init(&camera_config);
    }

    Serial.println("[CAMERA] setup ok");
}

// esp32 cam uploader built in led
void camera_mb_setup() {
    pinMode(33, OUTPUT);
    digitalWrite(33, LOW);
}

void camera_mb_toggle() {
    // camera mb led is inverted
    digitalWrite(33, LOW);
    delay(200);
    digitalWrite(33, HIGH);
}

// typedef struct {
//     uint8_t* buf;              /*!< Pointer to the pixel data */
//     size_t len;                 /*!< Length of the buffer in bytes */
//     size_t width;               /*!< Width of the buffer in pixels */
//     size_t height;              /*!< Height of the buffer in pixels */
//     pixformat_t format;         /*!< Format of the pixel data */
//     struct timeval timestamp;   /*!< Timestamp since boot of the first DMA buffer of the frame */
// } camera_fb_t;

esp_err_t camera_debug() {
    camera_fb_t* fb = esp_camera_fb_get();

    if (!fb) {
        Serial.println("[CAMERA] Capture Failed");
        return ESP_FAIL;
    }

    Serial.print("[CAMERA] Capture OK, size: ");
    Serial.println(fb->len);

    esp_camera_fb_return(fb);
    return ESP_OK;
}

