# Active production notes

User goal: resume the exact Wolvesville EP2 branch/commit, finish actual Matches 6
and 7 with individual memories and OpenAI via Work, then produce and verify a
25+ minute episode in the original channel style. Preserve logs/checkpoints;
frequent commits. Do not finish the task with an unrendered or incomplete claim.

Workspace: `/workspace/wolvesville`, repository Felipe9272727/B-ias-magras-, branch
`codex/wolvesville-ep2-16p-20261031`. Base `1f32c14c801b40ab3c48e3604190d769012045a7`.
The environment initially had no checkout; clone and snapshot restore succeeded.

IMPORTANT discovery: the base compressed checkpoint was ahead of its status note.
Match 5 has 16 reflections and is unchanged (SHA 8f503af30b637a1fcdf2efa8a5409dc7ffa45557e538f21b2212e7ee1af81cc8).
Match 6 originally had SEVENTEEN received decisions, not eight. Florista's
authorized retry was already completed (`gen-1793495615-PaNfySrSiOhzoXphMio0`).
No new Florista retry was made. Prior uncertain attempt reserve is retained.

Actual Match 6 is running, seed 20308545. Match 7 seed pinned before outcome:
20316464 (existing 7919 sequence). Start 7 ONLY after 6 final log + all 16
reflections + memory are complete and checkpointed. Match 5 must never run again.
Read the live journal/partial log for progress; these notes are historical.

Engine had to pause at Moleiro's Night 2 observation: eight actual replies chose
an unavailable target. Two explicit identity migrations archive every previous
reply byte for byte, preserving seed/config/memory and all prior decisions.
Engine now permits 12 attempts: original first four unchanged, next four generic
validation feedback, last four explicit allowed/forbidden names derived from the
same prompt. The tenth actual attempt succeeded. All 14 engine tests passed after
each change. Migration evidence is in execucao6/migrations and the snapshot.
Do not undo migrations, overwrite replies or manufacture a choice.

The current engine was launched as an exec session with output appended to
`lobisomem/recovery/match6_20261101.log`. Query processes/journals before starting
another. Debug log includes deterministic recovery output; canonical journal is
the source. Existing responses are reused during recovery, never reinferred.

Connected-tool dispatcher source: `recovery/runtime_driver_20261101.js`. It is
evaluated inside an async function in functions.exec (tools/store/notify globals),
NOT as a standalone Node script. The functions store `driver` contains the latest
version; reload file if necessary. Run with:
`await eval('(async()=>{'+load('driver')+'})()')`.
It reserves pending OR requests, preserves dispatch markers, sends actual model
calls, installs original receipts, queries actual generation cost, checkpoints
and pushes each response. Independent votes are batched up to 16, git mutations
are serialized. A running functions cell must be waited to completion before
starting another dispatcher. Do NOT manually commit/push while it is active.
It stops for Work requests or after ~180 seconds. Never rerun an uncertain call.

The user explicitly authorized the TWO isolated Work agents in this conversation.
Viajante is existing agent `/root/viajante`, actual gpt-6.1-terra, low effort,
fork_turns none. Wake it with collaboration.followup_task when its own request is
pending. It only reads req_work/viajante and installs its own actual reply through
work_answer_ep2.py. Its context contains no other players' secrets. Astrônoma
(gpt-6-luna) has not been spawned yet; she died N1, but will need her real reflection
and Match 7 play. Spawn isolated with same constraints, correct model/ID. No other
subagents are authorized. `runtime_io_ep2.py work` lists new Work requests.

Ledger max $2. 85 previously unpriced completed generations were queried and
actual costs applied with price_receipts_ep2.py; no uncertain reserves released.
New dispatches query get_generation and save cost receipts. Remote verification
requires checkpointing any changed completed ledger entries before further calls.
Use checkpoint_ep2.py --push between dispatcher sessions. Shell git push works.

Recovered media: opening MP3 is original, hash 226b033811ab6838f2e9eb98ed1f58ec63750c8f558c4a13c69d8e13133063e3,
duration 26.906122. Existing ElevenLabs flow AEfkSqKr7qhVDiWL0Woe also had 14
completed Match 5 audio takes and word transcripts, beyond stale repo docs.
All recovered without generation; 93 exact prompt+voice matches, alignment 1.0.
Assets/provenance committed under public/voice_lobo_ep2/recovered_p5 and scenes.
Splitting utility: video/scripts/recover_ep2_speech.py. P5 thought echo generated
with original builder. Eight original music tracks recovered and committed.
Both ElevenLabs links access the same original flow; Primary link used:
link_6ae50a883c288191b0f2a481630e9d38. No new speech generated this turn.

Read skills: cloud-environment-runtime and ElevenLabs creative-studio. Network
unrestricted via existing proxy; no API keys configured or read. Use connected
ElevenLabs tools for new speech. Recover media before generating replacements.
Original voices and opening provenance in public/voice_lobo_ep2/*.json.

Renderer dependencies npm ci installed. ffmpeg and chromium available. Typecheck
Episodio2.tsx passed. Existing components preserve Poppins, pink/blue palette,
4x4 avatars, right-side chat, memes, transitions, role reveals. No emojis, no
lobby transitions, normal voices with echo for thoughts. CLAUDE.md requires Haiku
review from frames + speech every ~30 sec before delivery; fix weak segments.
OpenRouter send_batch supports arbitrary multimodal message bodies, so Haiku
visual review can use data URL JPEGs in batches (max 8MB); do not pretend text-only
reviews inspected images. Keep review within budget and preserve receipts.

P5 original script has 35 scenes, 93 voice clips, 19.28 minutes with padding.
CHAPTERS was missing; added it and built timeline_lobo_ep2_p5.json. This is a
prepared chapter, NOT a final rendered episode. Will likely need a tighter P5
selection so all three games fit 25–35 min (target 28–32). All quoted lines/thoughts
must remain exact excerpts; common helper verifies sources. Narration humor must
refer to actual events, use existing channel examples. Best ending last when
consistent with memory continuity. Do not create new game dialogue.

After actual gameplay: run juiz_ep2.mjs for 6/7 via same transport (5 already has
a real judge output), write final script using common helpers, generate missing
voices with original IDs, obtain word timings, build timeline, mix original music
by mood with ducking, render 540p then Lanczos upscale to 1080p, review frames/audio,
fix, full decode and verify export. video/scripts/verify_wolvesville_ep2.py was
prepared (not yet used on a final file) to enforce real matches, original archives,
opening, duration, 1080p and full audio/video decode. Final video does NOT exist.
