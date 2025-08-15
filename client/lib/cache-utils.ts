// Cache clearing utilities

export const clearAllCache = async () => {
  try {
    // Clear localStorage
    if (typeof Storage !== "undefined") {
      localStorage.clear();
      console.log("✅ localStorage cleared");
    }

    // Clear sessionStorage
    if (typeof Storage !== "undefined") {
      sessionStorage.clear();
      console.log("✅ sessionStorage cleared");
    }

    // Clear service worker cache if available
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log("✅ Service worker caches cleared");
    }

    // Clear browser cache (this will force reload)
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      console.log("✅ Service workers unregistered");
    }

    console.log("🧹 All caches cleared successfully");
    return true;
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
    return false;
  }
};

export const clearPageCache = () => {
  // Force reload without cache
  if (typeof window !== "undefined") {
    window.location.reload();
  }
};

export const hardRefresh = () => {
  // Hard refresh that bypasses cache
  if (typeof window !== "undefined") {
    window.location.href = window.location.href;
  }
};
