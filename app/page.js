/* eslint-disable react/no-unescaped-entities */
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main style={{
      minHeight: "100vh",
      backgroundImage: "url('/background-1.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "Inter, Helvetica, Arial, sans-serif",
      color: "#222",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(2px)"
    }}>
      {/* Dark overlay */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0, 0, 0, 0.65)",
        zIndex: 0
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Navbar */}
        <nav style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
          color: "#fff"
        }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>DreamMotion</h1>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/" style={navLink}>Home</Link>
            <Link href="/dashboard" style={navLink}>Dashboard</Link>
            <Link href="/subscribe" style={navLink}>Subscribe</Link>
            <Link href="/login" style={navLink}>Login</Link>
          </div>
        </nav>

        {/* Welcome */}
        <div style={{
          textAlign: "center",
          marginBottom: "30px",
          color: "#fff"
        }}>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>Welcome to DreamMotion!</h2>
          <p style={{ fontSize: "1.1rem" }}>
            <span style={{ color: "#c00", fontWeight: "bold" }}>
              AI-powered image &amp; video generation. Select your model, aspect ratio, and more!
            </span><br />
            <span style={{ color: "#fff" }}>
              &quot;Unleash your creativity with cinematic motion.&quot;
            </span>
          </p>
        </div>

        {/* Tools Section */}
        <div style={toolsGrid}>
          <div style={rowStyle}>
            <ToolBox 
              title="🖼️ Generate Image"
              desc="Create stunning images from your prompt using our text-to-image tool."
              price="1 credit per image"
              link="/generate-tool?type=genimage"
            />
            <ToolBox 
              title="🎞️ Generate Video"
              desc="Transform images into cinematic motion with DreamMotion’s engine."
              price="5 credits / second"
              link="/generate-tool?type=genvideo"
            />
          </div>
          <div style={rowStyle}>
            <ToolBox 
              title="📽️ Text to Video"
              desc="Describe a scene and let DreamMotion create an animated video for you."
              price="2 credits / second"
              link="/generate-tool?type=text2video"
            />
            <ToolBox 
              title="🧬 Image to Video"
              desc="Upload a photo and animate it with cinematic motion."
              price="30 credits / second"
              link="/generate-tool?type=image2video"
            />
          </div>

          {/* Help */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
            <div style={boxStyle}>
              <h3 style={boxTitle}>🛠️ Need Help?</h3>
              <p style={boxText}>If you&apos;re stuck or have questions, we&apos;re here for you.</p>
              <button
                onClick={() => router.push("/contact")}
                style={{
                  marginTop: "15px",
                  padding: "10px 20px",
                  fontSize: "1rem",
                  backgroundColor: "#1a1a1a", // dark grey
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ToolBox({ title, desc, price, link }) {
  return (
    <div style={{
      backgroundColor: "#fff", // white
      color: "#222", // dark text
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      padding: "24px",
      marginBottom: "24px",
      cursor: "pointer",
      transition: "background 0.2s",
      width: "100%",
      maxWidth: "460px",
      textAlign: "center"
    }}>
      <h3 style={boxTitle}>{title}</h3>
      {title.includes("Image to Video") && (
        <p style={{ color: "#c00", fontWeight: "bold", marginBottom: "8px" }}>NSFW generation is allowed</p>
      )}
      <p style={boxText}>{desc}</p>
      <p style={{ marginTop: "10px", fontWeight: "bold", color: "#c00" }}>{price}</p>
      <Link href={link}>
        <button style={{
          backgroundColor: "#1a1a1a", // dark grey
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          padding: "12px 20px",
          marginBottom: "12px",
          cursor: "pointer",
          transition: "background 0.2s",
        }}>Open Tool</button>
      </Link>
    </div>
  );
}

// Styles
const navLink = {
  color: "#fff",
  fontWeight: "bold"
};

const toolsGrid = {
  maxWidth: "1200px",
  marginLeft: "auto",
  marginRight: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "30px"
};

const rowStyle = {
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "30px"
};

const boxStyle = {
  backgroundColor: "#f1f1f1",
  padding: "25px 30px",
  borderRadius: "12px",
  boxShadow: "0 0 12px rgba(0,0,0,0.05)",
  maxWidth: "460px",
  width: "100%",
  textAlign: "center"
};

const boxTitle = {
  marginBottom: "10px",
  color: "#111"
};

const boxText = {
  color: "#444"
};
