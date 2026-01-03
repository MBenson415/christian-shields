const sql = require('mssql');

module.exports = async function (context, req) {
    const email = req.body && req.body.email;

    if (!email) {
        context.res = {
            status: 400,
            body: "Please pass an email in the request body"
        };
        return;
    }

    // Configuration from environment variables
    const config = {
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        server: process.env.SQL_SERVER, 
        database: process.env.SQL_DATABASE,
        options: {
            encrypt: true,
            enableArithAbort: true,
            trustServerCertificate: true // Added to handle potential SSL certificate issues
        }
    };

    try {
        const pool = await sql.connect(config);
        
        // Check existence and insert or update
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query(`
                IF EXISTS (SELECT 1 FROM dbo.CHRISTIAN_SHIELDS_MEMBERS WHERE email = @email)
                BEGIN
                    IF EXISTS (SELECT 1 FROM dbo.CHRISTIAN_SHIELDS_MEMBERS WHERE email = @email AND is_email_subscribed = 0)
                    BEGIN
                        UPDATE dbo.CHRISTIAN_SHIELDS_MEMBERS SET is_email_subscribed = 1, modified = GETDATE() WHERE email = @email;
                        SELECT 'Updated' as status;
                    END
                    ELSE
                    BEGIN
                        SELECT 'AlreadySubscribed' as status;
                    END
                END
                ELSE
                BEGIN
                    INSERT INTO dbo.CHRISTIAN_SHIELDS_MEMBERS (email, is_email_subscribed, created, modified) VALUES (@email, 1, GETDATE(), GETDATE());
                    SELECT 'Inserted' as status;
                END
            `);

        const status = result.recordset[0].status;

        if (status === 'AlreadySubscribed') {
            context.res = {
                status: 409,
                body: { error: "Email already subscribed." }
            };
        } else {
            context.res = {
                status: 200,
                body: { message: "Successfully subscribed!" }
            };
        }
    } catch (err) {
        context.log.error(err);
        context.res = {
            status: 500,
            body: { error: "Database error", details: err.message }
        };
    }
};
