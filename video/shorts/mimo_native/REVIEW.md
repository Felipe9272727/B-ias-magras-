# Native portrait Short — source capture reviewed
Runtime/capture: https://github.com/Felipe9272727/B-ias-magras-/actions/runs/41161617678
18 clips decoded completely: 2201 frames at 30 fps, 720x1280 native viewport.
Native empty arm and held pickaxe are visible. The main-hand inset keeps the tool inside the portrait frame.
Opening source is the first 146 frames of vencedora_mimo (same logged timestamp, full armored player) instead of the first-person close-up.
No landscape crop. The existing approved AAC stream must remain identical:
SHA256=89fa920185637255bbb75fd58528ebaead785da04e4763f8710991aa5ffb037f

## Upscale currently in progress
ElevenLabs account: ElevenLabs (previously selected).
Flow: he1PW0R50HT7XSdngzvh
Input asset: guzNfCmPJPc7ff0xEBms
Node: A95BmuCLIiyFvFZoQgyJ
Session: 8sLD9AlUEFaay3SKT7Cm
Generation: rHjJUfe9vigjH3CS58UL
Topaz Video Upscale v2: Proteus Natural, 2x, 30 fps.
Started once. Last result was still generating; do not start or charge another generation.

## Final export
prepare_native_overlay.py creates the approved timed editorial layer as a transparent 1080x1920 QTRLE MOV.
finalize_native_short.py combines the completed upscale, the transparent overlay and the approved AAC.
The finalizer checks 2201 decoded frames, 1080x1920 output, identical audio packet hash and full error-free decoding.
After export: review final shots, save the existing video/project Library identities with version guards, then upload the video to Gofile.

The global long-video capture approval remains false; this is a separate Short capture and does not approve unseen long-video outputs.
