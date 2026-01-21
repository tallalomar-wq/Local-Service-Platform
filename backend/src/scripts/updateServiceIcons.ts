import { sequelize } from '../config/database';
import { ServiceCategory } from '../models';

// Map of service names to image paths
const serviceIcons: { [key: string]: string } = {
  'House Cleaning': '/images/services/house-cleaning.png',
  'Lawn Care': '/images/services/lawn-care.png',
  'Plumbing': '/images/services/plumbing.png',
  'Electrical': '/images/services/electrical.png',
  'Handyman': '/images/services/handyman.png',
  'Pet Grooming': '/images/services/pet-grooming.png',
  'Moving Services': '/images/services/moving.png',
  'HVAC Services': '/images/services/hvac.png',
  'Painting': '/images/services/painting.png',
  'Carpet Cleaning': '/images/services/carpet-cleaning.png',
};

async function updateServiceIcons() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    for (const [serviceName, iconPath] of Object.entries(serviceIcons)) {
      const service = await ServiceCategory.findOne({ where: { name: serviceName } });
      
      if (service) {
        await service.update({ icon: iconPath });
        console.log(`✓ Updated ${serviceName} icon to: ${iconPath}`);
      } else {
        console.log(`⚠ Service not found: ${serviceName}`);
      }
    }

    console.log('\n✅ Service icons updated successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Add your image files to: frontend/public/images/services/');
    console.log('2. Image files should be named:');
    Object.values(serviceIcons).forEach(path => {
      const filename = path.split('/').pop();
      console.log(`   - ${filename}`);
    });
    console.log('\n3. Recommended image specs:');
    console.log('   - Format: PNG with transparent background');
    console.log('   - Size: 200x200 pixels or larger');
    console.log('   - File size: < 100KB per image');

  } catch (error) {
    console.error('Error updating service icons:', error);
  } finally {
    await sequelize.close();
  }
}

updateServiceIcons();
