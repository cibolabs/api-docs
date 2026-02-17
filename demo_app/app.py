import os
import base64
import time
import threading
import requests
from flask import Flask, jsonify, send_from_directory, request, Response
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='')

# Use a session for connection pooling (Keep-Alive)
session = requests.Session()
# Increase pool size to handle concurrent tile requests
adapter = requests.adapters.HTTPAdapter(pool_connections=20, pool_maxsize=50)
session.mount('https://', adapter)

# Credentials from environment variables
CLIENT_ID = os.environ.get('CIBO_CLIENT_ID')
CLIENT_SECRET = os.environ.get('CIBO_CLIENT_SECRET')
TOKEN_URL = "https://login.cibolabs.com/oauth2/token"

if not CLIENT_ID or not CLIENT_SECRET:
    print("Warning: CIBO_CLIENT_ID or CIBO_CLIENT_SECRET not set in environment or .env file.")

class TokenManager:
    def __init__(self):
        self._access_token = None
        self._expires_at = 0
        self._lock = threading.Lock()

    def get_token(self):
        # Check if token is valid with a 60-second buffer
        if self._access_token and time.time() < self._expires_at - 60:
            return {'access_token': self._access_token}

        with self._lock:
            # Double-check inside lock to prevent race conditions
            if self._access_token and time.time() < self._expires_at - 60:
                return {'access_token': self._access_token}
            
            return self._refresh_token()

    def _refresh_token(self):
        # Encode credentials
        credentials = f"{CLIENT_ID}:{CLIENT_SECRET}"
        encoded_credentials = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')

        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {encoded_credentials}"
        }
        data = {
            "grant_type": "client_credentials"
        }

        # Use session
        response = session.post(TOKEN_URL, headers=headers, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        self._access_token = token_data.get('access_token')
        # Default to 3600 seconds (1 hour) if expires_in is missing
        expires_in = token_data.get('expires_in', 3600)
        self._expires_at = time.time() + expires_in
        
        return token_data

token_manager = TokenManager()

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/token')
def get_token():
    try:
        token_data = token_manager.get_token()
        return jsonify(token_data)
    except requests.exceptions.RequestException as e:
        print(f"Error fetching token: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/dates')
def get_dates():
    try:
        token_data = token_manager.get_token()
        token = token_data.get('access_token')
        
        response = session.get("https://data.afm.cibolabs.com/getimagedates", headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        })
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error fetching dates: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/stats', methods=['POST'])
def get_stats():
    try:
        token_data = token_manager.get_token()
        token = token_data.get('access_token')
        
        # Forward query parameters
        params = request.args
        
        # Forward JSON body
        geojson = request.json
        
        response = session.post("https://data.afm.cibolabs.com/gettsdmstats", 
            params=params,
            json=geojson,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        )
        if response.status_code != 200:
            print(f"DEBUG: API Error {response.status_code}: {response.text}")
            return jsonify({"error": "Upstream API Error", "details": response.text}), response.status_code
            
        data = response.json()
        return jsonify(data)
    except requests.exceptions.RequestException as e:
        print(f"Error fetching stats: {e}")
        # Return the content of the error response if available
        if e.response is not None:
             return jsonify({"error": str(e), "details": e.response.text}), e.response.status_code
        return jsonify({"error": str(e)}), 500

# Pasture Key Proxies
PK_DATA_URL = "https://data.pasturekey.cibolabs.com"

@app.route('/pk/dates/<property_id>')
def get_pk_dates(property_id):
    try:
        token_data = token_manager.get_token()
        token = token_data.get('access_token')
        
        response = session.get(f"{PK_DATA_URL}/getimagedates/{property_id}", headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        })
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error fetching PK dates: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/pk/geom/<property_id>', methods=['POST'])
def get_pk_geom(property_id):
    try:
        token_data = token_manager.get_token()
        token = token_data.get('access_token')
        
        # /geom is POST
        response = session.post(f"{PK_DATA_URL}/geom/{property_id}", headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        })
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error fetching PK geom: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/pk/stats/<property_id>', methods=['POST'])
def get_pk_stats(property_id):
    try:
        token_data = token_manager.get_token()
        token = token_data.get('access_token')
        params = request.args
        
        response = session.post(f"{PK_DATA_URL}/gettsdmstats/{property_id}", 
            params=params,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json"
            }
        )
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error fetching PK stats: {e}")
        return jsonify({"error": str(e)}), 500

# Tile Proxies to avoid CORS
@app.route('/proxy/tiles/afm/<path:subpath>')
def proxy_afm_tiles(subpath):
    try:
        token_data = token_manager.get_token()
        token = token_data.get('access_token')
        
        url = f"https://tiles.afm.cibolabs.com/{subpath}"
        # Fetch the image stream
        response = session.get(url, headers={
            "Authorization": f"Bearer {token}",
            "Accept": "image/png"
        }, stream=True)
        
        # Stream back to client
        return Response(response.iter_content(chunk_size=1024), 
                        status=response.status_code, 
                        content_type=response.headers.get('Content-Type', 'image/png'))
    except Exception as e:
        print(f"Error proxying AFM tile: {e}")
        return str(e), 500

@app.route('/proxy/tiles/pk/<path:subpath>')
def proxy_pk_tiles(subpath):
    try:
        token_data = token_manager.get_token()
        token = token_data.get('access_token')
        
        url = f"https://tiles.pasturekey.cibolabs.com/{subpath}"
        response = session.get(url, headers={
            "Authorization": f"Bearer {token}",
            "Accept": "image/png"
        }, stream=True)
        
        return Response(response.iter_content(chunk_size=1024), 
                        status=response.status_code, 
                        content_type=response.headers.get('Content-Type', 'image/png'))
    except Exception as e:
        print(f"Error proxying PK tile: {e}")
        return str(e), 500

if __name__ == '__main__':
    # threaded=True enables multiple threads for handling concurrent requests
    app.run(debug=True, port=8000, threaded=True)
