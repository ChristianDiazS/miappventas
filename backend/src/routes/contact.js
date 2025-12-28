const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const logger = require('../config/logger.js');

// Configurar el transportador de email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * POST /api/contact
 * Recibe un mensaje de contacto y lo envía por email
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validaciones
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y mensaje son requeridos',
      });
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido',
      });
    }

    // Limitar longitud del mensaje
    if (message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'El mensaje no puede exceder 5000 caracteres',
      });
    }

    // Preparar el contenido del email
    const emailContent = `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${phone ? `<p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>` : ''}
      ${subject ? `<p><strong>Asunto:</strong> ${escapeHtml(subject)}</p>` : ''}
      <h3>Mensaje:</h3>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `;

    // Enviar email a soporte
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'soporte@unpoquitovariado.com',
      replyTo: email,
      subject: `Nuevo contacto: ${subject || 'Sin asunto'}`,
      html: emailContent,
    });

    // Enviar confirmación al cliente
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Hemos recibido tu mensaje - Un Poquito Variado',
      html: `
        <h2>¡Gracias por contactarnos!</h2>
        <p>Hola ${escapeHtml(name)},</p>
        <p>Hemos recibido tu mensaje y nos pondremos en contacto pronto.</p>
        <p>Nuestro equipo de soporte responde en 24-48 horas.</p>
        <p>Un cordial saludo,<br/>El equipo de Un Poquito Variado</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: 'Mensaje enviado correctamente. Nos contactaremos pronto.',
    });
  } catch (error) {
    logger.error(`Error al enviar contacto: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar tu solicitud. Intenta más tarde.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Función auxiliar para escapar caracteres HTML
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

module.exports = router;
