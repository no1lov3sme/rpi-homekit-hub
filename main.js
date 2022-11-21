import fetch from "node-fetch";
import fs from "fs";
const TOKEN_PATH = "./token.json";
const FLAG_PATH = "./script.flag";

let {access_token, refresh_token, expires_in, date} = {};
if (await fs.access("./token.json", fs.constants.R_OK | fs.constants.W_OK, () => {})) {
    const text = await fs.readFile("./token.json", () => {});
    const content = JSON.parse(text);
    access_token = content.access_token;
    refresh_token = content.refresh_token;
    expires_in = content.expires_in;
    date = content.date;
}

const argv = (key) => {
    // Return true if the key exists and a value is defined
    if (process.argv.includes(`--${key}`)) {
        return true;
    }

    const value = process.argv.find(element => element.startsWith(`--${key}=`));

    // Return null if the key does not exist and a value is not defined
    if (!value) {
        return null;
    }

    return value.replace(`--${key}=`, "");
};

const getToken = async () => {
    const response = await fetch(`https://api.netatmo.com/oauth2/token`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            "grant_type": "password",
            "client_id": client_id,
            "client_secret": client_secret,
            "username": username,
            "password": password,
            "scope": "read_thermostat write_thermostat",
        }),
    });
    const content = await response.json();
    access_token = content?.access_token;
    refresh_token = content?.refresh_token;
    date = Date.now();

    await fs.writeFile(TOKEN_PATH, JSON.stringify({
        ...content,
        date,
    }), err => {
        if (err) {
            throw err;
        }
    });

    //console.log("getToken", content);
};

const refreshToken = async () => {
    const response = await fetch(`https://api.netatmo.com/oauth2/token`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": client_id,
            "client_secret": client_secret,
        }),
    });
    const content = await response.json();
    access_token = content?.access_token;
    refresh_token = content?.refresh_token;
    date = Date.now();

    await fs.writeFile(TOKEN_PATH, JSON.stringify({
        ...content,
        date,
    }), err => {
        if (err) {
            throw err;
        }
    });

    //console.log("refreshToken", content);
};

const getAwayState = async () => {
    const response = await fetch(`https://api.netatmo.com/api/homestatus?home_id=${home_id}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": "Bearer " + access_token,
        },
    });
    const content = await response.json();
    //console.log("getHomeStatus", content);
    const result = content.body.home.rooms.every(({therm_setpoint_mode}) => therm_setpoint_mode === "away");

    if (result) {
        await fs.writeFileSync(FLAG_PATH, "ON", err => {
            if (err) {
                throw err;
            }
        });
        console.log(result ? "ON" : "");
    }
    else {
        await fs.unlink(FLAG_PATH, err => {
            if (err) {
                throw err;
            }
        });
    }

    return result;
};

/**
 * @param ("away"|"schedule") mode Mode to be set
 */
const setAwaySate = async (mode) => {
    const response = await fetch(`https://app.netatmo.net/api/setthermmode?home_id=${home_id}&mode=${mode}`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Authorization": "Bearer " + access_token,
        },

    });
    const content = await response.json();
    //console.log("setAwaySate", content);
};

if (!access_token || !refresh_token) {
    await getToken();
}
else if (Date.now() > date + expires_in * 1000) {
    await refreshToken();
}

if (process.env?.mode) {
    await setAwaySate(process.env?.mode);
}
await getAwayState();

process.exit();
