from flask import Flask, request, jsonify, redirect, make_response, url_for
from authlib.integrations.flask_client import OAuth
from flask_cors import CORS
from flask_sock import Sock
import os, time, json, jwt

app = Flask(__name__)
app.secret_key = os.environ.get("APP_SECRET", "dev-secret")
FRONTEND = os.environ.get("FRONTEND_ORIGIN","http://localhost:5173")
CORS(app, supports_credentials=True, origins=[FRONTEND])

sock = Sock(app)
oauth = OAuth(app)

# --- OAuth providers (configure via env) ---
oauth.register(
    name="google",
    client_id=os.environ.get("GOOGLE_CLIENT_ID",""),
    client_secret=os.environ.get("GOOGLE_CLIENT_SECRET",""),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope":"openid email profile"}
)

oauth.register(
    name="facebook",
    client_id=os.environ.get("FB_CLIENT_ID",""),
    client_secret=os.environ.get("FB_CLIENT_SECRET",""),
    access_token_url="https://graph.facebook.com/v18.0/oauth/access_token",
    authorize_url="https://www.facebook.com/v18.0/dialog/oauth",
    api_base_url="https://graph.facebook.com",
    client_kwargs={"scope":"email,public_profile"}
)

oauth.register(
    name="x",
    client_id=os.environ.get("X_CLIENT_ID",""),
    client_secret=os.environ.get("X_CLIENT_SECRET",""),
    access_token_url="https://api.x.com/2/oauth2/token",
    authorize_url="https://twitter.com/i/oauth2/authorize",
    api_base_url="https://api.x.com/2/",
    client_kwargs={"scope":"tweet.read users.read offline.access"}
)

JWT_SECRET = os.environ.get("JWT_SECRET","jwt-dev")
COOKIE_NAME = "nexus_session"

def issue_cookie(user):
    payload = {"sub": user["id"], "name": user["name"], "email": user.get("email",""), "iat": int(time.time())}
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    resp = make_response(redirect(f"{FRONTEND}/auth/callback?ok=1"))
    resp.set_cookie(COOKIE_NAME, token, httponly=True, samesite="Lax", secure=False, path="/")
    return resp

def get_user_from_cookie():
    tok = request.cookies.get(COOKIE_NAME)
    if not tok: return None
    try:
        return jwt.decode(tok, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        return None

@app.get("/api/auth/login/<provider>")
def oauth_login(provider):
    client = oauth.create_client(provider)
    if not client: return ("Unknown provider", 404)
    redirect_uri = url_for("oauth_cb", provider=provider, _external=True)
    return client.authorize_redirect(redirect_uri)

@app.get("/api/auth/callback/<provider>")
def oauth_cb(provider):
    client = oauth.create_client(provider)
    token = client.authorize_access_token()
    if provider == "google":
        userinfo = client.parse_id_token(token)
        user = {"id": userinfo["sub"], "name": userinfo.get("name","User"), "email": userinfo.get("email","")}
    elif provider == "facebook":
        prof = client.get("me?fields=id,name,email").json()
        user = {"id": prof["id"], "name": prof.get("name","User"), "email": prof.get("email","")}
    else:
        user = {"id": token.get("access_token","x-user"), "name":"X User", "email":""}
    return issue_cookie(user)

@app.post("/api/auth/login/local")
def login_local():
    data = request.json or {}
    email = data.get("email","guest@nexus.ai")
    user = {"id": f"local:{email}", "name": email.split("@")[0].title(), "email": email}
    return issue_cookie(user)

@app.post("/api/auth/register/local")
def register_local():
    data = request.json or {}
    email = data.get("email","guest@nexus.ai")
    # In lieu of a real database, acknowledge the registration attempt.
    return jsonify({"ok": True, "email": email})

@app.post("/api/auth/forgot/local")
def forgot_local():
    data = request.json or {}
    email = data.get("email","guest@nexus.ai")
    # Pretend we dispatched a password reset email.
    return jsonify({"ok": True, "email": email})

@app.get("/api/auth/me")
def me():
    user = get_user_from_cookie()
    if not user: return (jsonify({"ok":False}), 401)
    return jsonify({"ok":True, "user": user})

@app.post("/api/auth/logout")
def logout():
    resp = make_response(jsonify({"ok":True}))
    resp.set_cookie(COOKIE_NAME, "", expires=0, path="/")
    return resp

@app.get("/api/system/capabilities")
def caps():
    return jsonify({
        "imageGen": True,
        "codeGen": True,
        "studyPacks": True,
        "modelCompare": True,
        "exportAudit": True,
        "exportEncryption": True
    })

# WebSocket streaming chat
@sock.route("/ws/chat")
def chat_ws(ws):
    user = get_user_from_cookie()
    if not user:
        ws.close(); return
    ws.send(json.dumps({"type":"hello","user":user["name"]}))
    while True:
        try:
            msg = ws.receive()
            if not msg: break
            data = json.loads(msg)
            prompt = data.get("message","")
            for tok in stream_from_engine(prompt):
                ws.send(json.dumps({"type":"token","value":tok}))
            ws.send(json.dumps({"type":"done"}))
        except Exception:
            break

@app.post("/api/chat")
def chat_rest():
    user = get_user_from_cookie()
    if not user: return (jsonify({"error":"unauthorized"}), 401)
    prompt = (request.json or {}).get("message","")
    return jsonify({"reply": f"I heard: {prompt}"})

def stream_from_engine(prompt: str):
    reply = f"I heard: {prompt}. This is Nexus streaming back."
    for ch in reply:
        time.sleep(0.01)
        yield ch

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
