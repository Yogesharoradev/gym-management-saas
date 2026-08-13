"""Backend tests for Super Admin Gym mgmt + Forgot/Reset password flow.

Tests target the external preview URL which proxies /api/* to Next.js.
"""
import os
import re
import subprocess
import time
import uuid

import pytest
import requests

BASE_URL = "https://fitcore-base.preview.emergentagent.com"
SUPER_EMAIL = "owner@gymos.app"
SUPER_PASS = "SuperAdmin@123"
GYM_ADMIN_EMAIL = "admin@ironpulse.in"
GYM_ADMIN_PASS = "GymAdmin@123"
LOG_PATH = "/var/log/supervisor/frontend.out.log"


# ---------- helpers ----------
def login(email: str, password: str) -> requests.Session:
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password}, timeout=30)
    assert r.status_code == 200, f"login failed for {email}: {r.status_code} {r.text}"
    assert "gymos_session" in s.cookies, "session cookie missing"
    return s


def extract_latest_reset_token(email: str) -> str:
    # tail the log and grep the pattern
    out = subprocess.run(
        ["bash", "-lc", f"grep '\\[password-reset\\] link for {email}' {LOG_PATH} | tail -n 1"],
        capture_output=True, text=True,
    ).stdout.strip()
    assert out, f"no reset log line found for {email}"
    # extract token=... from a URL like /reset-password?token=<hex>
    m = re.search(r"token=([A-Za-z0-9_\-]+)", out)
    assert m, f"could not extract token from log line: {out}"
    return m.group(1)


# ---------- fixtures ----------
@pytest.fixture(scope="module")
def super_session() -> requests.Session:
    return login(SUPER_EMAIL, SUPER_PASS)


