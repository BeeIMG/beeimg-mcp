// Image argument parsing: base64 / data URI -> { data, mime, ext, name }.
// Port of mcp_parse_image_arg() from mcp.php.

const MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heic",
  "image/vnd.microsoft.icon": "ico",
  "image/x-icon": "ico",
};

const EXT_TO_MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heic",
  ico: "image/x-icon",
};

const VALID_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "avif", "heic", "heif", "ico"];

// PHP's base64_decode($s, true) returns false on characters outside the base64
// alphabet or incorrect padding. Node's Buffer.from() is lenient, so validate first.
function strictBase64(s) {
  if (typeof s !== "string" || s.length === 0) return false;
  const compact = s.replace(/\s+/g, "");
  if (compact.length === 0) return false;
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(compact)) return false;
  const pad = compact.length % 4;
  return pad === 0 || pad === 2 || pad === 3;
}

export function parseImageArg(image, filename) {
  if (typeof image !== "string") {
    return null;
  }

  let mime = null;
  let raw = image;

  const match = /^data:([^;,]+)?(;base64)?,(.*)$/is.exec(image);
  if (match) {
    mime = match[1] !== "" && match[1] !== undefined ? match[1] : null;
    raw = match[3];
    if (!match[2]) {
      raw = decodeURIComponent(raw);
    }
  }

  let ext = mime ? MIME_TO_EXT[mime.toLowerCase()] : undefined;
  if (!ext && filename) {
    const parts = filename.split(".");
    const e = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
    if (VALID_EXTS.includes(e)) {
      ext = e === "jpeg" ? "jpg" : e === "heif" ? "heic" : e;
    }
  }
  if (!ext) {
    ext = "png";
  }

  if (!strictBase64(raw)) {
    return null;
  }

  let data;
  try {
    data = Buffer.from(raw, "base64");
  } catch {
    return null;
  }
  if (!data || data.length === 0) {
    return null;
  }

  return {
    data,
    mime: mime || EXT_TO_MIME[ext] || "application/octet-stream",
    ext,
    name: filename || `image.${ext}`,
  };
}
