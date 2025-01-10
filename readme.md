# ESP32 Cam and Servo IOT Project

capture camera to do face recognition in server, then rotate servo

# Control Flow

## Microcontroller

device used is

- ESP32cam
- Servo 180
- Button

### `setup()`

mcu will setup servo, button, camera flash pin

then attempt to connect to wifi via `WiFiManager` library

then it will setup websocket handler

### WebSocket

connecting to websocket, mcu provide a query parameter about what
messages mcu want to be notified about, in this case, `door` and `mcu`

websocket `message` is a string which contains json form message

in common, `message` have id and value field

a message with `door` id contains information about the state of the door,
which mcu will rotate servo based on that state

`door` state change occur based on various event, such face recog attempt,
or manually through control panel

a message with `mcu` id contains information about the state of mcu,
in this case mcu only interested in the flash state

`flash` state change occur only from manually changing it through control panel

onconnect, server will immediately send the latest state of messages the client
want to listen to, so state is sync immediately

### `loop()`

websocket require websocket loop to be called for it to progress
accepting or sending messages, so its called in the begining of loop function

for button, one only care about when it start pressing once and does not count
when button is held, so the logic is to keep track of button raw state and save
it for the next loop, here button press logic is invoked

then we can check is the button pressed, to run the capture attempt logic

### Capture Attempt

a capture attempt is invoked on button press

if the door is open, we simply close the door

if the door is closed, camera will capture a picture,
then send it to server for further processing

if an attempt is success, server will send door state via websocket which
mcu already listen to

otherwise, nothing happens on mcu side

