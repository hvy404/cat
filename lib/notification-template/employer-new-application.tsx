export const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Job Application Received</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f9fafb;
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
            color: #111827;
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

        .application-info {
            background-color: #f3f4f6;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
        }
        .application-info p {
            margin: 0 0 16px;
        }
        .application-info p:last-child {
            margin-bottom: 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #4b5563;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        .cta-button:hover {
            background-color: #374151;
        }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .footer a {
            color: #4b5563;
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
        <h1>New Job Application Received</h1>
        <div class="application-info">
            <p>Hello {{employerName}},</p>
            <p>We're excited to inform you that a new application has been submitted for the <strong>{{jobTitle}}</strong> position.</p>
            <p>This candidate has shown interest in your job posting and has submitted their application for your review.</p>
        </div>
        <p style="text-align: center; margin-bottom: 24px;">
            To review this application and access the candidate's details, please click the button below:
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
            <a href="{{applicationUrl}}" class="cta-button" style="display: inline-block; padding: 14px 28px; background-color: #4b5563; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Review Application</a>
        </div>

        <div class="footer">
            <p>© 2024 G2Xchange - Talent. All rights reserved.</p>
            <p>You're receiving this email because you have an active job posting on our platform.</p>
            <p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`;
