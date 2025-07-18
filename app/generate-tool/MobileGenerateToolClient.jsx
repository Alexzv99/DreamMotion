import { useState } from 'react';
import Button from '../components/Button';

export default function MobileGenerateToolClient() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleGenerate = async () => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPreviewUrl('https://via.placeholder.com/512x512.png?text=Mobile+Preview');
    }, 2000);
  };

  return (
    <main style={{
      minHeight: '100vh',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      color: '#222',
      padding: '20px',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f7f7f7',
    }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Mobile Generate Tool</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Button onClick={handleGenerate}>Generate</Button>
          {previewUrl && <img src={previewUrl} alt="Preview" style={{ marginTop: '20px', maxWidth: '100%' }} />}
        </>
      )}
    </main>
  );
}
