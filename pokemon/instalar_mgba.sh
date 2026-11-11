#!/bin/bash
# Compila o mGBA 0.10.3 com os bindings Python (a versão de desenvolvimento quebra os bindings). ~5 min em 4 núcleos.
# Uso: bash pokemon/instalar_mgba.sh  ->  export PYTHONPATH=/opt/mgba/build/python/lib.linux-x86_64-cpython-3XX
set -e
SU=$(command -v sudo || true)
$SU apt-get update -qq > /dev/null 2>&1 || true
$SU apt-get install -y -qq cmake libpng-dev zlib1g-dev libffi-dev libsqlite3-dev pkg-config libavcodec-dev libavformat-dev libavutil-dev libswscale-dev libswresample-dev libavfilter-dev > /dev/null
pip install -q cffi cached_property numpy pillow
[ -d /opt/mgba ] || $SU git clone -q --depth 1 -b 0.10.3 https://github.com/mgba-emu/mgba.git /opt/mgba
$SU chown -R "$(id -u)" /opt/mgba
# compila de novo se a compilação anterior saiu sem os bindings funcionando
ls /opt/mgba/build/python/lib.linux-*/mgba/_pylib*.so >/dev/null 2>&1 && python3 -c "import sys; sys.path.insert(0, __import__('glob').glob('/opt/mgba/build/python/lib.linux-*')[0]); import mgba.core" 2>/dev/null && exit 0
rm -rf /opt/mgba/build
mkdir -p /opt/mgba/build && cd /opt/mgba/build
cmake .. -DBUILD_PYTHON=ON -DBUILD_QT=OFF -DBUILD_SDL=OFF -DCMAKE_BUILD_TYPE=Release > /dev/null
make -j"$(nproc)" > /dev/null
ls -d /opt/mgba/build/python/lib.linux-*
