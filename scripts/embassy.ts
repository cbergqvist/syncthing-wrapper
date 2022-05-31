// @ts-check

import matches from "https://deno.land/x/ts_matches@5.1.5/mod.ts";
const { shape, number, string, some } = matches;

import {
  Effects,
  ConfigRes,
  Config,
  SetResult,
  Properties,
  Dependencies,
} from "https://raw.githubusercontent.com/Start9Labs/embassy-os/master/backend/test/js_action_execute/package-data/scripts/test-package/0.3.0.3/types.d.ts";

const matchesStringRec = some(
  string,
  shape(
    {
      charset: string,
      len: number,
    },
    ["charset"]
  )
);
const matchesConfig = shape({
  username: matchesStringRec,
  password: matchesStringRec,
});

const matchesConfigFile = shape({
  username: string,
  password: string,
});

export async function getConfig(effects: Effects): Promise<ConfigRes> {
  const config = await effects
    .readJsonFile({
      volumeId: "main",
      path: "config.json",
    })
    .then((x) => matchesConfig.unsafeCast(x))
    .catch(() => undefined);

  return {
    config,
    spec: {
      "tor-address": {
        name: "Tor Address",
        description: "The Tor address.",
        type: "pointer",
        subtype: "package",
        "package-id": "syncthing",
        target: "tor-address",
        interface: "main",
      },
      username: {
        type: "string",
        name: "Username",
        description: "The user for loging into the administration page of syncthing",
        nullable: false,
        copyable: true,
        masked: false,
        default: "admin",
      },
      password: {
        type: "string",
        name: "Password",
        description: "The password for loging into the administration page of syncthing",
        nullable: false,
        copyable: true,
        masked: true,
        default: {
          charset: "a-z,A-Z,0-9",
          len: 22,
        },
      },
    },
  };
}

export async function setConfig(effects: Effects, input: Config): Promise<SetResult> {
  await effects.writeJsonFile({
    path: "./config.json",
    toWrite: {
      username: input?.username,
      password: input?.password,
    },
    volumeId: "main",
  });
  return {
    signal: "SIGTERM",
    "depends-on": {},
  };
}

const matchesSyncthingSystem = shape({
  myID: string,
});

export async function properties(effects: Effects): Promise<Properties> {
  const syncthing_system_promise = effects.readJsonFile({
    volumeId: "main",
    path: "syncthing_stats.json",
  });
  const config_promise = effects.readJsonFile({
    volumeId: "main",
    path: "config.json",
  });

  const syncthing_system = matchesSyncthingSystem.unsafeCast(await syncthing_system_promise);
  const config = matchesConfigFile.unsafeCast(await config_promise);

  return {
    version: 2,
    data: {
      "Device Id": {
        type: "string",
        value: syncthing_system.myID,
        description: "his is the ID for syncthing to attach others to",
        copyable: true,
        qr: true,
        masked: false,
      },
      Username: {
        type: "string",
        value: config.username,
        description: "Username to login to the UI",
        copyable: true,
        qr: false,
        masked: false,
      },
      Password: {
        type: "string",
        value: config.password,
        description: "Password to login to the UI",
        copyable: true,
        qr: false,
        masked: true,
      },
    },
  };
}