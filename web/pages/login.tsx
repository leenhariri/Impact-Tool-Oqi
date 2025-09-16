import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Basic frontend input sanitization
  const sanitize = (value: string): string =>
    value.trim().replace(/[<>"]/g, "");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const safeEmail = sanitize(email);
    const safePassword = sanitize(password);

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: safeEmail,
          password: safePassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Login failed");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.bannerWrapper}>
        <img
          src="/images/hero-oqi-bg.jpg"
          alt="Banner"
          className={styles.banner}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(rgba(17,23,48,0.5), rgba(17,23,48,0.5))",
          }}
        />
      </div>

      <div className={styles.formWrapper}>
        <form onSubmit={handleLogin} className={styles.form}>
          <h2 className={styles.title}>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>Login</button>
          {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
