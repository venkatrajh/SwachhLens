import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_cors_preflight():
    """
    Ensure CORS preflight (OPTIONS) returns the correct headers 
    for allowed origins and credentials.
    """
    origin = "http://localhost:5173"
    
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Authorization, Content-Type",
        },
    )
    
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == origin
    assert response.headers.get("access-control-allow-credentials") == "true"
    
    # Should include our requested headers
    allowed_headers = response.headers.get("access-control-allow-headers", "").lower()
    assert "authorization" in allowed_headers
    assert "content-type" in allowed_headers

def test_cors_disallowed_origin():
    """
    A non-whitelisted origin should not receive the Access-Control-Allow-Origin header
    mirroring its own origin. (It shouldn't be allowed)
    """
    origin = "http://evil-site.com"
    
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Authorization, Content-Type",
        },
    )
    
    # FastAPI CORSMiddleware returns 400 for disallowed origins on preflight requests
    assert response.status_code == 400
    assert response.headers.get("access-control-allow-origin") is None

def test_cors_get_request():
    """
    Ensure actual GET requests return the CORS headers if Origin is provided.
    """
    origin = "http://localhost:3000"
    response = client.get("/api/v1/health", headers={"Origin": origin})
    
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == origin
    assert response.headers.get("access-control-allow-credentials") == "true"
