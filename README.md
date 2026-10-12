# hub-paste

Plugin for the Agents Hub page: a big paste into the message box becomes an attachment.

- A paste over 3000 characters turns into a tile (start of the text, size) instead of a wall of text; short pastes stay text.
- Click the tile to read the full text or delete it. Hub sessions get the file path (`~/.hub-core/attachments/…`) like with images.
- No ceiling of its own: the limit is the hub's (`attachments.max_mb`, default 1 GB, in the snapshot as `upload.max_bytes`); above it a message explains and nothing is attached. The viewer shows the first 200 000 characters of a huge paste; the session gets the whole file.

Works through the page's own paste event and upload, no hub code changes. Needs plugin API 1.7 (`hub.addStyle`) and a hub with `POST /api/upload/raw` (raw streaming upload) for pastes over 20 MB.
Dev: `python3 dev/serve.py` (demo hub on port 1100), `node tests/cdp.mjs <chrome-debug-port> '<steps json>'`.
