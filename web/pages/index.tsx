import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  const SDGS = [
    { num: 1,  title: "No Poverty",                              color: "#e5243b", url: "https://sdgs.un.org/goals/goal1" , icon: "/icons/sdg/image_logo_clean10008_60.jpg"},
    { num: 2,  title: "Zero Hunger",                             color: "#dda63a", url: "https://sdgs.un.org/goals/goal2" ,icon: "/icons/sdg/image_logo_clean10008_32.jpg" },
    { num: 3,  title: "Good Health & Well-being",                color: "#4c9f38", url: "https://sdgs.un.org/goals/goal3" ,icon: "/icons/sdg/image_logo_clean10008_68.jpg" },
    { num: 4,  title: "Quality Education",                       color: "#c5192d", url: "https://sdgs.un.org/goals/goal4" ,icon: "/icons/sdg/image_logo_clean10008_16.jpg"  },
    { num: 5,  title: "Gender Equality",                         color: "#ff3a21", url: "https://sdgs.un.org/goals/goal5"  ,icon: "/icons/sdg/image_logo_clean10008_44.jpg" },
    { num: 6,  title: "Clean Water & Sanitation",                color: "#26bde2", url: "https://sdgs.un.org/goals/goal6"  ,icon: "/icons/sdg/image_logo_clean10008_28.jpg" },
    { num: 7,  title: "Affordable & Clean Energy",               color: "#fcc30b", url: "https://sdgs.un.org/goals/goal7"  ,icon: "/icons/sdg/image_logo_clean10008_8.jpg" },
    { num: 8,  title: "Decent Work & Economic Growth",           color: "#a21942", url: "https://sdgs.un.org/goals/goal8"  ,icon: "/icons/sdg/image_logo_clean10008_20.jpg"},
    { num: 9,  title: "Industry, Innovation & Infrastructure",   color: "#fd6925", url: "https://sdgs.un.org/goals/goal9"   ,icon: "/icons/sdg/image_logo_clean10008_12.jpg"},
    { num: 10, title: "Reduced Inequalities",                    color: "#dd1367", url: "https://sdgs.un.org/goals/goal10" ,icon: "/icons/sdg/image_logo_clean10008_36.jpg"},
    { num: 11, title: "Sustainable Cities & Communities",        color: "#fd9d24", url: "https://sdgs.un.org/goals/goal11",icon: "/icons/sdg/image_logo_clean10008_40.jpg" },
    { num: 12, title: "Responsible Consumption & Production",    color: "#bf8b2e", url: "https://sdgs.un.org/goals/goal12" ,icon: "/icons/sdg/image_logo_clean10008_64.jpg"},
    { num: 13, title: "Climate Action",                          color: "#3f7e44", url: "https://sdgs.un.org/goals/goal13",icon: "/icons/sdg/image_logo_clean10008_72.jpg" },
    { num: 14, title: "Life Below Water",                        color: "#0a97d9", url: "https://sdgs.un.org/goals/goal14",icon: "/icons/sdg/image_logo_clean10008_76.jpg" },
    { num: 15, title: "Life on Land",                            color: "#56c02b", url: "https://sdgs.un.org/goals/goal15",icon: "/icons/sdg/image_logo_clean10008_4.jpg" },
    { num: 16, title: "Peace, Justice & Strong Institutions",    color: "#00689d", url: "https://sdgs.un.org/goals/goal16" ,icon: "/icons/sdg/image_logo_clean10008_48.jpg"},
    { num: 17, title: "Partnerships for the Goals",              color: "#19486a", url: "https://sdgs.un.org/goals/goal17",icon: "/icons/sdg/image_logo_clean10008_56.jpg" },
  ];

  const handleAccessClick = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/me`, {
        credentials: "include",
      });
      if (res.ok) router.push("/dashboard");
      else router.push("/login");
    } catch (err) {
      console.error("Auth check failed:", err);
      router.push("/login");
    }
  };

  return (
    <>
      <Head>
        <title>Home | OQI Impact Tool</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Arvo&family=Inter&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Hero Section */}
      <section className="hero">
        <div>
          <h1 className="arvo-title">OQI Impact Tool</h1>
          <p className="arvo-subtext">
            Assess, collaborate, and accelerate quantum-for-impact projects.
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="home-container">
        <p>
          This user guide has been created for the Open Quantum Institute (OQI), in
          partnership with the UN Beyond Lab and GESDA, in order to support the
          exploration of quantum computing use cases and anticipate their impact once
          deployed in the real-world on the United Nations Sustainable Development Goals
          (SDGs) and beyond.
        </p>
      </section>

      {/* SDG Grid Section */}
      <section className="sdgSection home-container">
        <h2 className="arvo-section" style={{ marginBottom: 16 }}>
          Explore the Sustainable Development Goals
        </h2>
<div className="sdg-intro">
    
    <p className="sdg-intro-text">
      The Sustainable Development Goals are a call for action by all countries – poor,
      rich and middle-income – to promote prosperity while protecting the planet.
      They recognize that ending poverty must go hand-in-hand with strategies that
      build economic growth and address a range of social needs including education,
      health, social protection, and job opportunities, while tackling climate change
      and environmental protection.
    </p>
  </div>
        <div className="sdgGrid">
          {SDGS.map((g) => (
            <a
              key={g.num}
              className="sdg"
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: g.color }}
              aria-label={`SDG ${g.num} ${g.title}`}
            >
              <img src={g.icon} alt={`SDG ${g.num} icon`} className="sdg-icon" />
              <span className="sdg-number">{g.num}</span>
              <span className="sdg-title">{g.title}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Partners Section */}
      <section className="home-container">
        <hr />
        <h2 className="arvo-section w3-center" style={{ marginBottom: 24 }}>
          Our Partners
        </h2>

        <div className="partners-logos">
          <a href="https://www.thebeyondlab.org/" target="_blank" rel="noopener noreferrer">
            <img src="/images/beyond-lab.png" className="partner-logo" alt="Beyond Lab" />
          </a>
          <a href="https://www.ungeneva.org/en/visit" target="_blank" rel="noopener noreferrer">
            <img src="/images/UN.png" className="partner-logo" alt="United Nations Geneva" />
          </a>

        </div>

        <hr />
        <div className="w3-center" style={{ marginTop: 32 }}>
          <button onClick={handleAccessClick} className="btn-pill">
            Access Tool
          </button>
        </div>
      </section>

      <style jsx>{`
        .arvo-title {
          font-family: 'Arvo', serif;
          font-size: 32px;
          font-weight: bold;
          margin-top: 40px;
          margin-bottom: 10px;
          text-align: center;
        }
        .arvo-subtext {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .arvo-section {
          font-family: 'Arvo', serif;
          font-size: 22px;
          font-weight: 600;
          margin-top: 24px;
          margin-bottom: 4px;
        }
        .home-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          line-height: 1.6;
          text-align: center;
        }

        /* SDG block styles */
        .sdgSection { text-align: center; padding-top: 0; }
        .sdgGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 14px;
          margin-top: 12px;
        }
        .sdg {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 120px;
          padding: 14px 10px;
          border-radius: 10px;
          color: #fff;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .sdg:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 18px rgba(0,0,0,0.18);
          filter: saturate(1.05);
        }
          .sdg-icon {
  width: 45px;
  height: 30px;
  margin-bottom: 8px;
}

        .sdg-number { font-size: 1.6rem; line-height: 1; margin-bottom: 6px; }
        .sdg-title { font-size: 0.9rem; font-weight: 600; text-align: center; line-height: 1.2; }

        .partners-logos {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 32px;
          flex-wrap: wrap;
          margin-top: 16px;
          margin-bottom: 32px;
        }
        .partner-logo { max-height: 80px; object-fit: contain; }

        .btn-pill {
          display: inline-block;
          padding: 12px 24px;
          background-color: #1a1a1a;
          color: white;
          border-radius: 999px;
          font-size: 16px;
          font-family: 'Inter', sans-serif;
          text-decoration: none;
          transition: background 0.2s ease-in-out;
          border: none;
          cursor: pointer;
        }
        .btn-pill:hover { background-color: #333; }

        hr { border: none; border-top: 1px solid #ddd; margin: 32px 0; }
      `}</style>
    </>
  );
}
