# Raspberry Pi HomeKit Hub

Allows to set Netatmo Energy __away__/__schedule__ mode. Created for __Homebridge__ hosted on Raspberry Pi. 

## Configuration

1. Create an app in https://dev.netatmo.com/apps
2. Clone repository to directory __/home/pi__
3. Enter your credentials in `credentials.json`
4. Install __Homebridge__ to your Raspberry Pi
https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Raspbian
5. Set __homebridge__ user as directory owner:
    ```shell
    sudo chown homebridge /home/pi/rpi-homekit-hub -R
    ```
6. Install __homebridge-script2__ plugin
https://github.com/pponce/homebridge-script2#readme
7. Add this configuration to your __homebridge-script2__ plugin in __Homebridge__ interface:
    ```json
    {
        "accessory": "Script2",
        "name": "Netatmo \"away\" state",
        "on": "cd /home/pi/rpi-homekit-hub && npm run --silent set-on",
        "off": "cd /home/pi/rpi-homekit-hub && npm run --silent set-off",
        "state": "cd /home/pi/rpi-homekit-hub && npm run --silent status",
        "fileState": "/home/pi/rpi-homekit-hub/script.flag",
        "on_value": "ON"
    }
    ```
8. Scan QR code in __Homebridge__
   `http://{raspberry_ip_address}:8581` 
9. You're all set!

## To test scripts manually you can call:

1. Get state
    ```shell
    npm run status
    ```
2. Set "away" mode ON
    ```shell
    npm run set-on
    ```
3. Set "away" mode OFF
    ```shell
    npm run set-off
    ```
