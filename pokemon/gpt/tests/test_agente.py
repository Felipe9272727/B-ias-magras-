"""Testes de contrato; execute: python -m unittest discover -s tests -v."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest

ROOT = Path(__file__).resolve().parents[1]
MOCK = Path(__file__).resolve().parent / "mock_env"
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(MOCK))

import agente as a
from ambiente_firered import FireRed


class ContractTests(unittest.TestCase):
    def test_memory_and_navigation(self):
        env = FireRed()
        agent = a.Agent(42)
        obs = a.observe(env, agent.reader)
        self.assertEqual(len(obs.flags), 288)
        layout = agent.reader.layout(env, obs)
        self.assertIsNotNone(layout)
        self.assertEqual(layout[0:2], (8, 8))
        self.assertIn((6, 6), layout[4])
        agent.world.seed(obs)
        for _ in range(1200):
            action = agent.choose(env, obs)
            agent.act(env, action)
            new = a.observe(env, agent.reader)
            agent.update(obs, action, new)
            obs = new
        self.assertEqual(len(agent.world.maps), 2)
        self.assertGreater(len(agent.world.edges), 10)
        self.assertGreater(agent.learner.updates, 1200)
        self.assertGreater(obs.badges, 0)

    def test_no_ram_fallback(self):
        env = FireRed()
        env.ram = lambda *_: (_ for _ in ()).throw(ValueError("indisponível"))
        reader = a.MemoryReader()
        obs = a.observe(env, reader)
        self.assertEqual(obs.flags, b"")
        self.assertIsNone(reader.layout(env, obs))
        env.battle = True
        self.assertEqual(a.observe(env, reader).combat, ())

    def test_empty_party_and_species_names(self):
        env = FireRed()
        original = env.info
        env.info = lambda: dict(original(), time=[])
        reader = a.MemoryReader()
        obs = a.observe(env, reader)
        self.assertEqual(obs.party, ())
        self.assertEqual(obs.hp, 0)
        info = original()
        info["time"][0]["especie"] = "Bulbasaur"
        env.info = lambda: info
        self.assertEqual(a.observe(env, reader).party[0][0], "Bulbasaur")

    def test_pulses_and_exact_frame_limit(self):
        env = FireRed()
        agent = a.Agent()
        self.assertEqual(agent.act(env, 4), 24)
        self.assertEqual(agent.act(env, 4), 48)
        self.assertEqual(agent.act(env, 4, remaining=24), 24)
        self.assertEqual(env.quadro, 96)

    def test_key_item_changes_progress_without_flags(self):
        env = FireRed()
        reader = a.MemoryReader()
        old = a.observe(env, reader)
        env.key_item = 349
        new = a.observe(env, reader)
        self.assertEqual(old.flags, new.flags)
        self.assertNotEqual(old.quest, new.quest)

    def test_atomic_checkpoint_fallback(self):
        with tempfile.TemporaryDirectory() as td:
            a.atomic_save(Path(td) / "worker_0.0.pkl.gz", {"format": a.FORMAT, "generation": 2})
            Path(td, "worker_0.1.pkl.gz").write_bytes(b"interrompido")
            self.assertEqual(a.latest_worker(0, td)["generation"], 2)

    def test_learns_rewarding_action(self):
        learner = a.Learner(12)
        for _ in range(100):
            for action in range(9):
                learner.learn(("menu",), action, 1.0 if action == 3 else -1.0, ("fim",), True)
        self.assertEqual(int(learner.values(("menu",)).argmax()), 3)

    def test_temporary_block_does_not_trap_path(self):
        env = FireRed()
        agent = a.Agent(4)
        obs = a.observe(env, agent.reader)
        agent.world.edges[obs.pos] = {0: (1, 0, 2, 1)}
        agent.world.failures[(obs.pos, obs.quest, 0)] = 4
        path = agent.nav.plan(obs, agent.world, None, {})
        self.assertFalse(path and path[0][1] == 0)

    def test_events(self):
        env = FireRed()
        reader = a.MemoryReader()
        with tempfile.TemporaryDirectory() as td:
            path = Path(td, "log.jsonl")
            logger = a.EventLogger(path)
            before = a.observe(env, reader)
            logger.update(None, before, "começar")
            env.battle = True
            after = a.observe(env, reader)
            logger.update(before, after, "lutar")
            before = after
            env.battle = False
            env.badges = 1
            env.caught = 2
            env.level = 6
            after = a.observe(env, reader)
            logger.update(before, after, "ganhar")
            before = after
            env.hp = 0
            logger.update(before, a.observe(env, reader), "resistir")
            logger.close()
            rows = [json.loads(line) for line in path.read_text().splitlines()]
            self.assertEqual({r["evento"] for r in rows}, {"mapa_novo", "batalha_comecou",
                             "batalha_terminou", "captura", "insignia", "subiu_de_nivel", "time_desmaiou"})
            self.assertTrue(all({"quadro", "evento", "mapa", "x", "y", "intencao"} <= r.keys() for r in rows))

    def test_training_resume_and_final_never_loads_states(self):
        with tempfile.TemporaryDirectory() as td:
            folder = Path(td, "checkpoint")
            environ = dict(os.environ, PYTHONPATH=os.pathsep.join((str(MOCK), str(ROOT))), TEMPO_LIMITE_S="5")
            command = [sys.executable, str(ROOT / "agente.py"), "treinar", "--workers", "4", "--checkpoint", str(folder)]
            started = time.monotonic()
            run = subprocess.run(command, env=environ, cwd=td, capture_output=True, text=True, timeout=12)
            self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
            self.assertLess(time.monotonic() - started, 7)
            first = a.latest_worker(0, folder)
            self.assertIsNotNone(first)
            first_actions = first["agent"].actions
            first_generation = first["generation"]
            self.assertGreater(first_actions, 0)
            for worker in range(4):
                self.assertGreater(a.latest_worker(worker, folder)["agent"].actions, 0)
            run = subprocess.run(command, env=environ, cwd=td, capture_output=True, text=True, timeout=12)
            self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
            second = a.latest_worker(0, folder)
            self.assertGreater(second["agent"].actions, first_actions)
            self.assertGreater(second["generation"], first_generation)
            self.assertGreater(second["seconds"], first["seconds"])
            # Jogar com import sem módulos/classes __main__ e sem load_state.
            environ["FORBID_LOAD_STATE"] = "1"
            program = "import agente; from pathlib import Path; agente.CHECKPOINT=Path('checkpoint'); agente.play(24000)"
            run = subprocess.run([sys.executable, "-c", program], env=environ, cwd=td,
                                 capture_output=True, text=True, timeout=20)
            self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
            rows = [json.loads(line) for line in Path(td, "log.jsonl").read_text().splitlines()]
            self.assertEqual(rows[0]["quadro"], 0)
            self.assertEqual(rows[-1]["evento"], "fim")
            self.assertEqual(rows[-1]["quadros_jogados"], 24000)
            self.assertLessEqual(max(r["quadro"] for r in rows), 24000)


if __name__ == "__main__":
    unittest.main()
