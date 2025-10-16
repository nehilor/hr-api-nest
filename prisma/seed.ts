import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create sample monitoring project
  const sampleProject = await prisma.project.upsert({
    where: { apiKey: 'sample-api-key-12345' },
    update: {},
    create: {
      name: 'Sample Web App',
      apiKey: 'sample-api-key-12345',
    },
  });

  // Create sample events for demonstration
  const sampleEvents = [
    {
      projectId: sampleProject.id,
      title: 'TypeError: Cannot read property of undefined',
      message: 'Cannot read property \'name\' of undefined',
      stack: 'TypeError: Cannot read property \'name\' of undefined\n    at UserProfile.js:45:12\n    at ReactDOM.render (react-dom.js:1234:56)',
      fingerprint: 'typeerror-undefined-name-userprofile-45',
      environment: 'production',
      url: 'https://example.com/profile',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      metadata: { userId: 'user123', component: 'UserProfile' },
      count: 3,
    },
    {
      projectId: sampleProject.id,
      title: 'Network Error: Failed to fetch',
      message: 'Failed to fetch user data',
      stack: 'Error: Failed to fetch\n    at fetchUserData (api.js:23:8)\n    at loadUserProfile (profile.js:12:15)',
      fingerprint: 'network-error-fetch-userdata-api-23',
      environment: 'production',
      url: 'https://example.com/dashboard',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      metadata: { endpoint: '/api/users', statusCode: 500 },
      count: 1,
    },
  ];

  for (const event of sampleEvents) {
    await prisma.event.create({
      data: event,
    });
  }

  console.log('Seed completed successfully');
  console.log('Created monitoring project:');
  console.log(`- Project: ${sampleProject.name} (API Key: ${sampleProject.apiKey})`);
  console.log(`- Created ${sampleEvents.length} sample events`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });