# Control Flow

## Server

server has 2 endpoints, `/`, `/ws`, `/geo` and `/iot`

`/` serve control panel web page

the web page connect to web socket on `/ws`

`/ws` only send message to client for updating geolocation or door status

mobile device connect to `/geo` to send phone geolocation

microcontroller will connect to web socket on `/iot`

`/iot` send message to microcontroller when phone far away to lock door

microcontroller send pictures to `/iot` for attempt of unlocking door

`/iot` send message back is unlocking attempt successful

## Microcontroller

- `init`

connect to wifi

setup websocket hook when phone is far away,
then lock door

- `loop`

check wifi status, if error, reconnect

if button pressed, check phone location, if phone is far, show error feedback,
otherwise take pictures and send to server, wait for response,
if response ok, unlock door, otherwise show error feedback

## Web

web browser request to server on `/`

connect to websocket on `/ws`

