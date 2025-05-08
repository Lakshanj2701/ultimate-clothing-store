export const getFullImageUrl = (url) => {
    // Handle case where url is actually an image object
    if (url && typeof url === 'object' && url.url) {
      url = url.url;
    }
  
    if (!url) return '/placeholder-image.jpg';
    
    // If it's already a full URL, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Handle cases where the URL might start with a double slash
    if (url.startsWith('//')) {
      return window.location.protocol + url;
    }
    
    // For local development - ensure the path starts with a single slash
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000'}${cleanUrl}`;
  };