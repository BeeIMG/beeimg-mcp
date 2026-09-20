// Premium plan info + upload-error hints. Mirrors mcp.php.

export const PREMIUM_UPGRADE_URL = "https://beeimg.com/premium/compare";

export const PREMIUM_HINTS = {
  40: "Storage limit exceeded. Premium raises your storage limit.",
  223: "Upload rate limit reached. Premium removes upload rate limits.",
  4: "File too large for your current plan. Premium raises the max file size.",
  503: "Uploader is temporarily disabled. Premium members get priority upload access.",
};

export function premiumHintFor(code) {
  if (code === null || code === undefined || !Object.prototype.hasOwnProperty.call(PREMIUM_HINTS, code)) {
    return null;
  }
  return `${PREMIUM_HINTS[code]} Upgrade: ${PREMIUM_UPGRADE_URL}`;
}

export function premiumInfoText() {
  return [
    "BeeIMG Free plan limits:",
    "- Max file size: 1 MB per image",
    "- Allowed types: JPG, PNG, GIF, WEBP, AVIF, HEIC, HEIF, ICO, APNG",
    "- Anonymous upload rate limit: 30 uploads per 20 minutes",
    "",
    "Premium / Super Uploader perks:",
    "- Higher max file size and storage limit",
    "- No upload rate limits",
    "- No ads",
    "",
    "Compare all plans: https://beeimg.com/premium/compare",
    "Order premium: https://beeimg.com/premium/order",
    "Current numbers FAQ: https://beeimg.com/faq#q7",
  ].join("\n");
}

export function premiumInfoStructured() {
  return {
    plan: "Free",
    limits: {
      max_file_size_mb: 1,
      allowed_types: ["jpg", "png", "gif", "webp", "avif", "heic", "heif", "ico", "apng"],
      anonymous_rate_limit: "30 uploads per 20 minutes",
    },
    premium_perks: ["higher max file size", "higher storage limit", "no upload rate limits", "no ads"],
    links: {
      compare: "https://beeimg.com/premium/compare",
      order: "https://beeimg.com/premium/order",
      faq: "https://beeimg.com/faq#q7",
    },
  };
}