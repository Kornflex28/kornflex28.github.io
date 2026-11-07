"""A headless Chrome (or Edge) driven over the DevTools protocol, for the workflows' pictures of
the site: open a page at a size, on a phone or not, wait for it to draw, photograph it.

Its chance is seeded (Math.random), and motion reduced, so the same page gives the same picture
from one run to the next. Set BROWSER to the browser's path (google-chrome by default)."""
import base64, json, os, shutil, socket, subprocess, tempfile, time, urllib.request

import websocket

# Math.random replaced by a seeded one (mulberry32), before any of the page's scripts run
SEEDED = """(() => { let s = 0x2545f491;
    Math.random = () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();"""


class Browser:
    def __init__(self):
        with socket.socket() as probe:              # a free port for its DevTools
            probe.bind(("127.0.0.1", 0))
            port = probe.getsockname()[1]
        self.profile = tempfile.mkdtemp(prefix="browser-")
        path = os.environ.get("BROWSER", "google-chrome")
        self.proc = subprocess.Popen([path, "--headless=new", "--hide-scrollbars", "--no-first-run", f"--remote-debugging-port={port}",
                                      f"--user-data-dir={self.profile}", "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(150):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json", timeout=2))
                break
            except OSError:
                time.sleep(0.2)
        self.ws = websocket.create_connection([t for t in tabs if t["type"] == "page"][0]["webSocketDebuggerUrl"], timeout=120)
        self.n, self.errors = 0, []
        self.call("Page.enable")
        self.call("Runtime.enable")
        self.call("Page.addScriptToEvaluateOnNewDocument", source=SEEDED)
        self.call("Emulation.setEmulatedMedia", features=[{"name": "prefers-reduced-motion", "value": "reduce"}])

    def call(self, method, **params):
        self.n += 1
        self.ws.send(json.dumps({"id": self.n, "method": method, "params": params}))
        while True:
            reply = json.loads(self.ws.recv())
            if reply.get("method") == "Runtime.exceptionThrown":
                self.errors.append(reply["params"]["exceptionDetails"].get("exception", {}).get("description", "?")[:300])
            if reply.get("id") == self.n:
                return reply.get("result", reply)

    def eval(self, expression):
        return self.call("Runtime.evaluate", expression=expression, returnByValue=True, awaitPromise=True)["result"].get("value")

    def open(self, url, width, height, mobile=False, wait=3.0):
        self.mobile = mobile
        self.call("Emulation.setDeviceMetricsOverride", width=width, height=height, deviceScaleFactor=1, mobile=mobile)
        self.call("Page.navigate", url=url)
        time.sleep(wait)
        self.eval("document.fonts.ready.then(() => 1)")

    def shoot(self, path, full=False, clip=None):
        params = {"format": "png"}
        if full:
            # the whole page: the window made as tall as the page, until the page settles at that
            # height (its layout follows the window's: screen heights, the elevator's landings)
            metrics = self.call("Page.getLayoutMetrics")["cssLayoutViewport"]
            width, height = metrics["clientWidth"], 0
            for _ in range(5):
                tall = self.eval("document.documentElement.scrollHeight")
                if tall == height:
                    break
                height = tall
                self.call("Emulation.setDeviceMetricsOverride", width=width, height=height, deviceScaleFactor=1, mobile=self.mobile)
                time.sleep(1.2)
        elif clip:
            params["clip"] = {**clip, "scale": 1}
        with open(path, "wb") as out:
            out.write(base64.b64decode(self.call("Page.captureScreenshot", **params)["data"]))

    def close(self):
        # closed through DevTools, which ends every process it started (killing the first one
        # alone leaves the others running on some systems)
        try:
            self.call("Browser.close")
            self.proc.wait(timeout=10)
        except Exception:
            self.proc.kill()
        shutil.rmtree(self.profile, ignore_errors=True)

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()
