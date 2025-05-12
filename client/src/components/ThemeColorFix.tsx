import React, { useEffect } from 'react';

/**
 * ThemeColorFix component
 * 
 * This component directly injects CSS into the document to override any color
 * conversion issues with the SJJS brand color. It ensures the theme always uses
 * the exact RGB values (139, 71, 73) for the primary color.
 */
export default function ThemeColorFix() {
  useEffect(() => {
    // Create style element
    const styleEl = document.createElement('style');
    styleEl.setAttribute('id', 'sjjs-color-override');
    
    // Define override styles with exact RGB values
    styleEl.textContent = `
      :root {
        --primary: #8B4749 !important;
        --primary-rgb: 139, 71, 73 !important;
      }
      
      /* Force all primary color backgrounds to use the exact hex value */
      .bg-primary {
        background-color: #8B4749 !important;
      }
      
      /* Force all primary color text to use the exact hex value */
      .text-primary {
        color: #8B4749 !important;
      }
      
      /* Force all primary color borders to use the exact hex value */
      .border-primary {
        border-color: #8B4749 !important;
      }
    `;
    
    // Remove any existing override first
    const existing = document.getElementById('sjjs-color-override');
    if (existing) {
      existing.remove();
    }
    
    // Append to document head
    document.head.appendChild(styleEl);
    
    // Clean up on unmount
    return () => {
      const element = document.getElementById('sjjs-color-override');
      if (element) {
        element.remove();
      }
    };
  }, []);
  
  return null; // This component doesn't render anything
}