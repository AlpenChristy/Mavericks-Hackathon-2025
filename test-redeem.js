import fetch from 'node-fetch';

async function testRedeem() {
  try {
    // First, let's get a list of available items
    console.log('Getting available items...');
    const itemsResponse = await fetch('http://localhost:3001/api/items');
    const itemsData = await itemsResponse.json();
    
    console.log('Available items:');
    itemsData.items.forEach(item => {
      console.log(`- ${item.title} (${item.points_value} points) by ${item.uploader_name}`);
    });
    
    // Let's also check current user points
    console.log('\nChecking current user points...');
    const usersResponse = await fetch('http://localhost:3001/api/users');
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('User points:', usersData);
    }
    
  } catch (error) {
    console.error('Error testing redeem:', error);
  }
}

testRedeem(); 