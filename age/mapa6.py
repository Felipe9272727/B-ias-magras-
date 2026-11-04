import json,sys
CIVS=['brit','gaul','rome','athen','spart','iber']
CORES=[(220,40,40),(40,90,230),(240,200,30),(40,170,60),(150,60,200),(240,130,30)]
def cfg(seed=7,size=320,mapa='mainland'):
    pd=[{"Name":f"P{i+1}","Civ":CIVS[i],"Color":dict(zip('rgb',CORES[i])),"AI":"","AIDiff":3,"AIBehavior":"random","Team":-1} for i in range(6)]
    return json.dumps({"settings":{"VictoryConditions":["conquest"],"TriggerScripts":["scripts/TriggerHelper.js","scripts/ConquestCommon.js","scripts/Conquest.js"],"Name":"Mainland","Script":f"{mapa}.js","Biome":"generic/temperate","CircularMap":True,"mapType":"random","Seed":seed,"AISeed":seed,"CheatsEnabled":False,"Ceasefire":0,"Size":size,"PopulationCap":150,"StartingResources":300,"PlayerData":pd},"mapType":"random","map":f"maps/random/{mapa}","script":f"{mapa}.js","gameSpeed":1})
if __name__=='__main__': print(cfg())
