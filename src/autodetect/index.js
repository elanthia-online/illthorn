const ps_list = require("ps-list");
const Session = require("../session");
const Settings = require("../settings");
const Bus = require("../bus");

// ruby /home/benjamin/gemstone/lich/lich.rb --login Ondreian --detachable-client=8003 --without-frontend
const is_gemstone = ({ name, cmd }) =>
  name == "ruby" && (is_lich_proc(cmd) || is_cabal_proc(cmd));

const is_lich_proc = (cmd) =>
  (cmd.includes("lich.rbw") || cmd.includes("lich.rb")) &&
  cmd.includes("--detachable-client=");

const is_cabal_proc = (cmd) =>
  cmd.includes("cabal.rb") &&
  (cmd.includes("--port=") || cmd.includes("--detachable-client="));

const not_zero_port = ({ port }) => port > 0;

const match = (string, regex) => string.match(regex) || [];

const extract_port = (cmd) =>
  match(cmd, /--detachable-client=(\d+)/)[1] || match(cmd, /--port=(\d+)/)[1];

const extract_name = (cmd) =>
  match(cmd, /--character=(\w+)\b/)[1] || match(cmd, /--login\s(\w+)\s/)[1];

const parse_lich_cmd = (proc) => ({
  ...proc,
  name: extract_name(proc.cmd),
  port: extract_port(proc.cmd),
});

module.exports = class Autodetect {
  static async list_unsafe() {
    return (await ps_list()).filter(is_gemstone);
  }

  static async list() {
    return Object.values(
      (await Autodetect.list_unsafe())
        .map(parse_lich_cmd)
        .map((proc) => console.log(proc) || proc)
        .filter(not_zero_port)
        .reduce((acc, conn) => {
          acc[conn.port] = acc[conn.port] || conn;
          // higher processes should have a higher pid
          // to account for zombie processes that Lich loves
          // to allow to linger
          if (acc[conn.port].pid < conn.pid) {
            acc[conn.port] = conn;
          }
          return acc;
        }, {})
    );
  }

  static apply_filters(sessions) {
    const skippable = Settings.get("no-autoconnect");
    if (typeof (skippable || {}).indexOf !== "function") return sessions;
    return sessions.filter((opts) => skippable.indexOf(opts.name) == -1);
  }

  static async connect_all() {
    const detected = await Autodetect.list();

    console.log("autoconnect:%o", detected);

    const connections = Autodetect.apply_filters(detected).map((opts) => {
      if (Session.has(opts.name) && Session.get(opts.name).pending) {
        Session.get(opts.name).destroy();
      }

      if (Session.has(opts.name)) {
        return Session.get(opts.name);
      }

      try {
        return Session.of(opts);
      } catch (err) {
        Bus.emit("error", { message: err.message, from: opts.name });
      }
    });

    const sessions = (await Promise.all(connections)).filter(
      (session) => session instanceof Session
    );

    if (sessions.length && !Session.focused()) {
      // restore last focus from last session
      const last_focused = Session.fuzzy_find(
        Settings.get("focus", sessions[0].name)
      );

      Bus.emit(Bus.events.FOCUS, last_focused[0] || sessions[0]);
    }

    Bus.emit(Bus.events.REDRAW);
  }
};
