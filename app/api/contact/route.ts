import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Type for the form data
type ContactFormData = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const formData: ContactFormData = await request.json();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Toate câmpurile obligatorii trebuie completate' 
        },
        { status: 400 }
      );
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
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
    
    // In development mode, just log the email details
    if (process.env.NODE_ENV === 'development') {
      console.log('Email details (DEV MODE - not sent):', mailOptions);
      
      return NextResponse.json({
        success: true,
        message: 'Mesajul a fost primit cu succes! (Modul dezvoltare - Email-ul nu a fost trimis)'
      });
    }
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Mesajul a fost trimis cu succes! Vă vom contacta în cel mai scurt timp.'
    });
    
  } catch (error) {
    console.error('Error processing contact form:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'A apărut o eroare la trimiterea mesajului. Vă rugăm să încercați din nou mai târziu.' 
      },
      { status: 500 }
    );
  }
}