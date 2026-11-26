# Nutcracker: the official Nutshell image with Nutcracker's patches applied,
# plus the admin dashboard (admin-ui submodule) and the Node runtime it needs.
# Bump the image digests and the submodules together (UPDATING.md).

FROM node:22-bookworm-slim@sha256:4b150b48b4116e2a22f2c39cc27025fbf4f153e2078fd3b14d159fdb5c7279da AS admin-ui
WORKDIR /opt/admin-ui
COPY admin-ui/package.json ./
COPY dashboard/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY admin-ui/server.js ./
COPY admin-ui/public ./public
COPY admin-ui/LICENSE ./

FROM cashubtc/nutshell:0.22.1@sha256:05b536e0e3d6beee75417ece319a3f89a687d34cfb3cc12c6b19d253104b450e

# Nutshell's own source at the tag the image was built from, then the patches.
COPY upstream-project/cashu /app/cashu
COPY patches /tmp/patches
RUN set -eux; cd /app; \
    for p in /tmp/patches/*.patch; do patch -p1 --forward --batch < "$p"; done; \
    if find /app/cashu -name '*.rej' | grep -q .; then echo "patch rejects" >&2; exit 1; fi; \
    rm -rf /tmp/patches

# The onchain wallet (patch 0002) needs bdkpython, pinned by hash.
COPY bdk-requirements.txt /tmp/bdk-requirements.txt
RUN pip install --no-cache-dir --require-hashes -r /tmp/bdk-requirements.txt \
    && rm /tmp/bdk-requirements.txt \
    && python -c "import bdkpython, cashu.payment.onchain_phoenixd, cashu.lightning.phoenixd"

# The dashboard reads only the published statistics snapshot.
COPY --from=admin-ui /usr/local/bin/node /usr/local/bin/node
COPY --from=admin-ui /opt/admin-ui /opt/admin-ui
COPY dashboard/export_stats.py /opt/nutcracker/export_stats.py
COPY dashboard/summary.cjs /opt/admin-ui/summary.cjs
COPY dashboard/sessions.cjs /opt/admin-ui/sessions.cjs
COPY dashboard/public/ /opt/admin-ui/public/
COPY dashboard/admin-ui.patch dashboard/operator-ui.patch dashboard/graphite-ui.patch /tmp/
RUN patch --batch --fuzz=0 -d /opt/admin-ui -p1 < /tmp/admin-ui.patch \
    && patch --batch --fuzz=0 -d /opt/admin-ui -p1 < /tmp/operator-ui.patch \
    && patch --batch --fuzz=0 -d /opt/admin-ui -p1 < /tmp/graphite-ui.patch \
    && rm /tmp/admin-ui.patch /tmp/operator-ui.patch /tmp/graphite-ui.patch \
    && node -e "require('/opt/admin-ui/node_modules/express')"
