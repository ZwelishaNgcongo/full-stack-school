// scripts/seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Check what already exists
    const existingGrades = await prisma.grade.count();
    const existingClasses = await prisma.class.count();
    
    console.log(`📊 Current database state:`);
    console.log(`   - Grades: ${existingGrades}`);
    console.log(`   - Classes: ${existingClasses}\n`);

    // Only delete classes, NOT grades
    if (existingClasses > 0) {
      console.log('🗑️  Deleting existing classes...');
      await prisma.class.deleteMany();
      console.log('✅ Classes deleted\n');
    }

    // Create or use existing grades - BUT with guaranteed order!
    let grades = [];
    
    if (existingGrades === 0) {
      console.log('📚 Creating grades (R=0, 1-12)...');
      for (let level = 0; level <= 12; level++) {
        const grade = await prisma.grade.create({
          data: { level }
        });
        grades.push(grade);
        console.log(`✅ Created Grade ${level === 0 ? 'R' : level} (ID: ${grade.id}, Level: ${grade.level})`);
      }
      console.log();
    } else {
      console.log('📚 Using existing grades from database...');
      grades = await prisma.grade.findMany({
        orderBy: { level: 'asc' }
      });
      console.log(`✅ Found ${grades.length} grades:`);
      grades.forEach(g => {
        console.log(`   - ID ${g.id}: Grade ${g.level === 0 ? 'R' : g.level} (level=${g.level})`);
      });
      console.log();
    }

    // Create classes for each grade (A-F)
    console.log('🏫 Creating classes A-F for each grade...\n');
    const classLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    let classCount = 0;
    
    for (const grade of grades) {
      const gradeLabel = grade.level === 0 ? 'R' : grade.level;
      
      for (const letter of classLetters) {
        const className = `${gradeLabel}${letter}`;
        
        await prisma.class.create({
          data: {
            name: className,
            capacity: 45,
            gradeId: grade.id
          }
        });
        classCount++;
      }
      console.log(`✅ Created 6 classes for Grade ${gradeLabel} (gradeId: ${grade.id}): ${gradeLabel}A - ${gradeLabel}F`);
    }

    console.log(`\n🎉 Seeding completed successfully!`);
    console.log(`📊 Final Summary:`);
    console.log(`   - Total grades: ${grades.length}`);
    console.log(`   - Classes created: ${classCount}`);

    // Verify the data with detailed info
    const allClasses = await prisma.class.findMany({
      include: {
        grade: true
      },
      orderBy: [
        { grade: { level: 'asc' } },
        { name: 'asc' }
      ]
    });
    
    console.log('\n📋 All classes created:');
    console.log('Class Name | Grade Level | Grade ID | Class ID');
    console.log('-----------|-------------|----------|----------');
    allClasses.forEach(cls => {
      const gradeLabel = cls.grade.level === 0 ? 'R' : cls.grade.level;
      console.log(`${cls.name.padEnd(10)} | ${String(gradeLabel).padEnd(11)} | ${String(cls.grade.id).padEnd(8)} | ${cls.id}`);
    });

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    console.error('Details:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seed function
seedDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });