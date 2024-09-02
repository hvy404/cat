export const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Resume Has Been Viewed</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #0056b3;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 22px;
        }
        .content {
            padding: 20px;
            background-color: #f9f9f9;
        }
        .button {
            display: inline-block;
            background-color: #0056b3;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 3px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="header">
        Your Resume Has Been Viewed
    </div>
    <div class="content">
        <p>Dear [Candidate Name],</p>
        
        <p>We're pleased to inform you that an employer has reviewed your resume for the following position:</p>
        
        <p><strong>[Job Name]</strong></p>
        
        <p>This indicates that our platform has identified you as a potential match for this role, and the employer has expressed interest in your profile.</p>
        
        <p>Key points:</p>
        <ul>
            <li>No immediate action is required on your part.</li>
            <li>The employer may contact you directly if they wish to proceed.</li>
            <li>You're welcome to apply for the position if interested.</li>
        </ul>
        
        <p>To view the job details:</p>
        
        <a href="[Job Link]" class="button">View Job Posting</a>
        
        <p>If you have any questions, please contact our support team.</p>
        
        <p>Best regards,<br>G2X Talent Team</p>
    </div>
    <div class="footer">
        Sent to [email address]. Manage your notification preferences in your account settings.
    </div>
</body>
</html>`;