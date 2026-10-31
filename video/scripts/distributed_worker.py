"""Build one shared runtime, then capture a scene list in an isolated runner."""
import argparse
import json
import os
import re
from pathlib import Path
import shutil
import signal
import subprocess
import tarfile
import time

from distributed_pipeline import ROOT, PROFILE, validate


def build(args):
    runtime = Path(args.work).resolve()
    client, server = runtime / 'client', runtime / 'server'
    runtime.mkdir(parents=True, exist_ok=True)
    profile = json.loads(PROFILE.read_text())
    env = dict(os.environ, MC_DIR=str(client), SRV_DIR=str(server), NODE_DIR=str(ROOT / 'minecraft'))
    subprocess.run(['bash', str(ROOT / 'video/scripts/distributed_client_setup.sh')], env=env, check=True)
    version = f"fabric:{profile['minecraft_version']}:{profile['fabric_loader']}"
    subprocess.run(['portablemc', '--main-dir', str(client), 'start', '--dry', version], check=True)
    skins = client / 'CustomSkinLoader/LocalSkin/skins'
    skins.mkdir(parents=True, exist_ok=True)
    for skin in (ROOT / 'minecraft/skins').glob('*.png'):
        shutil.copy2(skin, skins / skin.name)
    if len(list(skins.glob('*.png'))) < 6:
        raise ValueError('Missing source-controlled player skins')
    options = client / 'options.txt'
    options.write_text(options.read_text().replace('renderDistance:8', 'renderDistance:6').replace('simulationDistance:6', 'simulationDistance:4'))
    subprocess.run(['python', str(ROOT / 'minecraft/cliente-replay/build.py'), str(client),
                    str(client / 'mods/bias-replay-native.jar'), str(runtime / 'buildcache')], check=True)
    output = Path(args.output).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    with tarfile.open(output, 'w:gz', compresslevel=1) as archive:
        for folder in (client, server):
            archive.add(folder, arcname=folder.name)
    print('Shared runtime:', output, flush=True)


def wait_log(path, phrase, process, seconds=300):
    end = time.monotonic() + seconds
    while time.monotonic() < end:
        if Path(path).exists() and phrase in Path(path).read_text(errors='replace'):
            return
        if process.poll() is not None:
            raise RuntimeError(f'Process exited before {phrase}: {path}')
        time.sleep(1)
    raise TimeoutError(f'Timed out waiting for {phrase}: {path}')


