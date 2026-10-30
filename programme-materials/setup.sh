#!/bin/bash
# Lays the build scripts out the way they expect, in /tmp/epicwork (or $EPIC_WORK).
# Then: cd /tmp/epicwork and run the builders listed in HANDOFF.md.
set -e
W=${EPIC_WORK:-/tmp/epicwork}
HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(cd "$HERE/.." && pwd)
mkdir -p "$W"
cp -r "$HERE/papers" "$HERE/books" "$HERE/print" "$W/"
mkdir -p "$W/localfonts2" && cp "$HERE/fonts/"* "$W/localfonts2/"
cp "$HERE/excel/"* "$W/"
# plan.json = the live timetable, generated from the backend plan file
node -e "const p=require('$REPO/backend/src/data/program/koreaBatch1');console.log(JSON.stringify({program:p.PROGRAM,teachers:p.TEACHERS,days:p.buildDays(),sessions:p.buildSessions()}))" > "$W/plan.json"
# Sinhala font for the Korean workbooks
(cd "$W/books" && npm init -y >/dev/null && npm i @fontsource/noto-sans-sinhala@5.1.0 >/dev/null)
mkdir -p /home/claude/deliverables/print /home/claude/deliverables/workbooks /home/claude/deliverables/Anna
echo "Ready in $W"
