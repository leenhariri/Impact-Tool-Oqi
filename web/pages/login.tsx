import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        credentials: "include", // IMPORTANT: allows cookie to be set
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Login failed");
      }

      const data = await res.json();
      console.log("Login success", data);

      router.push("/dashboard"); // ✅ redirect to a protected page (adjust if needed)
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.bannerWrapper}>
        <img src="/images/oqi-banner.jpg" alt="Banner" className={styles.banner} />
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
