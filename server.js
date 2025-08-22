import Fastify from 'fastify';
import nodemailer from 'nodemailer';
import cors from '@fastify/cors';
import fastifyFormbody from "@fastify/formbody";
import fastifyStatic from "@fastify/static";
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
const host = ("RENDER" in process.env) ? `0.0.0.0` : `localhost`;

// Initialisation du serveur Fastify
const fastify = Fastify({ logger: true });
const rootDir = dirname((fileURLToPath(import.meta.url)))

// Configuration CORS
await fastify.register(cors, {
  origin: true, // À restreindre en production
  methods: ['POST']
});

// Configuration du transporteur Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'amslubfontainegeneration@gmail.com',
    pass: 'wnzzjzzeqbdmixag'
  }
});

fastify.register(fastifyStatic, {
    root: join(rootDir, '')
})
fastify.register(fastifyFormbody)

// Template email HTML
const emailTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Montserrat', Arial, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1e293b;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #ec4899, #8b5cf6);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: white;
      font-size: 28px;
    }
    .content {
      padding: 30px;
    }
    .detail-item {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #334155;
    }
    .detail-item:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 5px;
    }
    .footer {
      background-color: #0f172a;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nouveau message de contact</h1>
    </div>
    <div class="content">
      <div class="detail-item">
        <div class="label">Nom complet</div>
        <div>${data.name}</div>
      </div>
      <div class="detail-item">
        <div class="label">Email</div>
        <div>${data.email}</div>
      </div>
      <div class="detail-item">
        <div class="label">Type de projet</div>
        <div>${data.projectType}</div>
      </div>
      <div class="detail-item">
        <div class="label">Message</div>
        <div>${data.message}</div>
      </div>
    </div>
    <div class="footer">
      <p>© 2025 chicEtudiant - Tous droits réservés</p>
      <p>Ce message a été envoyé depuis le formulaire de contact de votre site web</p>
    </div>
  </div>
</body>
</html>
`;

// Page de maintenance HTML
const maintenancePage = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site en construction - LiboriusDev</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            font-family: 'Montserrat', sans-serif;
            background: #0f172a;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            padding: 40px;
            background: linear-gradient(to right, #1e293b, #334155);
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            border: 1px solid #4f46e5;
        }
        h1 {
            color: #3b82f6;
            margin-bottom: 20px;
            font-size: 2.5rem;
        }
        p {
            font-size: 1.2rem;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .construction-icon {
            font-size: 4rem;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        .contact-link {
            color: #3b82f6;
            text-decoration: none;
            font-weight: bold;
        }
        .contact-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="construction-icon">🚧</div>
        <h1>Site en construction</h1>
        <p>Nous travaillons actuellement sur cette section du site. Revenez bientôt pour découvrir nos nouvelles fonctionnalités!</p>
        <p>En attendant, vous pouvez nous contacter à <a href="mailto:amsnewtec@gmail.com" class="contact-link">amsnewtec@gmail.com</a></p>
        <p><a href="/" class="contact-link">← Retour à la page d'accueil</a></p>
    </div>
</body>
</html>
`;

// Route pour la page d'accueil
fastify.get('/', async (req, res) => {
  return res.redirect('index.html');
});

// Route pour le formulaire de contact
fastify.post('/api/contact', async (request, reply) => {
  const { name, email, projectType, message } = request.body;

  const mailOptions = {
    from: 'amslubfontainegeneration@gmail.com',
    to: 'amslubfontainegeneration@gmail.com',
    subject: `Nouveau message de ${name} - Type: ${projectType}`,
    html: emailTemplate({ name, email, projectType, message })
  };

  try {
    await transporter.sendMail(mailOptions);
    reply.send({ success: true, message: 'Message envoyé avec succès' });
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ success: false, message: 'Erreur lors de l\'envoi du message' });
  }
});

// Handler pour toutes les autres routes - page de maintenance
fastify.setNotFoundHandler((request, reply) => {
  if (request.raw.url !== '/' && !request.raw.url.includes('.')) {
    reply.type('text/html').send(maintenancePage);
  } else {
    reply.callNotFound();
  }
});

// Démarrage du serveur
fastify.listen({host: host, port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`Server listening on ${address}`)
});
