"""Build the client-only native replay mod using the installed 1.21.4 client.

python build.py CLIENT_DIRECTORY OUTPUT_JAR [BUILD_CACHE]
Requires Java/JDK 21; downloads only published Fabric mapping/build artifacts.
"""
import sys,subprocess,urllib.request,zipfile,shutil,os
from pathlib import Path

client=Path(sys.argv[1]).resolve();output=Path(sys.argv[2]).resolve()
cache=Path(sys.argv[3]).resolve() if len(sys.argv)>3 else output.parent/'native-build'
cache.mkdir(parents=True,exist_ok=True);source=Path(__file__).parent
for name,url in {
    'remapper.jar':'https://maven.fabricmc.net/net/fabricmc/tiny-remapper/0.10.4/tiny-remapper-0.10.4-fat.jar',
    'intermediary.jar':'https://maven.fabricmc.net/net/fabricmc/intermediary/1.21.4/intermediary-1.21.4.jar'
}.items():
    path=cache/name
    if not path.exists():
        with urllib.request.urlopen(url,timeout=120) as r,path.open('wb') as f:shutil.copyfileobj(r,f)
mapping=cache/'intermediary.tiny'
with zipfile.ZipFile(cache/'intermediary.jar') as z:mapping.write_bytes(z.read('mappings/mappings.tiny'))
game=None
for p in (client/'versions').rglob('*.jar'):
    with zipfile.ZipFile(p) as z:
        if 'net/minecraft/client/main/Main.class' in z.namelist():game=p;break
if game is None:raise RuntimeError('Minecraft client jar not found')
mapped=cache/'minecraft-intermediary.jar'
if not mapped.exists():subprocess.run(['java','-Xmx1500M','-jar',str(cache/'remapper.jar'),str(game),str(mapped),str(mapping),'official','intermediary','--ignoreConflicts'],check=True)
classes=cache/'classes'
if classes.exists():shutil.rmtree(classes)
classes.mkdir()
classpath=[mapped]+list((client/'libraries').rglob('*.jar'))
subprocess.run(['javac','-proc:none','--release','21','-cp',os.pathsep.join(map(str,classpath)),'-d',str(classes)]+[str(p) for p in (source/'src').rglob('*.java')],check=True)
output.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as z:
    for p in classes.rglob('*.class'):z.write(p,p.relative_to(classes))
    for p in (source/'resources').iterdir():z.write(p,p.name)
with output.open('rb+') as f:os.fsync(f.fileno())
print('Native replay mod built:',output,flush=True)