# ---------- Super Admin auth + list ----------
class TestSuperAdminAuthAndList:
    def test_super_admin_login_sets_httponly_cookie(self):
        s = login(SUPER_EMAIL, SUPER_PASS)
        # verify /me
        r = s.get(f"{BASE_URL}/api/auth/me", timeout=15)
        assert r.status_code == 200
        me = r.json()
        # role may be nested; check both shapes
        role = me.get("role") or (me.get("user") or {}).get("role")
        assert role == "SUPER_ADMIN"

    def test_list_gyms_as_super_admin(self, super_session):
        r = super_session.get(f"{BASE_URL}/api/admin/gyms", timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert "gyms" in data and isinstance(data["gyms"], list)
        assert len(data["gyms"]) >= 1
        # no passwordHash anywhere
        assert "passwordHash" not in r.text


# ---------- Create Gym + Admin ----------
class TestCreateGym:
    created_gym_id = None
    new_admin_email = None
    new_admin_password = "NewAdmin@1234"

    def test_create_gym_with_admin(self, super_session):
        suffix = uuid.uuid4().hex[:8]
        TestCreateGym.new_admin_email = f"TEST_admin_{suffix}@example.com"
        payload = {
            "name": f"TEST_Gym_{suffix}",
            "email": f"TEST_gym_{suffix}@example.com",
            "phone": "+911234567890",
            "address": "123 Test St",
            "admin": {
                "name": "TEST Admin",
                "email": TestCreateGym.new_admin_email,
                "password": TestCreateGym.new_admin_password,
            },
        }
        r = super_session.post(f"{BASE_URL}/api/admin/gyms", json=payload, timeout=30)
        assert r.status_code == 201, f"expected 201, got {r.status_code}: {r.text}"
        body = r.json()
        assert "gym" in body and "admin" in body
        assert body["gym"]["name"] == payload["name"]
        assert body["admin"]["role"] == "GYM_ADMIN"
        assert body["admin"]["gymId"] == body["gym"]["id"]
        assert body["admin"]["email"].lower() == TestCreateGym.new_admin_email.lower()
        assert "passwordHash" not in r.text
        TestCreateGym.created_gym_id = body["gym"]["id"]

    def test_new_admin_can_login(self):
        assert TestCreateGym.new_admin_email
        s = login(TestCreateGym.new_admin_email, TestCreateGym.new_admin_password)
        r = s.get(f"{BASE_URL}/api/auth/me", timeout=15)
        assert r.status_code == 200
        me = r.json()
        role = me.get("role") or (me.get("user") or {}).get("role")
        assert role == "GYM_ADMIN"

    def test_duplicate_admin_email_returns_409_no_orphan(self, super_session):
        assert TestCreateGym.new_admin_email
        # snapshot count
        before = super_session.get(f"{BASE_URL}/api/admin/gyms", timeout=15).json()["gyms"]
        before_count = len(before)
        dup_gym_name = f"TEST_DupGym_{uuid.uuid4().hex[:8]}"
        payload = {
            "name": dup_gym_name,
            "admin": {
                "name": "Dup Admin",
                "email": TestCreateGym.new_admin_email,  # already exists
                "password": "SomePass@123",
            },
        }
        r = super_session.post(f"{BASE_URL}/api/admin/gyms", json=payload, timeout=30)
        assert r.status_code == 409, f"expected 409, got {r.status_code}: {r.text}"
        # verify no orphan gym persists
        after = super_session.get(f"{BASE_URL}/api/admin/gyms", timeout=15).json()["gyms"]
        assert len(after) == before_count
        assert not any(g["name"] == dup_gym_name for g in after)

    def test_get_single_gym(self, super_session):
        assert TestCreateGym.created_gym_id
        r = super_session.get(f"{BASE_URL}/api/admin/gyms/{TestCreateGym.created_gym_id}", timeout=15)
        assert r.status_code == 200
        body = r.json()
        gym = body.get("gym", body)
        assert gym["id"] == TestCreateGym.created_gym_id

    def test_get_nonexistent_gym_404(self, super_session):
        r = super_session.get(f"{BASE_URL}/api/admin/gyms/507f1f77bcf86cd799439011", timeout=15)
        assert r.status_code == 404

    def test_patch_gym_updates_fields(self, super_session):
        assert TestCreateGym.created_gym_id
        payload = {"phone": "+919999888877", "address": "Updated Address 42"}
        r = super_session.patch(
            f"{BASE_URL}/api/admin/gyms/{TestCreateGym.created_gym_id}", json=payload, timeout=20
        )
        assert r.status_code == 200, r.text
        body = r.json()
        gym = body.get("gym", body)
        assert gym["phone"] == payload["phone"]
        assert gym["address"] == payload["address"]

    def test_suspend_and_reactivate_status(self, super_session):
        assert TestCreateGym.created_gym_id
        gid = TestCreateGym.created_gym_id
        # suspend
        r = super_session.patch(f"{BASE_URL}/api/admin/gyms/{gid}/status",
                                json={"status": "SUSPENDED"}, timeout=20)
        assert r.status_code == 200, r.text
        gym = r.json().get("gym", r.json())
        assert gym["status"] == "SUSPENDED"
        assert gym.get("subscriptionStatus") == "SUSPENDED"
        # reactivate
        r = super_session.patch(f"{BASE_URL}/api/admin/gyms/{gid}/status",
                                json={"status": "ACTIVE"}, timeout=20)
        assert r.status_code == 200, r.text
        gym = r.json().get("gym", r.json())
        assert gym["status"] == "ACTIVE"


# ---------- Authorization ----------
class TestAuthorization:
    def test_gym_admin_forbidden(self):
        s = login(GYM_ADMIN_EMAIL, GYM_ADMIN_PASS)
        r = s.get(f"{BASE_URL}/api/admin/gyms", timeout=15)
        assert r.status_code == 403

    def test_unauthenticated_401(self):
        r = requests.get(f"{BASE_URL}/api/admin/gyms", timeout=15)
        assert r.status_code == 401


# ---------- Forgot / Reset Password ----------
class TestForgotResetPassword:
    def test_forgot_password_valid_email_generic_200(self):
        r = requests.post(f"{BASE_URL}/api/auth/forgot-password",
                          json={"email": GYM_ADMIN_EMAIL}, timeout=20)
        assert r.status_code == 200
        assert "passwordHash" not in r.text
        # raw token must not be in body
        body = r.text
        # heuristic: no long hex token in response
        assert not re.search(r"token[\"']?\s*[:=]\s*[\"']?[a-f0-9]{40,}", body, re.I)

    def test_forgot_password_nonexistent_email_same_response(self):
        r1 = requests.post(f"{BASE_URL}/api/auth/forgot-password",
                           json={"email": GYM_ADMIN_EMAIL}, timeout=20)
        r2 = requests.post(f"{BASE_URL}/api/auth/forgot-password",
                           json={"email": f"nonexistent_{uuid.uuid4().hex}@example.com"}, timeout=20)
        assert r1.status_code == 200 and r2.status_code == 200
        # bodies should be same generic message (compare JSON if parseable)
        try:
            assert r1.json() == r2.json()
        except Exception:
            assert r1.text == r2.text

    def test_reset_password_full_flow(self):
        # get an old session for admin (should be invalidated after reset)
        old_session = login(GYM_ADMIN_EMAIL, GYM_ADMIN_PASS)
        # verify me works
        assert old_session.get(f"{BASE_URL}/api/auth/me", timeout=10).status_code == 200

        # request reset
        time.sleep(1)
        r = requests.post(f"{BASE_URL}/api/auth/forgot-password",
                          json={"email": GYM_ADMIN_EMAIL}, timeout=20)
        assert r.status_code == 200
        time.sleep(2)  # allow log flush
        token = extract_latest_reset_token(GYM_ADMIN_EMAIL)

        # weak password rejected
        r = requests.post(f"{BASE_URL}/api/auth/reset-password",
                          json={"token": token, "password": "short"}, timeout=20)
        assert r.status_code == 422, f"expected 422, got {r.status_code}: {r.text}"

        # invalid/garbage token rejected
        r = requests.post(f"{BASE_URL}/api/auth/reset-password",
                          json={"token": "garbage_token_xyz", "password": "StrongPass@123"}, timeout=20)
        assert r.status_code == 400

        # successful reset (temporarily to new password)
        new_pass = "TempPass@2026"
        r = requests.post(f"{BASE_URL}/api/auth/reset-password",
                          json={"token": token, "password": new_pass}, timeout=20)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("success") is True

        # single-use: reusing same token -> 400
        r = requests.post(f"{BASE_URL}/api/auth/reset-password",
                          json={"token": token, "password": "AnotherPass@123"}, timeout=20)
        assert r.status_code == 400

        # old session invalidated
        time.sleep(1)
        r = old_session.get(f"{BASE_URL}/api/auth/me", timeout=10)
        assert r.status_code == 401, f"old session should be invalidated, got {r.status_code}"

        # fresh login with new password works
        new_sess = login(GYM_ADMIN_EMAIL, new_pass)
        assert new_sess.get(f"{BASE_URL}/api/auth/me", timeout=10).status_code == 200

        # RESET BACK to GymAdmin@123 to preserve demo credentials
        # clear lockouts first
        subprocess.run(["mongosh", "gym_saas", "--quiet", "--eval",
                        "db.loginattempts.deleteMany({})"], capture_output=True)
        time.sleep(1)
        r = requests.post(f"{BASE_URL}/api/auth/forgot-password",
                          json={"email": GYM_ADMIN_EMAIL}, timeout=20)
        assert r.status_code == 200
        time.sleep(2)
        token2 = extract_latest_reset_token(GYM_ADMIN_EMAIL)
        r = requests.post(f"{BASE_URL}/api/auth/reset-password",
                          json={"token": token2, "password": GYM_ADMIN_PASS}, timeout=20)
        assert r.status_code == 200, f"failed to restore demo password: {r.text}"
        # NOTE: JWT `iat` is in seconds but passwordChangedAt is stored in ms.
        # Session-invalidation check `iat*1000 < passwordChangedAt` can spuriously
        # reject a fresh-login token issued in the same second as the reset.
        # Wait >1s to avoid this timing bug (see backend_issues in test report).
        time.sleep(1.5)
        # verify demo cred works again
        restored = login(GYM_ADMIN_EMAIL, GYM_ADMIN_PASS)
        assert restored.get(f"{BASE_URL}/api/auth/me", timeout=10).status_code == 200
