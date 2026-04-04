// image.utils.js

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

/**
 * Returns a full usable image URL
 * @param {string} imageUrl - relative or absolute image path
 * @returns {string}
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "";

  // If already absolute URL → return as it is
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  // Remove double slashes issue
  const cleanServer = SERVER_URL?.replace(/\/$/, "") || "";
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;

  return `${cleanServer}${cleanPath}`;
};