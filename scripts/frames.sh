#!/usr/bin/env bash
# Stitch the chained Gemini clips into the hero's frame sequence.
#
#   video/raw/01.mp4, 02.mp4, …   the clips, in chain order (each one starts
#                                 on the previous clip's last frame)
#   video/phone/raw/01.mp4, …     optional vertical clips for phones; without
#                                 them phones get a crop of the wide film
#   scripts/frames.sh [TARGET] [MOBILE]
#                                 TARGET = desktop frames, default 240;
#                                 MOBILE = phone frames, default TARGET / 2
#
# Writes public/frames/d (16:9, 1280w) and public/frames/m (4:5 centre crop,
# 576w), and sets FRAMES.count in src/frames.ts.
set -euo pipefail
cd "$(dirname "$0")/.."

TARGET="${1:-240}"
RAW=video/raw
OUT=video/stitched.mp4

ls "$RAW"/*.mp4 >/dev/null
: > video/list.txt
for f in "$RAW"/*.mp4; do
  echo "file '$(basename "$f")'" >> video/list.txt
done
mv video/list.txt "$RAW/list.txt"

# Re-encode while joining: the first frame of every clip after the first
# repeats the previous clip's last frame, so drop it to avoid a stutter.
# Gemini clips are 1280×720 with a sparkle mark bottom-right; delogo paints
# it out before anything is scaled.
MARK="delogo=x=1125:y=570:w=70:h=65"
n=$(ls "$RAW"/*.mp4 | wc -l)
filter=""
inputs=()
i=0
for f in "$RAW"/*.mp4; do
  inputs+=(-i "$f")
  if [ "$i" -eq 0 ]; then
    filter+="[$i:v]scale=1280:720,$MARK,setpts=PTS-STARTPTS,fps=24[v$i];"
  else
    filter+="[$i:v]scale=1280:720,$MARK,trim=start_frame=1,setpts=PTS-STARTPTS,fps=24[v$i];"
  fi
  i=$((i + 1))
done
for j in $(seq 0 $((n - 1))); do filter+="[v$j]"; done
filter+="concat=n=$n:v=1:a=0[out]"
ffmpeg -loglevel error -y "${inputs[@]}" -filter_complex "$filter" -map "[out]" -an -c:v libx264 -crf 16 -pix_fmt yuv420p "$OUT"

dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
rate=$(awk -v t="$TARGET" -v d="$dur" 'BEGIN { printf "%.4f", t / d }')

rm -rf public/frames && mkdir -p public/frames/d public/frames/m
ffmpeg -loglevel error -y -i "$OUT" -vf "fps=$rate" -c:v libwebp -quality 66 public/frames/d/%04d.webp
# Phones get a 4:5 centre crop (the hero letterboxes it into ~70% of a tall
# screen) at half the frame count and 432×540: phones hold every frame
# decoded as a bitmap, and 120 of these is ~110MB where 240 full crops was
# ~400MB — enough for mobile browsers to evict and re-decode mid-scroll.
MTARGET="${2:-$((TARGET / 2))}"
PRAW=video/phone/raw
if ls "$PRAW"/*.mp4 >/dev/null 2>&1; then
  # A vertical film made for phones (Flow, Veo 3.1, 9:16 at 720×1280): stitched
  # the same way, cut at 432×768 so 120 decoded frames stay ~160MB, and
  # played full-screen with no crop.
  POUT=video/phone/stitched.mp4
  pn=$(ls "$PRAW"/*.mp4 | wc -l)
  pfilter=""
  pinputs=()
  j=0
  for f in "$PRAW"/*.mp4; do
    pinputs+=(-i "$f")
    trim=""
    [ "$j" -gt 0 ] && trim="trim=start_frame=1,"
    # Flow's portrait clips carry a small "Veo" mark, bottom-right.
    pfilter+="[$j:v]scale=720:1280,delogo=x=655:y=1236:w=60:h=40,${trim}setpts=PTS-STARTPTS,fps=24[p$j];"
    j=$((j + 1))
  done
  for k in $(seq 0 $((pn - 1))); do pfilter+="[p$k]"; done
  pfilter+="concat=n=$pn:v=1:a=0[out]"
  ffmpeg -loglevel error -y "${pinputs[@]}" -filter_complex "$pfilter" -map "[out]" -an -c:v libx264 -crf 16 -pix_fmt yuv420p "$POUT"
  pdur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$POUT")
  mrate=$(awk -v t="$MTARGET" -v d="$pdur" 'BEGIN { printf "%.4f", t / d }')
  ffmpeg -loglevel error -y -i "$POUT" -vf "fps=$mrate,scale=432:768:flags=lanczos" -c:v libwebp -quality 70 public/frames/m/%04d.webp
else
  mrate=$(awk -v t="$MTARGET" -v d="$dur" 'BEGIN { printf "%.4f", t / d }')
  ffmpeg -loglevel error -y -i "$OUT" -vf "fps=$mrate,crop=576:720,scale=432:540:flags=lanczos" -c:v libwebp -quality 70 public/frames/m/%04d.webp
fi

count=$(ls public/frames/d | wc -l | tr -d ' ')
mcount=$(ls public/frames/m | wc -l | tr -d ' ')
sed -i "s/  count: [0-9]*,/  count: $count,/; s/mobileCount: [0-9]*,/mobileCount: $mcount,/" src/frames.ts
echo "frames: $count desktop ($(du -sh public/frames/d | cut -f1)), $mcount mobile ($(du -sh public/frames/m | cut -f1))"
