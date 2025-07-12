import fetch from 'node-fetch';

async function testAPI() {
  try {
    // Test the items API endpoint
    const response = await fetch('http://localhost:3001/api/items?userId=bc0e13f0-f08b-44ba-b805-6e1539212862&approvalStatus=');
    
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', response.headers);
    
    const data = await response.json();
    console.log('API Response Data:', JSON.stringify(data, null, 2));
    
    if (data.items) {
      console.log(`\nFound ${data.items.length} items:`);
      data.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title} (${item.approval_status})`);
      });
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI(); 