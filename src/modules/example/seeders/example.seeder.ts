import { DataSource } from 'typeorm';
import { ExampleEntity } from '../entities/example.entity';

export class ExampleSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const repository = this.dataSource.getRepository(ExampleEntity);

    // Check if data already exists
    const existingCount = await repository.count();
    if (existingCount > 0) {
      console.log('Example data already exists, skipping seeding...');
      return;
    }

    // Sample data
    const examples = [
      {
        name: 'First Example',
        description: 'This is the first example item',
        isActive: true,
      },
      {
        name: 'Second Example',
        description: 'This is the second example item',
        isActive: true,
      },
      {
        name: 'Third Example',
        description: 'This is the third example item',
        isActive: false,
      },
    ];

    // Insert data
    for (const exampleData of examples) {
      const example = repository.create(exampleData);
      await repository.save(example);
      console.log(`Created example: ${example.name}`);
    }

    console.log('Example seeding completed successfully!');
  }
}

// Standalone execution
if (require.main === module) {
  void import('../../../config/database/database.config').then(
    async (configModule) => {
      const dataSource = configModule.AppDataSource;

      try {
        await dataSource.initialize();
        console.log('Database connection established');

        const seeder = new ExampleSeeder(dataSource);
        await seeder.run();

        console.log('Seeding completed successfully!');
      } catch (error) {
        console.error('Seeding failed:', error);
      } finally {
        await dataSource.destroy();
        console.log('Database connection closed');
      }
    },
  );
}
