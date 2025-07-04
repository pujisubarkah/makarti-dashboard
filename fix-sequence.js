const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSequence() {
  try {
    // Check current max ID in kajian table
    const maxKajian = await prisma.kajian.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });

    console.log('Current max ID in kajian table:', maxKajian?.id || 0);

    // Reset the sequence to be higher than the current max ID
    if (maxKajian) {
      const nextId = maxKajian.id + 1;
      console.log('Setting sequence to:', nextId);
      
      // Execute raw SQL to reset the sequence
      await prisma.$executeRaw`
        SELECT setval(pg_get_serial_sequence('makarti.kajian', 'id'), ${nextId}, false);
      `;
      
      console.log('Sequence fixed successfully!');
    } else {
      console.log('No records found in kajian table');
    }

    // Test by creating a new record
    console.log('Testing with a new record...');
    const testKajian = await prisma.kajian.create({
      data: {
        judul: 'Test Kajian',
        jenis: 'Test',
        status: 'active',
        unit_kerja_id: 1
      }
    });

    console.log('Test record created successfully:', testKajian);

    // Delete the test record
    await prisma.kajian.delete({
      where: { id: testKajian.id }
    });

    console.log('Test record deleted. Sequence is working properly!');

  } catch (error) {
    console.error('Error fixing sequence:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSequence();
