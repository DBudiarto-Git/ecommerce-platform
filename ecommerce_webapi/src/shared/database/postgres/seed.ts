import 'dotenv/config';
import { PrismaClient } from '../../../generated/postgres-client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

// Da die .env Variablen-Erweiterungen hat, bauen wir die URL wie in prisma.config.ts stabil zusammen
const dbUser = process.env.DB_WRITE_USER || 'ecommerce_admin';
const dbPassword = process.env.DB_WRITE_PASSWORD || 'GeheimesSchreibPasswort123!';
const dbHost = process.env.DB_WRITE_HOST || 'localhost';
const dbPort = process.env.DB_WRITE_PORT || '5433';
const dbName = process.env.DB_WRITE_NAME || 'ecommerce_commands';

const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public`;

// Pool und Adapter initialisieren
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Den Adapter direkt an deinen spezifischen Write-Client übergeben
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starte PostgreSQL Master-Data Seeding mit Driver Adapter...');

  const rollen = ['ADMIN', 'MANAGER', 'PACKER', 'GUEST', 'CUSTOMER'];

  for (const rollenName of rollen) {
    const rolle = await prisma.roleWrite.upsert({
      where: { name: rollenName },
      update: {}, // Keine Änderungen, falls die Rolle bereits existiert
      create: {
        name: rollenName,
      },
    });
    console.log(`✅ Rolle registriert: ${rolle.name} (ID: ${rolle.id})`);
  }

  console.log('✅ Alle 5 Rollen erfolgreich angelegt.');

  // --- NEU: Initialen Admin-Benutzer anlegen ---
  const adminRole = await prisma.roleWrite.findUnique({
    where: { name: 'ADMIN' },
  });

  if (adminRole) {
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    const adminUser = await prisma.userWrite.upsert({
      where: { email: 'admin@shop.at' },
      update: {},
      create: {
        email: 'admin@shop.at',
        name: 'Super Admin',
        password: hashedPassword,
        isActive: true,
        roleId: adminRole.id,
      },
    });

    console.log(`✅ Initial-Admin bereit: ${adminUser.email} (Passwort: Admin123!)`);
  }

  console.log('🏁 Seeding erfolgreich abgeschlossen!');
}

main()
  .catch((e) => {
    console.error('❌ Fehler beim Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Schließt den Verbindungs-Pool sauber am Ende des Skripts
  });
