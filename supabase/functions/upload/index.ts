import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient, getUser } from "../_shared/supabase.ts";

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  const user = await getUser(req);
  if (!user) return errorResponse("Unauthorized", 401);

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const uploadType = pathParts[pathParts.length - 1]; // profile-image, portfolio-images, product-images

  switch (uploadType) {
    case "profile-image":
      return uploadProfileImage(req, user.id);
    case "portfolio-images":
      return uploadPortfolioImages(req, user.id);
    case "product-images":
      return uploadProductImages(req, user.id);
    default:
      return errorResponse("Invalid upload type. Use: profile-image, portfolio-images, product-images");
  }
});

// ── Upload Profile Image ──
async function uploadProfileImage(req: Request, userId: string) {
  const supabase = createServiceClient();
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return errorResponse("No file provided");

  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return errorResponse("Invalid file type. Allowed: JPEG, PNG, WebP");
  }

  if (file.size > 5 * 1024 * 1024) {
    return errorResponse("File too large. Maximum: 5MB");
  }

  const ext = file.name.split(".").pop();
  const filePath = `${userId}/profile.${ext}`;

  const { data, error } = await supabase.storage
    .from("profile-images")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) return errorResponse(`Upload failed: ${error.message}`, 500);

  const { data: { publicUrl } } = supabase.storage
    .from("profile-images")
    .getPublicUrl(filePath);

  // Update user profile
  await supabase
    .from("users")
    .update({ profile_image_url: publicUrl })
    .eq("id", userId);

  return jsonResponse({ url: publicUrl });
}

// ── Upload Portfolio Images (up to 5) ──
async function uploadPortfolioImages(req: Request, userId: string) {
  const supabase = createServiceClient();
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) return errorResponse("No files provided");
  if (files.length > 5) return errorResponse("Maximum 5 files allowed");

  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const urls: string[] = [];

  for (const file of files) {
    if (!validTypes.includes(file.type)) {
      return errorResponse(`Invalid file type for "${file.name}". Allowed: JPEG, PNG, WebP`);
    }
    if (file.size > 10 * 1024 * 1024) {
      return errorResponse(`"${file.name}" too large. Maximum: 10MB`);
    }

    const timestamp = Date.now();
    const filePath = `${userId}/${timestamp}_${file.name}`;

    const { error } = await supabase.storage
      .from("portfolio-images")
      .upload(filePath, file, { contentType: file.type });

    if (error) {
      return errorResponse(`Upload failed for "${file.name}": ${error.message}`, 500);
    }

    const { data: { publicUrl } } = supabase.storage
      .from("portfolio-images")
      .getPublicUrl(filePath);

    urls.push(publicUrl);
  }

  // Append to designer_profiles.portfolio_images
  const { data: profile } = await supabase
    .from("designer_profiles")
    .select("portfolio_images")
    .eq("user_id", userId)
    .single();

  const existingImages = (profile?.portfolio_images as string[]) || [];
  const updatedImages = [...existingImages, ...urls];

  await supabase
    .from("designer_profiles")
    .update({ portfolio_images: updatedImages })
    .eq("user_id", userId);

  return jsonResponse({ urls, total: updatedImages.length });
}

// ── Upload Product Images ──
async function uploadProductImages(req: Request, userId: string) {
  const supabase = createServiceClient();
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const collectionId = formData.get("collection_id") as string;
  const productId = formData.get("product_id") as string;

  if (!files.length) return errorResponse("No files provided");
  if (!collectionId) return errorResponse("collection_id is required");

  // Verify collection ownership
  const { data: collection } = await supabase
    .from("collections")
    .select("designer_id")
    .eq("id", collectionId)
    .single();

  if (!collection || collection.designer_id !== userId) {
    return errorResponse("Unauthorized: collection does not belong to you", 403);
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const urls: string[] = [];

  for (const file of files) {
    if (!validTypes.includes(file.type)) {
      return errorResponse(`Invalid file type for "${file.name}". Allowed: JPEG, PNG, WebP`);
    }
    if (file.size > 10 * 1024 * 1024) {
      return errorResponse(`"${file.name}" too large. Maximum: 10MB`);
    }

    const timestamp = Date.now();
    const folder = productId ? `${collectionId}/${productId}` : collectionId;
    const filePath = `${folder}/${timestamp}_${file.name}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { contentType: file.type });

    if (error) {
      return errorResponse(`Upload failed for "${file.name}": ${error.message}`, 500);
    }

    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    urls.push(publicUrl);
  }

  return jsonResponse({ urls });
}
