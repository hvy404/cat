export const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exceptional Candidate Match</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #374151; /* gray-700 */
            background-color: #f9fafb; /* gray-50 */
            margin: 0;
            padding: 0;
            font-size: 14px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #ffffff;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            max-width: 180px;
            height: auto;
        }
        h1 {
    color: #111827; /* gray-900 */
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 24px;
    text-align: center;
}

@media screen and (max-width: 480px) {
    h1 {
        font-size: 18px;
    }
}

        .match-info {
            background-color: #f3f4f6; /* gray-100 */
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
        }
        .match-info p {
            margin: 0 0 16px;
        }
        .match-info p:last-child {
            margin-bottom: 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #4b5563; /* gray-600 */
            color: #ffffff;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        .cta-button:hover {
            background-color: #374151; /* gray-700 */
        }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #6b7280; /* gray-500 */
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb; /* gray-200 */
        }
        .footer a {
            color: #4b5563; /* gray-600 */
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://via.placeholder.com/180x60" alt="AI Recruiter Logo" class="logo">
        </div>
        <h1>Exceptional Candidate Match Found</h1>
        <div class="match-info">
            <p>Hello {{employerName}},</p>
            <p>We've found an exceptional match for the <strong>{{jobTitle}}</strong> position.</p>
            <p><strong>Candidate Name:</strong> {{candidateName}}</p>
            <p>Our intelligent matching system has identified a remarkable alignment between this candidate's profile and your specific job requirements, revealing a high-potential fit.</p>
        </div>
        <p style="text-align: center; margin-bottom: 24px;">
  Ready to explore this potential match? Click the button below to view the detailed match report in your dashboard:
</p>
<div style="text-align: center; margin-bottom: 32px;">
  <a href="{{matchReportUrl}}" class="cta-button" style="display: inline-block; padding: 14px 28px; background-color: #4b5563; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Match Report</a>
</div>
<p style="text-align: center; font-size: 14px; color: #6b7280; margin-top: 24px;">
  If you have any questions or need further information, please don't hesitate to reach out to our support team.
</p>

        <div class="footer">
            <p>© 2024 G2Xchange - Talent. All rights reserved.</p>
            <p>You're receiving this email because you're subscribed to candidate match notifications.</p>
            <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{preferencesUrl}}">Manage Preferences</a></p>
        </div>
    </div>
</body>
</html>`;
