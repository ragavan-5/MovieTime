const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});


async function sendBookingConfirmationEmail({
    email,
    name,
    bookingId,
    movieTitle,
    date,
    time,
    screen,
    seats
}) {

    const mailOptions = {
        from: `"MovieTime" <${process.env.EMAIL_USER}>`,

        to: email,

        subject: `MovieTime Booking Confirmed - ${movieTitle}`,

        html: `
        <!DOCTYPE html>

        <html>

        <body
            style="
                margin:0;
                padding:0;
                background:#f4f4f4;
                font-family:Arial,sans-serif;
            "
        >

            <div
                style="
                    max-width:600px;
                    margin:30px auto;
                    background:white;
                    border-radius:10px;
                    overflow:hidden;
                    box-shadow:0 2px 10px rgba(0,0,0,0.1);
                "
            >

                <div
                    style="
                        background:#111827;
                        color:white;
                        padding:25px;
                        text-align:center;
                    "
                >

                    <h1 style="margin:0;">
                        MovieTime
                    </h1>

                    <p style="margin:8px 0 0;">
                        Booking Confirmed
                    </p>

                </div>


                <div style="padding:30px;">

                    <h2>
                        Hi ${name},
                    </h2>

                    <p>
                        Your movie ticket has been successfully booked.
                    </p>


                    <div
                        style="
                            background:#f9fafb;
                            border-radius:8px;
                            padding:20px;
                            margin:20px 0;
                        "
                    >

                        <h2 style="margin-top:0;">
                            ${movieTitle}
                        </h2>

                        <p>
                            <strong>Date:</strong>
                            ${date}
                        </p>

                        <p>
                            <strong>Time:</strong>
                            ${time}
                        </p>

                        <p>
                            <strong>Screen:</strong>
                            ${screen}
                        </p>

                        <p>
                            <strong>Seats:</strong>
                            ${seats.join(", ")}
                        </p>

                        <p>
                            <strong>Booking ID:</strong>
                            ${bookingId}
                        </p>

                    </div>


                    <p>
                        Please show this booking ID when required at the theatre.
                    </p>

                    <p>
                        Enjoy your movie! 🎬
                    </p>

                </div>


                <div
                    style="
                        background:#f9fafb;
                        padding:20px;
                        text-align:center;
                        color:#6b7280;
                        font-size:13px;
                    "
                >

                    This is an automated email from MovieTime.

                </div>

            </div>

        </body>

        </html>
        `
    };


    return transporter.sendMail(
        mailOptions
    );
}


async function sendBookingCancellationEmail({
    email,
    name,
    bookingId,
    movieTitle,
    date,
    time,
    screen,
    seats
}) {

    const mailOptions = {
        from: `"MovieTime" <${process.env.EMAIL_USER}>`,

        to: email,

        subject: `MovieTime Booking Cancelled - ${movieTitle}`,

        html: `
        <!DOCTYPE html>

        <html>

        <body
            style="
                margin:0;
                padding:0;
                background:#f4f4f4;
                font-family:Arial,sans-serif;
            "
        >

            <div
                style="
                    max-width:600px;
                    margin:30px auto;
                    background:white;
                    border-radius:10px;
                    overflow:hidden;
                "
            >

                <div
                    style="
                        background:#991b1b;
                        color:white;
                        padding:25px;
                        text-align:center;
                    "
                >

                    <h1 style="margin:0;">
                        MovieTime
                    </h1>

                    <p>
                        Booking Cancelled
                    </p>

                </div>


                <div style="padding:30px;">

                    <h2>
                        Hi ${name},
                    </h2>

                    <p>
                        Your MovieTime booking has been successfully cancelled.
                    </p>


                    <div
                        style="
                            background:#f9fafb;
                            border-radius:8px;
                            padding:20px;
                            margin:20px 0;
                        "
                    >

                        <h2 style="margin-top:0;">
                            ${movieTitle}
                        </h2>

                        <p>
                            <strong>Date:</strong>
                            ${date}
                        </p>

                        <p>
                            <strong>Time:</strong>
                            ${time}
                        </p>

                        <p>
                            <strong>Screen:</strong>
                            ${screen}
                        </p>

                        <p>
                            <strong>Seats:</strong>
                            ${seats.join(", ")}
                        </p>

                        <p>
                            <strong>Booking ID:</strong>
                            ${bookingId}
                        </p>

                    </div>


                    <p>
                        Your selected seats have been released and are now available for booking again.
                    </p>

                </div>


                <div
                    style="
                        background:#f9fafb;
                        padding:20px;
                        text-align:center;
                        color:#6b7280;
                        font-size:13px;
                    "
                >

                    This is an automated email from MovieTime.

                </div>

            </div>

        </body>

        </html>
        `
    };
    

    return transporter.sendMail(
        mailOptions
    );
}


module.exports = {
    sendBookingConfirmationEmail,
    sendBookingCancellationEmail
};