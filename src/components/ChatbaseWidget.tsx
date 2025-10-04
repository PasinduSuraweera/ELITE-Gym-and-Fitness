"use client";

import { useEffect } from 'react';

// Extend Window interface for Chatbase
declare global {
  interface Window {
    chatbase?: any;
  }
}

interface ChatbaseWidgetProps {
  chatId?: string;
}

const ChatbaseWidget: React.FC<ChatbaseWidgetProps> = ({ 
  chatId = process.env.NEXT_PUBLIC_CHATBASE_CHAT_ID 
}) => {
  useEffect(() => {
    if (!chatId) {
      console.warn('Chatbase: No chat ID provided');
      return;
    }

    // Inject the Chatbase script using the exact code provided
    const initChatbase = () => {
      // Initialize chatbase if not already done
      if (!window.chatbase || window.chatbase("getState") !== "initialized") {
        window.chatbase = (...args: any[]) => {
          if (!window.chatbase.q) {
            window.chatbase.q = [];
          }
          window.chatbase.q.push(args);
        };
        
        window.chatbase = new Proxy(window.chatbase, {
          get(target: any, prop: string) {
            if (prop === "q") {
              return target.q;
            }
            return (...args: any[]) => target(prop, ...args);
          }
        });
      }

      const onLoad = () => {
        const script = document.createElement("script");
        script.src = "https://www.chatbase.co/embed.min.js";
        script.id = chatId;
        (script as any).domain = "www.chatbase.co";
        document.body.appendChild(script);
      };

      if (document.readyState === "complete") {
        onLoad();
      } else {
        window.addEventListener("load", onLoad);
      }
    };

    initChatbase();

    // Cleanup function
    return () => {
      // Remove the script when component unmounts
      const existingScript = document.querySelector(`script[id="${chatId}"]`);
      if (existingScript) {
        existingScript.remove();
      }
      
      // Remove any chatbase widgets
      const chatbaseElements = document.querySelectorAll('[id*="chatbase"], [class*="chatbase"]');
      chatbaseElements.forEach(element => {
        element.remove();
      });
      
      // Clean up global chatbase
      if (window.chatbase) {
        delete window.chatbase;
      }
    };
  }, [chatId]);

  // This component doesn't render anything visible
  // The Chatbase script will inject its own UI
  return null;
};

export default ChatbaseWidget;