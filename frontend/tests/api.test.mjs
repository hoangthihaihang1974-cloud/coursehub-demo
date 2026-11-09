import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { api } from "../src/api.js";
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
test("GET returns JSON and passes AbortSignal", async () => {
  const controller = new AbortController();
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "http://127.0.0.1:8000/courses");
    assert.equal(options.method, "GET");
    assert.equal(options.signal, controller.signal);
    assert.equal(options.body, undefined);
    return new Response('[{"code":"INT2204"}]');
  };
  assert.deepEqual(await api("/courses", {signal: controller.signal}), [{code:"INT2204"}]);
});
test("POST serializes exact payload and receives 201", async () => {
  const body = {student_id:"22000004",class_section_id:"WEB-01"};
  globalThis.fetch = async (_, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), body);
    return new Response('{"message":"ok"}', {status:201});
  };
  assert.deepEqual(await api("/enrollments", {method:"POST",body}), {message:"ok"});
});
test("DELETE 204 does not read a JSON body", async () => {
  globalThis.fetch = async () => ({status:204, text() {throw new Error("must not read");}});
  assert.equal(await api("/enrollments/a/b", {method:"DELETE"}), null);
});
test("404 preserves status and detail", async () => {
  globalThis.fetch = async () => new Response('{"detail":"Not found"}', {status:404});
  await assert.rejects(api("/missing"), e => e.status === 404 && e.message.includes("Not found"));
});
test("409 preserves business conflict", async () => {
  globalThis.fetch = async () => new Response('{"detail":"Full"}', {status:409});
  await assert.rejects(api("/enrollments"), e => e.status === 409 && e.message.includes("Full"));
});
test("422 combines validation messages", async () => {
  globalThis.fetch = async () => new Response('{"detail":[{"msg":"Required"},{"msg":"Invalid"}]}', {status:422});
  await assert.rejects(api("/enrollments"), /Required; Invalid/);
});
test("non-JSON response reports HTTP status", async () => {
  globalThis.fetch = async () => new Response("Internal Server Error", {status:500});
  await assert.rejects(api("/health"), /HTTP 500.*JSON/);
});
test("network failure never retries a write; abort preserved", async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new TypeError("network"); };
  await assert.rejects(api("/enrollments", {method:"POST",body:{}}), /Backend\/CORS/);
  assert.equal(calls, 1);
  const abort = new DOMException("Stopped", "AbortError");
  globalThis.fetch = async () => { throw abort; };
  await assert.rejects(api("/courses"), e => e === abort);
});
