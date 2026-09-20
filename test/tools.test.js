import { test } from "node:test";
import assert from "node:assert/strict";
import { toolDefinitions } from "../src/tools.js";
import { bodyCode } from "../src/api.js";
import { premiumHintFor, premiumInfoText, premiumInfoStructured } from "../src/premium.js";

test("exposes exactly the four expected tools", () => {
  const names = toolDefinitions().map((t) => t.name);
  assert.deepEqual(names, ["upload_url", "upload_file", "delete_image", "beeimg_premium_info"]);
});

test("each tool has title, description, annotations, and inputSchema", () => {
  for (const t of toolDefinitions()) {
    assert.ok(t.title, `${t.name} title`);
    assert.ok(t.description, `${t.name} description`);
    assert.ok(t.annotations && typeof t.annotations === "object", `${t.name} annotations`);
    assert.ok(t.inputSchema && typeof t.inputSchema === "object", `${t.name} inputSchema`);
  }
});

test("annotations hint correctness (premium read-only, delete destructive)", () => {
  const byName = Object.fromEntries(toolDefinitions().map((t) => [t.name, t]));
  assert.equal(byName.beeimg_premium_info.annotations.readOnlyHint, true);
  assert.equal(byName.beeimg_premium_info.annotations.destructiveHint, false);
  assert.equal(byName.delete_image.annotations.destructiveHint, true);
  assert.equal(byName.upload_url.annotations.readOnlyHint, false);
});

test("required fields present in inputSchema", () => {
  const byName = Object.fromEntries(toolDefinitions().map((t) => [t.name, t]));
  assert.ok(byName.upload_url.inputSchema.url, "upload_url.url required");
  assert.ok(byName.upload_file.inputSchema.image, "upload_file.image required");
  for (const k of ["image_id", "apikey", "delete_key"]) {
    assert.ok(byName.delete_image.inputSchema[k], `delete_image.${k}`);
  }
});

test("privacy enum matches hosted server", () => {
  const byName = Object.fromEntries(toolDefinitions().map((t) => [t.name, t]));
  const privacy = byName.upload_url.inputSchema.privacy;
  assert.ok(privacy, "privacy field present");
});

test("bodyCode extracts files.code and top-level code", () => {
  assert.equal(bodyCode({ files: { code: 200 } }), "200");
  assert.equal(bodyCode({ files: { code: "40" } }), "40");
  assert.equal(bodyCode({ code: 223 }), "223");
  assert.equal(bodyCode({ foo: 1 }), null);
  assert.equal(bodyCode(null), null);
});

test("premium hints for upload-limiting codes", () => {
  assert.match(premiumHintFor(40), /Storage limit/);
  assert.match(premiumHintFor(223), /rate limit/);
  assert.match(premiumHintFor(4), /too large/);
  assert.match(premiumHintFor(503), /disabled/);
  assert.equal(premiumHintFor(999), null);
  assert.equal(premiumHintFor(null), null);
});

test("premium info has text + structured with links", () => {
  assert.match(premiumInfoText(), /premium\/compare/);
  const s = premiumInfoStructured();
  assert.equal(s.plan, "Free");
  assert.equal(s.limits.max_file_size_mb, 1);
  assert.match(s.links.compare, /^https:\/\/beeimg\.com\/premium\/compare$/);
});
