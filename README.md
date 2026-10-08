# hub-paste

Plugin for the Agents Hub page: a big paste into the message box becomes an attachment.

- A paste over 3000 characters turns into a tile (start of the text, size) instead of a wall of text; short pastes stay text.
- Click the tile to read the full text or delete it. Hub sessions get the file path (`~/.hub-core/attachments/…`) like with images.
- Ceiling 1 MB; above it a message explains and nothing is attached.

Works through the page's own paste event and upload, no hub code changes. Needs plugin API 1.7 (`hub.addStyle`).
Dev: `python3 dev/serve.py` (demo hub on port 1100), `node tests/cdp.mjs <chrome-debug-port> '<steps json>'`.
