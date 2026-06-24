#!/usr/bin/env python3
# Polls a Veo long-running operation and downloads the resulting video.
#   GOOGLE_API_KEY=... VEO_OP=models/.../operations/xxx python3 scripts/veo-poll.py
import json, os, time, urllib.request, urllib.error, sys

GK = os.environ["GOOGLE_API_KEY"]
op = os.environ.get("VEO_OP") or open("/tmp/veo-op.txt").read().strip()
OUT = "marketing/closehound-hook.mp4"


def get(url):
    return json.load(urllib.request.urlopen(urllib.request.Request(url), timeout=60))


def find_video(obj):
    """Recursively find a downloadable video uri or inline base64 in the response."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in ("uri", "videoUri") and isinstance(v, str) and "http" in v:
                return ("uri", v)
            if k in ("bytesBase64Encoded", "videoBytes") and isinstance(v, str) and len(v) > 1000:
                return ("b64", v)
            r = find_video(v)
            if r:
                return r
    elif isinstance(obj, list):
        for v in obj:
            r = find_video(v)
            if r:
                return r
    return None


for i in range(30):
    time.sleep(12)
    try:
        res = get(f"https://generativelanguage.googleapis.com/v1beta/{op}?key={GK}")
    except urllib.error.HTTPError as e:
        print("poll error", e.code, e.read().decode()[:200]); continue
    done = res.get("done", False)
    print(f"poll {i+1}: done={done}")
    if not done:
        continue
    if res.get("error"):
        print("RENDER FAILED:", json.dumps(res["error"])[:300]); sys.exit(1)
    found = find_video(res.get("response", res))
    if not found:
        print("done but no video found. keys:", list((res.get('response') or {}).keys()))
        open("/tmp/veo-result.json", "w").write(json.dumps(res)[:4000]); sys.exit(1)
    kind, val = found
    os.makedirs("marketing", exist_ok=True)
    if kind == "b64":
        import base64
        open(OUT, "wb").write(base64.b64decode(val))
    else:
        dl = val + (("&" if "?" in val else "?") + f"key={GK}")
        urllib.request.urlretrieve(dl, OUT)
    sz = os.path.getsize(OUT)
    print(f"DOWNLOADED ✓ {OUT} ({sz} bytes)")
    sys.exit(0)

print("timed out waiting for Veo render")
sys.exit(1)
