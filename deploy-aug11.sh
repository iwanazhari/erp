#!/bin/bash
# Deploy ERP dari backup 11 Agustus, dengan proteksi immutable flag
set -e

BACKUP="/var/www/erp.bak.20260811_092838"
DEST="/var/www/erp"
KNOWN_HASH="f7040e065317137b676047a697b8a810"

# 1. Lepas immutable flag kalau ada
chattr -i "$DEST/index.html" 2>/dev/null || true

# 2. Deploy
rsync -a --delete "$BACKUP/" "$DEST/"

# 3. Re-add immutable flag (optional, uncomment jika mau)
# chattr +i "$DEST/index.html"

# 4. Verify
HASH=$(md5sum "$DEST/index.html" | awk "{print \$1}")
if [ "$HASH" = "$KNOWN_HASH" ]; then
  echo "OK: build 11 Agustus deployed ($HASH)"
else
  echo "WARNING: hash mismatch! got $HASH, expected $KNOWN_HASH"
  exit 1
fi

nginx -s reload 2>/dev/null && echo "nginx reloaded"
