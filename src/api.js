// Direct BeeIMG API client. No dependency on the hosted MCP endpoint; calls the
// public HTTP API (mirrors the requests mcp.php makes).

import { parseImageArg } from "./image.js";
import { premiumHintFor, premiumInfoText, premiumInfoStructured } from "./premium.js";

function baseUrl() {
  return process.env.BEEIMG_MCP_BASE_URL
    ? String(process.env.BEEIMG_MCP_BASE_URL).replace(/\/+$/, "")
    : "https://beeimg.com";
}

function sslVerify() {
  const flag = process.env.BEEIMG_MCP_SSL_VERIFY;
  if (flag === "0") return false;
  if (flag === "1") return true;
  // Auto: disable verification when the host is loopback (dev hosts-file + self-signed cert).
  try {
    const host = new URL(baseUrl()).hostname;
    return !(host === "127.0.0.1" || host === "::1" || host.startsWith("127."));
  } catch {
    return true;
  }
}

async function postForm(url, form, isMultipart) {
  const init = {
    method: "POST",
    headers: {
      "User-Agent": "BeeIMG-MCP/1.0",
      Accept: "application/json",
    },
  };

  if (isMultipart) {
    init.body = form;
  } else {
    const params = new URLSearchParams();
    for (const [k, v] of form.entries()) {
      params.set(k, v);
    }
    init.body = params.toString();
    init.headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  const res = await fetch(url, init);
  const text = await res.text();
  let structured = null;
  try {
    structured = text ? JSON.parse(text) : null;
  } catch {
    structured = null;
  }
  return { status: res.status, body: text, structured };
}

function pretty(body) {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

export function bodyCode(structured) {
  if (structured && typeof structured === "object") {
    if (structured.files && typeof structured.files.code !== "undefined") return String(structured.files.code);
    if (typeof structured.code !== "undefined") return String(structured.code);
  }
  return null;
}

function textReply(res, isErr) {
  const code = bodyCode(res.structured);
  const hint = isErr ? premiumHintFor(code) : null;
  return {
    isError: isErr,
    text: pretty(res.body),
    structured: res.structured,
    hint,
  };
}

export async function uploadUrl(args) {
  const url = args.url ? String(args.url).trim() : "";
  if (!url) {
    return { isError: true, text: "Missing required parameter: url." };
  }

  const form = new URLSearchParams();
  form.set("url", url);
  for (const key of ["apikey", "albumid", "title"]) {
    if (args[key]) form.set(key, String(args[key]));
  }
  if (args.privacy && ["public", "private", "truly-private"].includes(args.privacy)) {
    form.set("privacy", args.privacy);
  }

  const res = await postForm(`${baseUrl()}/api/upload/url/json/`, form, false);
  const code = bodyCode(res.structured);
  const isErr = res.status >= 400 || (code !== null && code !== "200");
  return textReply(res, isErr);
}

export async function uploadFile(args) {
  const parsed = parseImageArg(args.image, args.filename);
  if (!parsed) {
    return {
      isError: true,
      text: "Invalid image data: could not decode base64 or data URI. Send the image as a data URI (data:image/png;base64,...) or raw base64.",
    };
  }

  const form = new FormData();
  form.append("file", new Blob([parsed.data], { type: parsed.mime }), parsed.name);
  form.append("title", args.title || parsed.name.replace(/\.[^.]+$/, ""));
  for (const key of ["apikey", "albumid"]) {
    if (args[key]) form.append(key, String(args[key]));
  }
  if (args.privacy && ["public", "private", "truly-private"].includes(args.privacy)) {
    form.append("privacy", args.privacy);
  }

  const res = await postForm(`${baseUrl()}/api/upload/file/json/`, form, true);
  const code = bodyCode(res.structured);
  const isErr = res.status >= 400 || (code !== null && code !== "200");
  return textReply(res, isErr);
}

export async function deleteImage(args) {
  const imageId = String(args.image_id || "").trim();
  const apikey = String(args.apikey || "").trim();
  const dkey = String(args.delete_key || "").trim();
  if (!imageId || !apikey || !dkey) {
    return { isError: true, text: "Missing required parameters: image_id, apikey, delete_key." };
  }

  const form = new URLSearchParams();
  form.set("apikey", apikey);
  form.set("delete_key", dkey);
  const res = await postForm(`${baseUrl()}/delete/${encodeURIComponent(imageId)}/`, form, false);

  // delete.php answers with plain "OK" or "ERROR".
  const ok = res.status < 400 && res.body.trim().toUpperCase() === "OK";
  return {
    isError: !ok,
    text: ok ? res.body.trim() : pretty(res.body),
    structured: res.structured,
  };
}

export async function premiumInfo() {
  return { isError: false, text: premiumInfoText(), structured: premiumInfoStructured() };
}

export { sslVerify };