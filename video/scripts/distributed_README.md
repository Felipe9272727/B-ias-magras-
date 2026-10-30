# Native Minecraft replay farm

This workflow captures the recorded world with the real Java 1.21.4 client. It first verifies an explicitly reviewed source/settings profile and captures three short smoke windows. Only a successful smoke capture opens the capture matrix (1–16 workers). Full montage rendering uses seven bounded parts, then joins and upscales the silent movie to 1080p. Preview uses one capture worker and one render worker.

After visually reviewing empty hands, held items and motion for the current source/settings:

```sh
python video/scripts/distributed_pipeline.py approve --empty-hand --held-item --motion
python video/scripts/distributed_pipeline.py plan --mode preview --output /tmp/mc-plan
```

Push to a **new** `codex/minecraft-*` branch to start the profile's `launch_mode` and `workers`. Existing branches need no changes. `workflow_dispatch` also supports preview/full, worker count and comma-separated scene IDs once the workflow is available there. A newer push on the same branch cancels the older run; use separate branches for independent experiments.

All workers check out the triggering SHA. Runtime, clips and verified GIF assets are cached; capture source or speed/settings changes invalidate approval and cached clips. The original source-controlled world backup, recording and six skins are required. GIF package URLs are public and pinned to commit a1b99e31eb7286d1aebaaf5afa61e4aa46cdef10; every part is checked against its Git blob hash. Helpers perform no Git writes.

Artifacts retained for one day include smoke clips/logs, all native scene clips, render parts, and `mc-video-silent-preview` or `mc-video-silent-full`. The original audio is intentionally absent. Download the full silent video and mux the exact original audio locally; preview/filtered timelines are shorter and require separate audio editing. `timeline.json` records frame count, source/plan hashes and final movie SHA-256. Full original mode adds the original three-frame tail pad.

For a local capture test, first build a shared runtime with `distributed_worker.py build --work /tmp/mc-build --output /tmp/mc-runtime.tar.gz`, then run `MC_DISPLAY=114 python video/scripts/distributed_worker.py capture --runtime /tmp/mc-runtime.tar.gz --work /tmp/mc-smoke --scenes /tmp/mc-plan/smoke.txt --output /tmp/mc-smoke-clips`. Use a fresh work directory and free display number.

Hosted capacity and queues are controlled by GitHub. The matrices request parallel jobs, not persistent machines or guaranteed capacity. Standard public Ubuntu runners have 4 vCPUs and 16 GB RAM; GitHub Free nominal concurrency is 20 and hosted jobs have a six-hour maximum. See the [official runner specifications](https://docs.github.com/en/actions/reference/runners/github-hosted-runners) and [Actions limits](https://docs.github.com/en/actions/reference/limits). No hosted benchmark is implied by the planner's estimated capture work.
