// Browser extension detection and hydration fix utility
// This helps identify and handle DOM modifications by browser extensions

export const suppressBrowserExtensionWarnings = () => {
  if (typeof window === 'undefined') return;

  // Detect common browser extension attributes
  const extensionAttributes = [
    'bis_register',
    'bis_skin_checked',
    'data-adblock',
    'data-extension',
    '__processed_'
  ];

  // Function to clean extension attributes (optional, use with caution)
  const cleanExtensionAttributes = (element: Element) => {
    extensionAttributes.forEach(attr => {
      if (element.hasAttribute(attr)) {
        console.warn(`Browser extension attribute detected: ${attr}`);
        // Uncomment the line below if you want to remove these attributes
        // element.removeAttribute(attr);
      }
    });
  };

  // Observer to detect extension modifications
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        const target = mutation.target as Element;
        extensionAttributes.forEach(attr => {
          if (target.hasAttribute(attr)) {
            console.warn('Browser extension modified DOM:', {
              element: target.tagName,
              attribute: attr,
              value: target.getAttribute(attr)
            });
          }
        });
      }
    });
  });

  // Start observing after React has hydrated
  setTimeout(() => {
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: extensionAttributes,
      subtree: true
    });
  }, 1000);

  return () => observer.disconnect();
};

// Hook to use in components that are sensitive to browser extensions
export const useBrowserExtensionSafe = () => {
  if (typeof window === 'undefined') return false;
  
  const hasExtensionAttributes = () => {
    const elements = document.querySelectorAll('[bis_register], [bis_skin_checked], [data-adblock]');
    return elements.length > 0;
  };

  return !hasExtensionAttributes();
};
