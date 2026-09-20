// Tool definitions — mirrors mcp_tools() in mcp.php so the npm package exposes
// the same names, descriptions, annotations, and input schemas as the hosted server.

import * as z from "zod/v4";

const APIKEY_DESC =
  "Your BeeIMG API key. Required for album uploads and all delete requests. Get it at https://beeimg.com/api/newkey";
const ALBUM_DESC =
  "Album or folder ID to place the image in. Accepts both 5-char master album IDs and 9-char folder IDs.";
const PRIVACY_DESC =
  "public (default), private (unlisted - hidden from search but accessible via link), or truly-private (only you and admins can see it - Premium feature).";

const PRIVACY_ENUM = ["public", "private", "truly-private"];

const commonUploadFields = {
  apikey: z.string().describe(APIKEY_DESC).optional(),
  albumid: z.string().describe(ALBUM_DESC).optional(),
  privacy: z.enum(["public", "private", "truly-private"]).describe(PRIVACY_DESC).optional(),
  title: z.string().describe("Optional title for the image.").optional(),
};

const annotations = (readOnly = false, destructive = false) => ({
  readOnlyHint: readOnly,
  destructiveHint: destructive,
  idempotentHint: readOnly,
  openWorldHint: false,
});

export function toolDefinitions() {
  return [
    {
      name: "upload_url",
      title: "Upload Image by URL",
      description:
        "Upload an image to BeeIMG by fetching it from a remote URL. Returns the hosted image URL, thumbnail, view page, and delete URL.",
      annotations: annotations(false, false),
      inputSchema: {
        url: z.string().describe("Remote image URL to fetch and host."),
        ...commonUploadFields,
      },
    },
    {
      name: "upload_file",
      title: "Upload Image File",
      description:
        "Upload an image file to BeeIMG from base64 or a data URI. Returns the hosted image URL, thumbnail, view page, and delete URL.",
      annotations: annotations(false, false),
      inputSchema: {
        image: z.string().describe("The image as a data URI (e.g. data:image/png;base64,....) or raw base64."),
        filename: z.string().describe("Optional original filename (used to detect the extension and default title).").optional(),
        ...commonUploadFields,
      },
    },
    {
      name: "delete_image",
      title: "Delete Image",
      description:
        "Delete an image hosted on BeeIMG using its image ID, your API key, and the delete key returned at upload time. Returns OK or ERROR.",
      annotations: annotations(false, true),
      inputSchema: {
        image_id: z.string().describe('The image ID to delete (the value of "name" in the upload response).'),
        apikey: z.string().describe("Your BeeIMG API key."),
        delete_key: z.string().describe("The deletion key returned with the upload response."),
      },
    },
    {
      name: "beeimg_premium_info",
      title: "Premium Plan Info",
      description:
        "Returns the current BeeIMG free-plan limits, premium perks, and upgrade links. Call this when an upload fails with a rate limit, storage limit, or file-too-large error to advise the user about upgrading.",
      annotations: annotations(true, false),
      inputSchema: {},
    },
  ];
}

export { PRIVACY_ENUM };
