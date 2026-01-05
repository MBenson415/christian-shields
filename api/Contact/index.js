const sql = require('mssql');
const nodemailer = require('nodemailer');

module.exports = async function (context, req) {
    const { name, email, subject, message, newsletterSignup } = req.body;

    if (!name || !email || !subject || !message) {
        context.res = {
            status: 400,
            body: "Please provide name, email, subject, and message."
        };
        return;
    }

    // 1. Handle Newsletter Signup (if checked)
    if (newsletterSignup) {
        try {
            const dbConfig = {
                user: process.env.SQL_USER,
                password: process.env.SQL_PASSWORD,
                server: process.env.SQL_SERVER, 
                database: process.env.SQL_DATABASE,
                options: {
                    encrypt: true,
                    enableArithAbort: true,
                    trustServerCertificate: true
                }
            };

            const pool = await sql.connect(dbConfig);
            
            // Upsert logic (same as Subscribe function)
            await pool.request()
                .input('email', sql.NVarChar, email)
                .query(`
                    IF EXISTS (SELECT 1 FROM dbo.CHRISTIAN_SHIELDS_MEMBERS WHERE email = @email)
                    BEGIN
                        UPDATE dbo.CHRISTIAN_SHIELDS_MEMBERS SET is_email_subscribed = 1 WHERE email = @email;
                    END
                    ELSE
                    BEGIN
                        INSERT INTO dbo.CHRISTIAN_SHIELDS_MEMBERS (email, is_email_subscribed) VALUES (@email, 1);
                    END
                `);
            
            // We don't stop execution if DB fails, we just log it, because the primary goal is sending the email.
        } catch (dbErr) {
            context.log.error("Database insertion failed:", dbErr);
            // Optional: decide if you want to fail the whole request or just continue
        }
    }

    // 2. Send Email
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"Christian Shields Website" <${process.env.SMTP_USER}>`, // Sender address
            to: "christianshields@christianshields.net", // List of receivers
            replyTo: email, // Allow replying directly to the user
            subject: `New Contact Form Submission: ${subject}`, // Subject line
            text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
            `, // plain text body
            html: `
<h3>New Contact Form Submission</h3>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Subject:</strong> ${subject}</p>
<hr/>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
            `, // html body
        };

        await transporter.sendMail(mailOptions);

        context.res = {
            status: 200,
            body: { message: "Message sent successfully!" }
        };

    } catch (emailErr) {
        context.log.error("Email sending failed:", emailErr);
        context.res = {
            status: 500,
            body: { error: "Failed to send message. Please try again later." }
        };
    }
};
