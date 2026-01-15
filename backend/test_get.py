import urllib.request

BASE_URL = "http://127.0.0.1:8000"

def get_cats():
    url = f"{BASE_URL}/categories/"
    req = urllib.request.Request(url, method='GET')
    try:
        with urllib.request.urlopen(req) as f:
            print(f"GET Status: {f.status}")
            print(f"Body: {f.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"Failed GET: {e.code} {e.read().decode('utf-8')}")
    except urllib.error.URLError as e:
        print(f"Connection failed: {e.reason}")

if __name__ == "__main__":
    get_cats()
