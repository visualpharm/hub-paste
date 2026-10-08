import json, os, unittest
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Manifest(unittest.TestCase):
    def test_manifest(self):
        m = json.load(open(os.path.join(ROOT, "hub-plugin.json"), encoding="utf-8"))
        for k in ("name", "description", "why", "version", "hub", "web", "icon"):
            self.assertTrue(m.get(k), k)
        for f in (m["web"], m["icon"], "paste.css"):
            self.assertTrue(os.path.isfile(os.path.join(ROOT, f)), f)


if __name__ == "__main__":
    unittest.main()
