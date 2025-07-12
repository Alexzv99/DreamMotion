export default function CookiesPage() {
  return (
    <div
      style={{
        zIndex: 1,
        position: 'relative',
        maxWidth: '800px',
        margin: '120px auto',
        background: 'url("/abstract-bg.svg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px',
        borderRadius: '18px',
        color: '#222',
        fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '2.4rem', marginBottom: '20px' }}>Cookie Policy</h1>
      <p
        style={{
          lineHeight: 1.6,
          fontSize: '1.1rem',
          marginBottom: '20px',
          color: '#666',
        }}
      >
        We use cookies and similar technologies to improve your experience on DreamMotion,
        analyze traffic, and personalize content. By continuing to use our website, you
        agree to the use of cookies in accordance with this policy.
      </p>
      <p
        style={{
          lineHeight: 1.6,
          fontSize: '1.1rem',
          color: '#666',
        }}
      >
        You can choose to disable cookies in your browser settings. However, disabling cookies
        may affect the functionality of the site. For more information about how we use and manage cookies, 
        please review our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
