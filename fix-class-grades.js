const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all classes
  const classes = await prisma.class.findMany({
    include: {
      grade: true
    }
  });

  console.log(`📊 Found ${classes.length} classes to check`);

  for (const cls of classes) {
    // Extract grade from class name (e.g., "2D" -> "2", "RF" -> "R")
    const match = cls.name.match(/^(R|\d{1,2})([A-F])$/i);
    
    if (!match) {
      console.log(`⚠️ Skipping ${cls.name} - invalid format`);
      continue;
    }

    const gradePart = match[1].toUpperCase(); // "R", "1", "2", etc.
    const expectedLevel = gradePart === "R" ? 0 : parseInt(gradePart);

    // Find the correct grade record
    const correctGrade = await prisma.grade.findFirst({
      where: { level: expectedLevel }
    });

    if (!correctGrade) {
      console.log(`❌ Class ${cls.name} - Grade level ${expectedLevel} not found in database!`);
      continue;
    }

    // Check if gradeId needs updating
    if (cls.gradeId !== correctGrade.id) {
      console.log(`🔧 Fixing ${cls.name}: gradeId ${cls.gradeId} -> ${correctGrade.id} (level ${expectedLevel})`);
      
      await prisma.class.update({
        where: { id: cls.id },
        data: { gradeId: correctGrade.id }
      });
      
      console.log(`✅ Fixed ${cls.name}`);
    } else {
      console.log(`✓ ${cls.name} already correct (gradeId: ${cls.gradeId}, level: ${expectedLevel})`);
    }
  }

  console.log('\n🎉 Done! All classes have been checked and fixed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });