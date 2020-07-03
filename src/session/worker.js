const net = require("net");
const { Parser } = require("@elanthia/koschei");

class Bridge {
  static parser = Parser.of();
  static sock = void 0;

  static connect(port) {
    Bridge.parser.on("tag", (tag) =>
      self.postMessage({ topic: "TAG", gram: tag })
    );

    const sock = (Bridge.sock = net.connect({ port: port }, (err) => {
      if (err) {
        Bridge.sock = void 0;
        throw err;
      }

      sock.on("close", (_) => self.postMessage({ topic: "CLOSE" }));

      sock.on("data", (data) => {
        // handle open links
        if (data.toString().startsWith("<Launch")) {
          const src = (data.toString().match(/src="(.+)" \/>/) || [])[1];
          return (
            src &&
            self.postMessage({ topic: "OPEN", link: "http://play.net" + src })
          );
        }

        Bridge.parser.parse(data);
      });
    }));
  }
}

self.onmessage = ({ data }) => {
  switch (data.topic) {
    case "CONNECT":
      return Bridge.connect(data.port);
    case "COMMAND":
      return Bridge.sock && Bridge.sock.write(data.command + "\r\n");
  }
};
