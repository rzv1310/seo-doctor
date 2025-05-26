import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { logger, withLogging } from '@/lib/logger';



type ContactFormData = {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
};

export const POST = withLogging(async (request: NextRequest) => {
    try {
        const formData: ContactFormData = await request.json();

        logger.info('Contact form submission', {
            name: formData.name,
            email: formData.email,
            subject: formData.subject
        });

        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            logger.warn('Contact form validation failed', { missingFields: true });
            return NextResponse.json(
                {
                    success: false,
                    message: 'Toate câmpurile obligatorii trebuie completate'
                },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            logger.warn('Contact form invalid email', { email: formData.email });
            return NextResponse.json(
                {
                    success: false,
                    message: 'Adresa de email nu este validă'
                },
                { status: 400 }
            );
        }

        // Create Nodemailer transporter
        // For production, you should use real SMTP credentials
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.example.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || 'user@example.com',
                pass: process.env.SMTP_PASSWORD || 'password',
            },
        });

        // Email content
        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@seodoctor.ro',
            to: process.env.CONTACT_EMAIL || 'contact@seodoctor.ro',
            replyTo: formData.email,
            subject: `Formular de contact: ${formData.subject}`,
            text: `
Nume: ${formData.name}
Email: ${formData.email}
Telefon: ${formData.phone || 'Nu a fost furnizat'}
Subiect: ${formData.subject}

Mesaj:
${formData.message}
      `,
            html: `
<h2>Mesaj nou de la formularul de contact</h2>
<p><strong>Nume:</strong> ${formData.name}</p>
<p><strong>Email:</strong> ${formData.email}</p>
<p><strong>Telefon:</strong> ${formData.phone || 'Nu a fost furnizat'}</p>
<p><strong>Subiect:</strong> ${formData.subject}</p>
<h3>Mesaj:</h3>
<p>${formData.message.replace(/\n/g, '<br>')}</p>
      `
        };

        if (process.env.NODE_ENV === 'development') {
            logger.info('Contact form email (DEV MODE - not sent)', {
                to: mailOptions.to,
                subject: mailOptions.subject,
                from: formData.email
            });

            return NextResponse.json({
                success: true,
                message: 'Mesajul a fost primit cu succes! (Modul dezvoltare - Email-ul nu a fost trimis)'
            });
        }

        await transporter.sendMail(mailOptions);

        logger.info('Contact form email sent successfully', {
            to: mailOptions.to,
            subject: mailOptions.subject
        });

        return NextResponse.json({
            success: true,
            message: 'Mesajul a fost trimis cu succes! Vă vom contacta în cel mai scurt timp.'
        });

    } catch (error) {
        logger.error('Error processing contact form', { error: error instanceof Error ? error.message : String(error) });

        return NextResponse.json(
            {
                success: false,
                message: 'A apărut o eroare la trimiterea mesajului. Vă rugăm să încercați din nou mai târziu.'
            },
            { status: 500 }
        );
    }
});
