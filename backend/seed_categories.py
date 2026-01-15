import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

categories = [
    {"name": "Alimentação", "type": "expense", "description": "Comida e supermercado"},
    {"name": "Habitação", "type": "expense", "description": "Renda e contas"},
    {"name": "Salário", "type": "income", "description": "Salário mensal"},
    {"name": "Lazer", "type": "expense", "description": "Cinema, jantar fora, etc"},
    {"name": "Saúde", "type": "expense", "description": "Farmácia e consultas"}
]

def seed():
    url = f"{BASE_URL}/categories/"
    for cat in categories:
        data = json.dumps(cat).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
        try:
            with urllib.request.urlopen(req) as f:
                print(f"Created: {cat['name']} - {f.status}")
        except urllib.error.HTTPError as e:
            print(f"Failed {cat['name']}: {e.code} {e.read().decode('utf-8')}")
        except urllib.error.URLError as e:
            print(f"Connection failed: {e.reason}")

if __name__ == "__main__":
    seed()
