import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hrapp.com' },
    update: {},
    create: {
      email: 'admin@hrapp.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Create HR user
  const hrPasswordHash = await bcrypt.hash('hr123', 10);
  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@hrapp.com' },
    update: {},
    create: {
      email: 'hr@hrapp.com',
      passwordHash: hrPasswordHash,
      firstName: 'HR',
      lastName: 'Manager',
      role: 'HR',
    },
  });

  // Create sample people
  const people = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      position: 'Software Engineer',
      department: 'Engineering',
      startDate: new Date('2023-01-15'),
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      position: 'Senior Frontend Developer',
      department: 'Engineering',
      startDate: new Date('2022-11-01'),
    },
    {
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@company.com',
      position: 'Product Manager',
      department: 'Product',
      startDate: new Date('2023-03-20'),
    },
    {
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@company.com',
      position: 'UX Designer',
      department: 'Design',
      startDate: new Date('2023-02-10'),
    },
    {
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@company.com',
      position: 'DevOps Engineer',
      department: 'Engineering',
      startDate: new Date('2022-12-05'),
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@company.com',
      position: 'Marketing Specialist',
      department: 'Marketing',
      startDate: new Date('2023-04-01'),
    },
    {
      firstName: 'Alex',
      lastName: 'Wilson',
      email: 'alex.wilson@company.com',
      position: 'Sales Representative',
      department: 'Sales',
      startDate: new Date('2023-01-30'),
    },
    {
      firstName: 'Lisa',
      lastName: 'Garcia',
      email: 'lisa.garcia@company.com',
      position: 'QA Engineer',
      department: 'Engineering',
      startDate: new Date('2023-03-15'),
    },
  ];

  for (const person of people) {
    await prisma.person.upsert({
      where: { email: person.email },
      update: {},
      create: person,
    });
  }

  console.log('Seed completed successfully');
  console.log('Created users:');
  console.log('- Admin: admin@hrapp.com / admin123');
  console.log('- HR Manager: hr@hrapp.com / hr123');
  console.log(`Created ${people.length} sample people`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });