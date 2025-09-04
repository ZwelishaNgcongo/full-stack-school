// scripts/seed.js or prisma/seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (optional - be careful in production!)
    console.log('🗑️  Clearing existing data...');
    await prisma.student.deleteMany();
    await prisma.class.deleteMany();
    await prisma.grade.deleteMany();

    // Create grades first (R, 1-12)
    console.log('📚 Creating grades...');
    const grades = [];
    for (let level = 0; level <= 12; level++) {
      const grade = await prisma.grade.create({
        data: { level }
      });
      grades.push(grade);
      console.log(`✅ Created Grade ${level === 0 ? 'R' : level}`);
    }

    // Create classes for each grade (A-F)
    console.log('🏫 Creating classes...');
    const classLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    let classCount = 0;
    
    for (const grade of grades) {
      for (const letter of classLetters) {
        const className = `${grade.level === 0 ? 'R' : grade.level}${letter}`;
        await prisma.class.create({
          data: {
            name: className,
            capacity: 45,
            gradeId: grade.id
          }
        });
        classCount++;
      }
      console.log(`✅ Created classes for Grade ${grade.level === 0 ? 'R' : grade.level}`);
    }

    console.log(`🎉 Seeding completed successfully!`);
    console.log(`📊 Created ${grades.length} grades and ${classCount} classes`);

    // Verify the data
    const totalGrades = await prisma.grade.count();
    const totalClasses = await prisma.class.count();
    console.log(`📈 Verification: ${totalGrades} grades, ${totalClasses} classes in database`);

    // Show some example classes
    const sampleClasses = await prisma.class.findMany({
      take: 10,
      include: {
        grade: true
      }
    });
    console.log('📋 Sample classes:');
    sampleClasses.forEach(cls => {
      console.log(`   - ${cls.name} (Grade ${cls.grade.level === 0 ? 'R' : cls.grade.level})`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });