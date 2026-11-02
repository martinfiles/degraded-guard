"""Ejecuta TLC sobre una config y exporta el contraejemplo como JSON (spec/traces/<cfg>.json)."""
import json, re, subprocess, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
cfg = sys.argv[1]
out = subprocess.run(["java", "-XX:+UseParallelGC", "-cp", str(root/"tools/tla2tools.jar"), "tlc2.TLC",
    "-config", f"{cfg}.cfg", "-deadlock", "DegradedMode.tla"], cwd=root/"spec", capture_output=True, text=True).stdout.replace(chr(13)+chr(10), chr(10))
states = []
for m in re.finditer(r"State (\d+): <(\w+)[^>]*>\n((?:/\\ .*\n?)+)", out):
    body = m.group(3)
    def rec(name):
        r = re.search(rf"/\\ {name} = \[(.*?)\]", body).group(1)
        return {k: v for k, v in re.findall(r'(\w+) \|-> ("?\w+"?)', r)}
    conv = lambda v: True if v == "TRUE" else False if v == "FALSE" else int(v) if v.isdigit() else v.strip('"')
    states.append({"step": int(m.group(1)), "action": m.group(2),
        "pos": {k: conv(v) for k, v in rec("pos").items()},
        "moving": {k: conv(v) for k, v in rec("moving").items()},
        "auth": {k: conv(v) for k, v in rec("auth").items()},
        "lzb": "lzb = TRUE" in body})
(root/"spec/traces").mkdir(exist_ok=True)
(root/f"spec/traces/{cfg}.json").write_text(json.dumps({"config": cfg, "n": 6, "states": states}, indent=2))
print(f"{cfg}: {len(states)} estados exportados")
