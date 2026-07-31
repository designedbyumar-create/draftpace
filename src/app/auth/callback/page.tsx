"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/app");
      } else {
        router.replace("/login");
      }
    };
    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center gap-4">
      <Image src="/logo/dp-monogram-indigo.svg" alt="Draftpace" width={36} height={36}/>
      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
      <p className="text-[13px] text-gray-400">Signing you in...</p>
    </div>
  );
}
