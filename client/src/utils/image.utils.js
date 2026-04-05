// image.utils.js

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "";

  if (imageUrl.startsWith("blob:")) {
    return imageUrl;
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  if (imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  const cleanServer = SERVER_URL?.replace(/\/$/, "") || "";
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;

  return `${cleanServer}${cleanPath}`;
};