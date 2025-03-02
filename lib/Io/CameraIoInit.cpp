#include "esp_camera.h"

// https://github.com/espressif/esp32-camera/blob/master/examples/camera_example/main/take_picture.c

// AiThinker Camera

#define CAM_PIN_PWDN 32
#define CAM_PIN_RESET -1
#define CAM_PIN_XCLK 0
#define CAM_PIN_SIOD 26
#define CAM_PIN_SIOC 27

#define CAM_PIN_D7 35
#define CAM_PIN_D6 34
#define CAM_PIN_D5 39
#define CAM_PIN_D4 36
#define CAM_PIN_D3 21
#define CAM_PIN_D2 19
#define CAM_PIN_D1 18
#define CAM_PIN_D0 5
#define CAM_PIN_VSYNC 25
#define CAM_PIN_HREF 23
#define CAM_PIN_PCLK 22

static camera_config_t camera_config = {
    .pin_pwdn = CAM_PIN_PWDN,
    .pin_reset = CAM_PIN_RESET,
    .pin_xclk = CAM_PIN_XCLK,
    .pin_sccb_sda = CAM_PIN_SIOD,
    .pin_sccb_scl = CAM_PIN_SIOC,

    .pin_d7 = CAM_PIN_D7,
    .pin_d6 = CAM_PIN_D6,
    .pin_d5 = CAM_PIN_D5,
    .pin_d4 = CAM_PIN_D4,
    .pin_d3 = CAM_PIN_D3,
    .pin_d2 = CAM_PIN_D2,
    .pin_d1 = CAM_PIN_D1,
    .pin_d0 = CAM_PIN_D0,
    .pin_vsync = CAM_PIN_VSYNC,
    .pin_href = CAM_PIN_HREF,
    .pin_pclk = CAM_PIN_PCLK,

    // XCLK 20MHz or 10MHz for OV2640 double FPS (Experimental)
    .xclk_freq_hz = 20000000,
    .ledc_timer = LEDC_TIMER_0,
    .ledc_channel = LEDC_CHANNEL_0,

    // YUV422,GRAYSCALE,RGB565,JPEG
    .pixel_format = PIXFORMAT_JPEG,

    // FRAMESIZE_UXGA (1600 x 1200)
    // FRAMESIZE_QVGA (320 x 240)
    // FRAMESIZE_CIF (352 x 288)
    // FRAMESIZE_VGA (640 x 480)
    // FRAMESIZE_SVGA (800 x 600)
    // FRAMESIZE_XGA (1024 x 768)
    // FRAMESIZE_SXGA (1280 x 1024)
    // QQVGA-UXGA, For ESP32, do not use sizes above QVGA when not JPEG.
    // The performance of the ESP32-S series has improved a lot, but JPEG mode always gives better frame rates.
    .frame_size = FRAMESIZE_SVGA,

    //0-63, for OV series camera sensors, lower number means higher quality
    .jpeg_quality = 10,
    //When jpeg mode is used, if fb_count more than one, the driver will work in continuous mode.
    .fb_count = 1,
    .fb_location = CAMERA_FB_IN_PSRAM,

    // of by one da hek
    // https://github.com/espressif/arduino-esp32/issues/6047
    // .grab_mode = CAMERA_GRAB_WHEN_EMPTY,
    .grab_mode = CAMERA_GRAB_LATEST,

};

