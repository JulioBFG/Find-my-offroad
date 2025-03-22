"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function JoinGroupPage() {
  const router = useRouter();
  const { user, loading, joinGroup } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [redirectedForAuth, setRedirectedForAuth] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const groupParam = urlParams.get("group");
      if (groupParam) {
        setGroupId(groupParam);
      }
    }
  }, []);

  useEffect(() => {
    if (!loading && !user && isClient && !redirectedForAuth) {
      setRedirectedForAuth(true);
      router.push(`/login?redirectTo=/join?group=${groupId}`);
    }
  }, [user, loading, router, groupId, isClient, redirectedForAuth]);

  const handleJoinGroup = async () => {
    if (!groupId) return;

    try {
      await joinGroup(groupId);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Fail to get into group";
      setError(error);
    }
  };


  if (!isClient || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4 md:p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold">Enter Group</h1>
          <p className="text-gray-600 text-sm md:text-base mt-2">
            You have been invited to enter in a tracking group
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-600 rounded text-sm">{error}</div>
        )}

        {success && (
          <div className="p-3 bg-green-100 text-green-600 rounded text-sm">
            You entered the group successfully! Redirecting...
          </div>
        )}

        {!success && (
          <div className="space-y-6">
            <div className="p-3 md:p-4 bg-gray-100 rounded-lg">
              <p className="font-medium text-sm">Group ID:</p>
              <p className="text-blue-600 break-all text-xs md:text-sm">{groupId}</p>
            </div>

            <div className="flex flex-col space-y-3">
              <Button onClick={handleJoinGroup} className="w-full">
                Enter Group
              </Button>

              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}