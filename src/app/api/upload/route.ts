import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// POST /api/upload
//
// Accepts multipart/form-data with a single file field.
// Returns storage metadata: { url, originalName, mimeType, sizeBytes }.
// ---------------------------------------------------------------------------

// Allowed file extensions for game-asset uploads
const ALLOWED_EXTENSIONS = [
  // 3D models
  ".rbxm", ".rbxmx", ".fbx", ".blend", ".glb", ".gltf", ".obj", ".dae",
  // Images
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp",
  // Audio
  ".mp3", ".wav", ".ogg", ".flac", ".m4a",
  // Video
  ".mp4", ".webm", ".mov",
  // Archives / documents
  ".zip", ".rar", ".7z", ".pdf", ".txt", ".md", ".json",
];

// Dangerous extensions that must NEVER be allowed
const BLOCKED_EXTENSIONS = [
  ".exe", ".bat", ".cmd", ".sh", ".ps1", ".dll", ".so", ".dylib",
  ".js", ".mjs", ".ts", ".jsx", ".tsx", ".php", ".py", ".rb",
  ".html", ".htm", ".jar", ".class", ".app",
];

function getFileExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx > 0 ? filename.slice(idx).toLowerCase() : "";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileField = formData.get("file");

    if (!fileField || !(fileField instanceof File)) {
      return NextResponse.json(
        { error: "No file provided. Send a multipart form with a 'file' field." },
        { status: 400 },
      );
    }

    // Validate filename — prevent empty or path-traversal attempts
    if (!fileField.name || fileField.name.includes("/") || fileField.name.includes("\\")) {
      return NextResponse.json(
        { error: "Invalid filename." },
        { status: 400 },
      );
    }

    // Validate file extension
    const ext = getFileExtension(fileField.name);
    if (!ext) {
      return NextResponse.json(
        { error: "File must have an extension." },
        { status: 400 },
      );
    }
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `File type '${ext}' is not allowed for security reasons.` },
        { status: 400 },
      );
    }
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `File type '${ext}' is not supported. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 },
      );
    }

    // Validate file size (default 50MB)
    const maxMb = parseInt(process.env.UPLOAD_MAX_MB ?? "50", 10) || 50;
    const maxBytes = maxMb * 1024 * 1024;
    if (fileField.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxBytes / 1024 / 1024}MB.` },
        { status: 413 },
      );
    }

    // Validate file is not empty
    if (fileField.size === 0) {
      return NextResponse.json(
        { error: "File is empty." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await fileField.arrayBuffer());
    const storage = getStorage();

    const result = await storage.store(
      fileField.name,
      buffer,
      fileField.type || "application/octet-stream",
    );

    logger.info("File uploaded", {
      originalName: fileField.name,
      mimeType: fileField.type,
      size: fileField.size,
      key: result.key,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    logger.error("Upload failed", { error: String(error) });
    return NextResponse.json(
      { error: "Upload failed. Ensure UPLOAD_DIR is writable." },
      { status: 500 },
    );
  }
}
