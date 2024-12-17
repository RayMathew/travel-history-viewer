export const getThumbnailFromCache = (thumbnailLink: string) => {
  if (!thumbnailLink) return null;
  return getWithExpiry(thumbnailLink);
};

// Default TTL: 24 hours (86400000 ms)
export const saveThumbnailToCache = (
  thumbnailLink: string,
  thumbnailUrl: string,
  ttl = 86400000
) => {
  if (!thumbnailLink || !thumbnailUrl) return;
  saveWithExpiry(thumbnailLink, thumbnailUrl, ttl);
};

export const getWithExpiry = (key: string) => {
  const dataString = localStorage.getItem(key);
  if (!dataString) return null;

  const data = JSON.parse(dataString);

  //if data has expired, delete it
  if (Date.now() > data.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return data.value;
};

export const saveWithExpiry = (key: string, value: string, ttl: number) => {
  const expiry = Date.now() + ttl;
  const data = { value, expiry };
  localStorage.setItem(key, JSON.stringify(data));
};
