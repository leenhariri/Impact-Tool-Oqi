// pages/register.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/login.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const sanitize = (value: string): string =>
    value.trim().replace(/[<>"]/g, "");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const safeEmail = sanitize(email);
    const safeName = sanitize(name);
    const safePassword = sanitize(password);

    if (!safeEmail || !safeName || !safePassword) {
      setError("All fields are required");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: safeEmail,
          name: safeName,
          password: safePassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Registration failed");
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
            background: "linear-gradient(rgba(17,23,48,0.5), rgba(17,23,48,0.5))",
          }}
        />
      </div>

      <div className={styles.formWrapper}>
        <form onSubmit={handleRegister} className={styles.form}>
          <h2 className={styles.title}>Register</h2>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            required
          />
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
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>Register</button>
          {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
