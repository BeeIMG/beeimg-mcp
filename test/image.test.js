import { test } from "node:test";
import assert from "node:assert/strict";
import { parseImageArg } from "../src/image.js";

const TINY_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

test("raw base64 png decodes with png ext", () => {
  const r = parseImageArg(TINY_PNG_B64, undefined);
  assert.ok(r);
  assert.equal(r.ext, "png");
  assert.equal(r.mime, "image/png");
  assert.equal(r.name, "image.png");
  assert.ok(r.data.length > 0);
});

test("data URI with mime decodes and uses filename extension when no mime", () => {
  const r = parseImageArg(`data:image/jpeg;base64,${TINY_PNG_B64}`, undefined);
  assert.ok(r);
  assert.equal(r.ext, "jpg");
  assert.equal(r.mime, "image/jpeg");
});

test("jpeg filename maps to jpg extension", () => {
  const r = parseImageArg(TINY_PNG_B64, "photo.JPEG");
  assert.ok(r);
  assert.equal(r.ext, "jpg");
  assert.equal(r.name, "photo.JPEG");
});

test("heif filename maps to heic", () => {
  const r = parseImageArg(TINY_PNG_B64, "img.heif");
  assert.ok(r);
  assert.equal(r.ext, "heic");
});

test("unknown extension falls back to png", () => {
  const r = parseImageArg(TINY_PNG_B64, "file.txt");
  assert.ok(r);
  assert.equal(r.ext, "png");
});

test("unencoded data URI is url-decoded", () => {
  const raw = Buffer.from("hello").toString("base64");
  const r = parseImageArg(`data:image/png,${raw}`, undefined);
  assert.ok(r);
  assert.equal(r.data.toString(), "hello");
});

test("invalid base64 returns null", () => {
  assert.equal(parseImageArg("!!!not base64!!!", undefined), null);
  assert.equal(parseImageArg("", undefined), null);
  assert.equal(parseImageArg(undefined, undefined), null);
  assert.equal(parseImageArg(123, undefined), null);
});
