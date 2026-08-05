import { useState } from "react";
import { Lock, User, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username and Password are required");
      return;
    }

    setLoading(true);

    try {
      const expectedUsername = import.meta.env.VITE_AUTH_USERNAME || "ephrem";
      const expectedPasswordHash =
        import.meta.env.VITE_AUTH_PASSWORD_HASH ||
        "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f";
      const enteredHash = await sha256(password.trim());

      // Brief delay to simulate validation and preserve the premium button spinner UX
      setTimeout(() => {
        setLoading(false);
        if (
          username.trim() === expectedUsername &&
          enteredHash === expectedPasswordHash
        ) {
          onLoginSuccess(expectedUsername);
        } else {
          setError("Invalid username or password");
        }
      }, 400);
    } catch (err) {
      console.error("Authentication error:", err);
      setLoading(false);
      setError("An error occurred during authentication.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl relative overflow-hidden bg-white/80 dark:bg-zinc-950/50 backdrop-blur-lg">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-violet-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-10 -mb-10" />

        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/20">
            <Lock className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome to Fortuna
          </CardTitle>
          <p className="text-xs text-zinc-400 font-semibold mt-1 uppercase tracking-wider">
            Sign in to track your expenses
          </p>
        </CardHeader>

        <CardContent className="p-6 pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="login-username">Username</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <Input
                  id="login-username"
                  type="text"
                  placeholder="ephrem"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl border border-red-500/10 bg-red-500/5 text-red-650 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-3 mt-2"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
