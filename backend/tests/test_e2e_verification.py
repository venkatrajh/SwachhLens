import uuid
import pytest
from fastapi.testclient import TestClient
from app.models.report import Report
from app.schemas.ai import AIAnalysisResult
from tests.test_reports import _create_user_directly, _auth, _create_report_payload, client, override_dependencies, mock_email, create_test_tables

def test_e2e_verification(client: TestClient, mocker):
    off_user, off_token = _create_user_directly(role='officer')
    payload = _create_report_payload()
    payload['image_url'] = 'https://example.com/test.jpg'
    payload['description'] = 'electronic pile'
    res = client.post('/api/v1/reports', json=payload, headers=_auth(off_token))
    report_id = res.json()['id']
    assert res.json()['image_url'] == 'https://example.com/test.jpg'
    cit_user, cit_token = _create_user_directly(role='citizen')
    assert client.post(f'/api/v1/reports/{report_id}/analyze', headers=_auth(cit_token)).status_code == 403
    mocker.patch('app.api.v1.reports.find_duplicate_report', return_value=None)
    mock_ai = mocker.patch('app.api.v1.reports.analyze_report_with_groq', return_value=AIAnalysisResult(waste_type='electronics', volume_level='medium', confidence=0.85, severity_score=60, estimated_weight_kg=15.5, is_hazardous=True, is_recyclable=True, recommended_action='Handle'))
    res_analyze = client.post(f'/api/v1/reports/{report_id}/analyze', headers=_auth(off_token))
    data = res_analyze.json()
    assert data['status'] == 'analyzing'
    assert data['waste_type'] == 'electronics'
    assert data['estimated_weight_kg'] == 15.5
    assert data['is_hazardous'] is True
    assert data['recommended_team'] == 'Hazardous Response Team'
    payload2 = _create_report_payload()
    r2 = client.post('/api/v1/reports', json=payload2, headers=_auth(off_token)).json()['id']
    mocker.patch('app.api.v1.reports.find_duplicate_report', return_value=Report(id=uuid.uuid4()))
    dup_res = client.post(f'/api/v1/reports/{r2}/analyze', headers=_auth(off_token))
    assert dup_res.json()['status'] == 'duplicate'
