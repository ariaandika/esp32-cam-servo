#include "Arduino.h"
#include "Init.cpp"

#include "HTTPClient.h"

#define URL "http://192.168.10.82:3000/pict"

esp_err_t espcam_setup(){
    //power up the camera if PWDN pin is defined
    // if(CAM_PIN_PWDN != -1){
    //     pinMode(CAM_PIN_PWDN, OUTPUT);
    //     digitalWrite(CAM_PIN_PWDN, LOW);
    // }

    //initialize the camera
    esp_err_t err = esp_camera_init(&camera_config);
    if (err != ESP_OK) {
        Serial.print("Camera Init Failed: ");
        Serial.println(err, HEX);
        return err;
    }

    return ESP_OK;
}

void send_image(camera_fb_t* fb) {
    HTTPClient client;

    client.begin(URL);
    client.addHeader("Content-Type", "image/jpeg");

    int httpResponseCode = client.POST(fb->buf, fb->len);

    if (httpResponseCode > 0) {
        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);
        String payload = client.getString();
        Serial.println(payload);
    } else {
        Serial.print("Error code: ");
        Serial.println(httpResponseCode);
    }

    client.end();
}

esp_err_t camera_capture(){
    // acquire a frame
    camera_fb_t* fb = esp_camera_fb_get();

    if (!fb) {
        Serial.println("Camera Capture Failed");
        return ESP_FAIL;
    }

    // replace this with your own function
    // process_image(fb->width, fb->height, fb->format, fb->buf, fb->len);
    Serial.print("Capture OK, width: ");
    Serial.println(fb->width);
    send_image(fb);

    //return the frame buffer back to the driver for reuse
    esp_camera_fb_return(fb);
    return ESP_OK;
}