def capture(args):
    work = Path(args.work).resolve()
    work.mkdir(parents=True, exist_ok=True)
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    logs = work / 'logs'
    logs.mkdir(exist_ok=True)
    with tarfile.open(args.runtime) as archive:
        archive.extractall(work, filter='data')
    client, server = work / 'client', work / 'server'
    backup = ROOT / 'minecraft/backup'
    with tarfile.open(backup / 'partida1_mundo.tar.gz') as archive:
        archive.extractall(server, filter='data')
    if not (server / 'mundo/level.dat').exists():
        raise ValueError('World backup must contain mundo/level.dat')
    recording_root = work / 'recording'
    recording_root.mkdir(exist_ok=True)
    with tarfile.open(backup / 'partida1_gravacao.tar.gz') as archive:
        archive.extractall(recording_root, filter='data')
    # Logs may be in chunks; find their common recording root, not the chunk folder.
    candidates = list(recording_root.rglob('eventos.jsonl'))
    if not candidates:
        candidates = list(recording_root.rglob('eventos*.jsonl'))
    if not candidates:
        raise ValueError('Recording backup has no event log')
    recording = candidates[0].parent
    if recording.name == 'chunks':
        recording = recording.parent
    # Standard original backup contains gravacoes/partida1/chunks plus metadata.
    roots = list(recording_root.glob('**/partida1'))
    if len(roots) == 1:
        recording = roots[0]
    (server / 'server.properties').write_text('\n'.join([
        'online-mode=false', 'enable-rcon=true', 'rcon.password=ias_local', 'rcon.port=25575',
        'server-ip=127.0.0.1', 'server-port=25565', 'level-name=mundo', 'spawn-protection=0',
        'view-distance=6', 'simulation-distance=4', 'allow-flight=true', 'max-players=20',
        'gamemode=spectator', 'difficulty=easy', 'enforce-secure-profile=false',
        'network-compression-threshold=-1']) + '\n')
    (server / 'eula.txt').write_text('eula=true\n')
    display = int(os.environ.get('MC_DISPLAY', '99'))
    if not 1 <= display <= 999:
        raise ValueError('MC_DISPLAY must be 1..999')
    framebuffer = work / 'framebuffer'
    framebuffer.mkdir(exist_ok=True)
    native_scene = work / 'scene.native.json'
    profile = json.loads(PROFILE.read_text())
    width = int(profile['capture_env'].get('LARG', '960'))
    height = int(profile['capture_env'].get('ALT', '540'))
    if not (64 <= width <= 3840 and 64 <= height <= 3840):
        raise ValueError('Invalid capture viewport')
    options = client / 'options.txt'
    text = options.read_text()
    for key, value in [('overrideWidth', width), ('overrideHeight', height), ('hideGui', 'false')]:
        text = re.sub(rf'^{key}:.*$', f'{key}:{value}', text, flags=re.MULTILINE)
    options.write_text(text)
    env = dict(os.environ, **profile['capture_env'])
    env.update(DISPLAY=f'localhost:{display}', FRAMEBUFFER=str(framebuffer / 'Xvfb_screen0'),
               MUNDO=str(server / 'mundo'), NATIVE_SCENE=str(native_scene),
               LIBGL_ALWAYS_SOFTWARE='1', GALLIUM_DRIVER='llvmpipe')
    processes, handles = [], []

    def launch(argv, name, cwd=None):
        handle = (logs / (name + '.log')).open('w')
        handles.append(handle)
        process = subprocess.Popen(argv, cwd=cwd, env=env, stdout=handle, stderr=subprocess.STDOUT, start_new_session=True)
        processes.append(process)
        return process

    try:
        xvfb = launch(['Xvfb', f':{display}', '-screen', '0', f'{width}x{height}x24', '-listen', 'tcp',
                       '-nolisten', 'unix', '-ac', '-extension', 'MIT-SHM', '-fbdir', str(framebuffer)], 'xvfb')
        time.sleep(2)
        if xvfb.poll() is not None:
            raise RuntimeError('Xvfb failed; choose a free MC_DISPLAY')
        srv = launch(['java', '-Xmx1500M', '-XX:ActiveProcessorCount=2', '-jar', 'server.jar', 'nogui'], 'server', server)
        wait_log(logs / 'server.log', 'RCON running', srv)
        version = f"fabric:{profile['minecraft_version']}:{profile['fabric_loader']}"
        cli = launch(['portablemc', '--main-dir', str(client), 'start', version,
                      '--fetch-exclude-all', '-u', 'Camera', '--join-server', '127.0.0.1', '--resolution', f'{width}x{height}',
                      '--jvm-arg=-Xmx2500M', '--jvm-arg=-XX:ActiveProcessorCount=2',
                      '--jvm-arg=-Dbias.replay.native=true', '--jvm-arg=-Dbias.replay.scene=' + str(native_scene)], 'client', client)
        wait_log(logs / 'server.log', 'Camera joined', srv)
        if cli.poll() is not None:
            raise RuntimeError('Minecraft client exited')
        time.sleep(6)
        subprocess.run(['node', '--input-type=module', '-e',
            "import {rcon} from './rcon.mjs'; const c=rcon(); await c('gamemode spectator Camera'); process.exit(0)"],
            cwd=ROOT / 'minecraft', env=env, check=True, timeout=30)
        replacements = dict(recording=str(recording), scenes=str(Path(args.scenes).resolve()), output=str(output))
        command = [arg.format(**replacements) for arg in profile['capture_command']]
        with (logs / 'capture.log').open('w') as handle:
            subprocess.run(command, cwd=ROOT / 'minecraft', env=env, stdout=handle, stderr=subprocess.STDOUT, check=True, timeout=10800)
        validate(args.scenes, output)
    finally:
        for process in reversed(processes):
            if process.poll() is None:
                os.killpg(process.pid, signal.SIGTERM)
        for process in reversed(processes):
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                os.killpg(process.pid, signal.SIGKILL)
                process.wait()
        for handle in handles:
            handle.close()


def main():
    parser = argparse.ArgumentParser(__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    p = commands.add_parser('build')
    p.add_argument('--work', required=True)
    p.add_argument('--output', required=True)
    p = commands.add_parser('capture')
    for key in ('runtime', 'work', 'scenes', 'output'):
        p.add_argument('--' + key, required=True)
    args = parser.parse_args()
    (build if args.command == 'build' else capture)(args)


if __name__ == '__main__':
    main()
