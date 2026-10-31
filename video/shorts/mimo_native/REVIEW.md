# MiMo Short — native portrait final delivered
Final video: https://gofile.io/d/hwX2IINk
Library video: libfile_8726def1efcc819195bd06f0846cafbd, version 3
Library project: libfile_07139767cd508191a240759dddb02058, version 3

## Verified final
2201 decoded frames, 30 fps, 73.3667 seconds, 1080x1920.
53,408,275 bytes.
SHA256: df78074b1abbcdcf289840d723e48554eb76ef841d8cd3519334e8b9b39d7449
Audio packets retained without re-encoding:
SHA256=89fa920185637255bbb75fd58528ebaead785da04e4763f8710991aa5ffb037f
Full error-free FFmpeg decoding completed. First, middle and last frames of all 18 blocks reviewed.
Native 720x1280 Minecraft viewport; no landscape crop. Vanilla arm/item projection adapted to portrait.
Opening uses the first 146 frames of vencedora_mimo at the same logged victory timestamp.

## Upscale completed
Model: Topaz Video Upscale v2 / Proteus Natural / 2x / 30 fps.
Output: 1440x2560, 73.366667s.
Flow: he1PW0R50HT7XSdngzvh
Generation: rHjJUfe9vigjH3CS58UL
One generation charged; completed successfully.

## Reproduce
Capture: https://github.com/Felipe9272727/B-ias-magras-/actions/runs/41161617678
Project ZIP contains the native capture master, completed upscale, transparent editorial layer,
approved AAC, timed script, assets, fonts and export scripts.
prepare_native_overlay.py creates a 1080x1920 transparent QTRLE MOV.
finalize_native_short.py encodes the video first and then muxes the entire approved AAC separately,
checking frame count, resolution, complete decoding and exact audio hash.

This separate Short capture does not approve unseen long-video outputs.
