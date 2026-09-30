#!/bin/bash
# Deploy ERP: PINNED build 11 Agustus (artifact backup), BUKAN rebuild dari source terbaru.
# Rebuild via `npm run build` akan memunculkan perubahan source terkini lagi.
set -e
BACKUP=/var/www/erp.bak.20260822_pre_rollback_aug11
DEST=/var/www/erp

# Lepas immutable flag kalau ada
chattr -i $DEST/index.html 2>/dev/null || true

# Deploy artifact 11 Agustus apa adanya
rsync -a --delete $BACKUP/ $DEST/

echo "=== DEPLOYED: build 11 Agustus ==="
md5sum $DEST/index.html
echo "Selesai: $(date)"
