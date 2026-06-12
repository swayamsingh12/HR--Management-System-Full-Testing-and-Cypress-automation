const BASE = process.env.SMOKE_BASE_URL || "http://localhost:5000/api";

const safeFetch = async (url, opts) => {
  try {
    return await fetch(url, opts);
  } catch (err) {
    return { error: err };
  }
};

const waitForServer = async (timeoutMs = 30000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await safeFetch(`${BASE}/auth/me`);
    if (res && !res.error) return res.status;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return null;
};

const main = async () => {
  let failures = 0;
  console.log(`Smoke tests against: ${BASE}`);

  console.log("\n[Smoke 1] Backend is alive (GET /auth/me without token -> expect 401)");
  const status1 = await waitForServer(30000);
  if (status1 === null) {
    console.log("  FAIL: connection refused — server is down");
    failures++;
  } else if (status1 === 401) {
    console.log("  PASS: server is up (401 as expected)");
  } else {

    console.log(`  PASS: server is up (responded with ${status1})`);
  }

  console.log("\n[Smoke 2] Database is connected (POST /auth/login admin -> expect 200 + token)");
  let token = null;
  const res2 = await safeFetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@hrms.com", password: "password123" }),
  });
  if (res2.error) {
    console.log("  FAIL: could not reach the login endpoint");
    failures++;
  } else {
    const body = await res2.json().catch(() => ({}));
    if (res2.status === 200 && body.token) {
      token = body.token;
      console.log("  PASS: database connected, login returned a token");
    } else {
      console.log(`  FAIL: status ${res2.status} — database likely not connected. message: ${body.message}`);
      failures++;
    }
  }

  console.log("\n[Smoke 3] Payroll endpoint responds (GET /payroll with admin token -> expect 200 + array)");
  if (!token) {
    console.log("  FAIL: no admin token from Smoke 2, cannot reach payroll endpoint");
    failures++;
  } else {
    const res3 = await safeFetch(`${BASE}/payroll`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res3.error) {
      console.log("  FAIL: could not reach the payroll endpoint");
      failures++;
    } else {
      const body = await res3.json().catch(() => null);
      if (res3.status === 200 && Array.isArray(body)) {
        console.log(`  PASS: payroll endpoint working (${body.length} records)`);
      } else {
        console.log(`  FAIL: status ${res3.status} — payroll endpoint broken`);
        failures++;
      }
    }
  }

  console.log("\n========================================");
  if (failures === 0) {
    console.log("ALL SMOKE TESTS PASSED ✅");
    process.exit(0);
  } else {
    console.log(`${failures} SMOKE TEST(S) FAILED ❌`);
    process.exit(1);
  }
};

main();
