import { FormEvent, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import logo from "../../assets/logo.png";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function LoginScreen({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await onLogin(email.trim(), password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-[#090909] text-white flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#121212] p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="size-20 rounded-2xl bg-[84CC16] flex items-center justify-center border border-[#84CC16] overflow-hidden">
            <img src={logo} alt="Play" className="size-20 object-contain" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Admin Login</h1>
          <p className="mt-2 text-sm text-[#A0A0A0]">Sign in with an admin account to continue.</p>
        </div>

        <div className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#D4D4D4]">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A0A0A0]" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                className="h-11 border-white/10 bg-[#1A1A1A] pl-10 text-white placeholder:text-[#777] hover:bg-[#1A1A1A] focus:bg-[#1A1A1A] focus-visible:bg-[#1A1A1A]"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#D4D4D4]">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A0A0A0]" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                className="h-11 border-white/10 bg-[#1A1A1A] pl-10 pr-10 text-white placeholder:text-[#777] hover:bg-[#1A1A1A] focus:bg-[#1A1A1A] focus-visible:bg-[#1A1A1A]"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] transition-colors hover:text-[#D4D4D4]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full bg-[#84CC16] text-black hover:bg-[#84CC16]/90"
          >
            {isLoading ? "Signing in..." : "Login"}
          </Button>
        </div>
      </form>
    </div>
  );
}
