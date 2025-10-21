"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { vapi } from "@/lib/vapi";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

const GenerateProgramPage = () => {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [callEnded, setCallEnded] = useState(false);

  const { user } = useUser();
  const { theme } = useTheme();
  const router = useRouter();

  const messageContainerRef = useRef<HTMLDivElement>(null);

  // SOLUTION to get rid of "Meeting has ended" error
  useEffect(() => {
    const originalError = console.error;
    // override console.error to ignore "Meeting has ended" errors
    console.error = function (msg, ...args) {
      if (
        msg &&
        (msg.includes("Meeting has ended") ||
          (args[0] && args[0].toString().includes("Meeting has ended")))
      ) {
        console.log("Ignoring known error: Meeting has ended");
        return; // don't pass to original handler
      }

      // pass all other errors to the original handler
      return originalError.call(console, msg, ...args);
    };

    // restore original handler on unmount
    return () => {
      console.error = originalError;
    };
  }, []);

  // auto-scroll messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // navigate user to profile page after the call ends
  useEffect(() => {
    if (callEnded) {
      const redirectTimer = setTimeout(() => {
        router.push("/profile");
      }, 1500);

      return () => clearTimeout(redirectTimer);
    }
  }, [callEnded, router]);

  // setup event listeners for vapi
  useEffect(() => {
    const handleCallStart = () => {
      console.log("Call started");
      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
    };

    const handleCallEnd = () => {
      console.log("Call ended");
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
    };

    const handleSpeechStart = () => {
      console.log("AI started Speaking");
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      console.log("AI stopped Speaking");
      setIsSpeaking(false);
    };
    const handleMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { content: message.transcript, role: message.role };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleError = (error: any) => {
      console.log("Vapi Error", error);
      setConnecting(false);
      setCallActive(false);
    };

    vapi
      .on("call-start", handleCallStart)
      .on("call-end", handleCallEnd)
      .on("speech-start", handleSpeechStart)
      .on("speech-end", handleSpeechEnd)
      .on("message", handleMessage)
      .on("error", handleError);

    // cleanup event listeners on unmount
    return () => {
      vapi
        .off("call-start", handleCallStart)
        .off("call-end", handleCallEnd)
        .off("speech-start", handleSpeechStart)
        .off("speech-end", handleSpeechEnd)
        .off("message", handleMessage)
        .off("error", handleError);
    };
  }, []);

  const toggleCall = async () => {
    if (callActive) vapi.stop();
    else {
      try {
        setConnecting(true);
        setMessages([]);
        setCallEnded(false);

        const fullName = user?.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : "There";

        await vapi.start(undefined, 
          undefined, undefined, process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            full_name: fullName,
            user_id: user?.id,
          },
        });
      } catch (error) {
        console.log("Failed to start call", error);
        setConnecting(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5" suppressHydrationWarning></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)]" suppressHydrationWarning></div>
      
      <div className="container mx-auto px-4 h-full max-w-5xl relative z-10 py-8 pt-24 sm:pt-32" suppressHydrationWarning>
        {/* Title */}
        <div className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6" suppressHydrationWarning>
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-normal text-muted-foreground">
              AI-Powered Fitness Solutions
            </h2>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              <span className="text-foreground">Generate Your </span>
              <span className="text-primary">Fitness Program</span>
            </h1>
          </div>
          
          <div className="max-w-3xl mx-auto px-2">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Engage in an interactive consultation with our advanced AI fitness coach to develop 
              a comprehensive, personalized training and nutrition program tailored to your specific goals.
            </p>
          </div>
        </div>

        {/* VIDEO CALL AREA */}
        <div className="flex flex-col sm:grid sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* AI ASSISTANT CARD */}
          <Card className="bg-card/90 backdrop-blur-sm border border-border overflow-hidden relative rounded-xl shadow-2xl w-full max-w-md mx-auto lg:max-w-none lg:mx-0">
            <div className="h-64 sm:aspect-video flex flex-col items-center justify-center p-4 sm:p-6 relative">
              {/* AI VOICE ANIMATION */}
              <div
                className={`absolute inset-0 ${
                  isSpeaking ? "opacity-30" : "opacity-0"
                } transition-opacity duration-300`}
              >
                {/* Voice wave animation when speaking */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`mx-1 h-16 w-1 bg-primary rounded-full ${
                        isSpeaking ? "animate-sound-wave" : ""
                      }`}
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        height: isSpeaking ? `${Math.random() * 50 + 20}%` : "5%",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* AI IMAGE */}
              <div className="relative size-24 sm:size-32 mb-3 sm:mb-4">
                <div
                  className={`absolute inset-0 bg-primary opacity-20 rounded-full blur-lg ${
                    isSpeaking ? "animate-pulse" : ""
                  }`}
                />

                <div className="relative w-full h-full rounded-full bg-muted flex items-center justify-center border border-primary/50 overflow-hidden shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-secondary/10"></div>
                  <img
                    src={theme === 'light' ? "/logo2.png" : "/logo.png"}
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-foreground text-center">Elite AI</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">Personal Fitness & Diet Coach</p>

              {/* SPEAKING INDICATOR */}
              <div
                className={`mt-3 sm:mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-card/80 border ${
                  isSpeaking ? "border-primary" : "border-border"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSpeaking ? "bg-primary animate-pulse" : "bg-muted-foreground"
                  }`}
                />

                <span className="text-xs text-muted-foreground font-medium">
                  {isSpeaking
                    ? "Speaking..."
                    : callActive
                      ? "Listening..."
                      : callEnded
                        ? "Redirecting to profile..."
                        : "Waiting..."}
                </span>
              </div>
            </div>
          </Card>

          {/* USER CARD */}
          <Card className="bg-card/90 backdrop-blur-sm border border-border overflow-hidden relative rounded-xl shadow-2xl w-full max-w-md mx-auto lg:max-w-none lg:mx-0">
            <div className="h-64 sm:aspect-video flex flex-col items-center justify-center p-4 sm:p-6 relative">
              {/* User Image */}
              <div className="relative size-24 sm:size-32 mb-3 sm:mb-4">
                <div className="absolute inset-0 bg-secondary opacity-20 rounded-full blur-lg"></div>
                <img
                  src={user?.imageUrl}
                  alt="User"
                  className="size-full object-cover rounded-full border border-secondary/50 shadow-lg relative z-10"
                />
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-foreground text-center">You</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">
                {user ? (user.firstName + " " + (user.lastName || "")).trim() : "Guest"}
              </p>

              {/* User Ready Text */}
              <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-card/80 border border-border">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground font-medium">Ready</span>
              </div>
            </div>
          </Card>
        </div>

        {/* MESSAGE CONTAINER */}
        {messages.length > 0 && (
          <div
            ref={messageContainerRef}
            className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 h-48 sm:h-64 overflow-y-auto transition-all duration-300 scroll-smooth shadow-2xl"
          >
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs text-muted-foreground mb-2">
                    {msg.role === "assistant" ? "Elite AI" : "You"}:
                  </div>
                  <p className="text-foreground bg-muted/50 p-3 rounded-lg border border-border">{msg.content}</p>
                </div>
              ))}

              {callEnded && (
                <div className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs text-primary mb-2">System:</div>
                  <p className="text-foreground bg-primary/10 p-3 rounded-lg border border-primary/30">
                    Your fitness program has been created! Redirecting to your profile...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CALL CONTROLS */}
        <div className="w-full flex justify-center gap-4 px-4">
          <Button
            className={`w-full max-w-xs sm:w-48 text-lg sm:text-xl py-4 sm:py-6 rounded-full font-semibold transition-all duration-300 shadow-lg ${
              callActive
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-destructive/25"
                : callEnded
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-green-500/25"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25"
            } relative`}
            onClick={toggleCall}
            disabled={connecting || callEnded}
          >
            {connecting && (
              <span className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75"></span>
            )}

            <span>
              {callActive
                ? "End Call"
                : connecting
                  ? "Connecting..."
                  : callEnded
                    ? "View Profile"
                    : "Start Call"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default GenerateProgramPage;
