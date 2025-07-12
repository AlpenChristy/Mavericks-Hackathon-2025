import { Item, SwapRequest } from '../types';

export const mockItems: Item[] = [
  {
    id: '1',
    title: 'Vintage Denim Jacket',
    description: 'Classic blue denim jacket in excellent condition. Perfect for layering and adding a vintage touch to any outfit.',
    category: 'Outerwear',
    type: 'Jacket',
    size: 'M',
    condition: 'Excellent',
    tags: ['vintage', 'denim', 'casual', 'blue'],
    images: [
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    uploaderId: 'user-1',
    uploaderName: 'Sarah Johnson',
    pointsValue: 45,
    status: 'available',
    approvalStatus: 'approved',
    uploadDate: '2024-01-15'
  },
  {
    id: '2',
    title: 'Black Wool Blazer',
    description: 'Professional black wool blazer, perfect for business meetings or formal events. Tailored fit with minimal wear.',
    category: 'Formal',
    type: 'Blazer',
    size: 'S',
    condition: 'Very Good',
    tags: ['formal', 'business', 'black', 'wool'],
    images: [
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040946/pexels-photo-1040946.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    uploaderId: 'user-2',
    uploaderName: 'Emma Davis',
    pointsValue: 60,
    status: 'available',
    approvalStatus: 'approved',
    uploadDate: '2024-01-16'
  },
  {
    id: '3',
    title: 'Striped Cotton T-Shirt',
    description: 'Comfortable cotton t-shirt with classic navy and white stripes. Great for casual wear and easy to style.',
    category: 'Casual',
    type: 'T-Shirt',
    size: 'L',
    condition: 'Good',
    tags: ['casual', 'cotton', 'striped', 'navy'],
    images: [
      'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    uploaderId: 'user-3',
    uploaderName: 'Mike Chen',
    pointsValue: 25,
    status: 'available',
    approvalStatus: 'approved',
    uploadDate: '2024-01-17'
  },
  {
    id: '4',
    title: 'Floral Summer Dress',
    description: 'Beautiful floral print summer dress in mint green. Perfect for warm weather and special occasions.',
    category: 'Dresses',
    type: 'Summer Dress',
    size: 'M',
    condition: 'Excellent',
    tags: ['floral', 'summer', 'dress', 'green'],
    images: [
      'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    uploaderId: 'user-4',
    uploaderName: 'Lisa Park',
    pointsValue: 55,
    status: 'available',
    approvalStatus: 'approved',
    uploadDate: '2024-01-18'
  },
  {
    id: '5',
    title: 'Leather Ankle Boots',
    description: 'Genuine leather ankle boots in brown. Comfortable and versatile, perfect for fall and winter styling.',
    category: 'Footwear',
    type: 'Boots',
    size: '8',
    condition: 'Very Good',
    tags: ['leather', 'boots', 'brown', 'autumn'],
    images: [
      'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    uploaderId: 'user-5',
    uploaderName: 'Anna Wilson',
    pointsValue: 70,
    status: 'available',
    approvalStatus: 'approved',
    uploadDate: '2024-01-19'
  },
  {
    id: '6',
    title: 'Designer Silk Scarf',
    description: 'Luxury silk scarf with geometric pattern. Adds elegance to any outfit, barely worn.',
    category: 'Accessories',
    type: 'Scarf',
    size: 'One Size',
    condition: 'Excellent',
    tags: ['silk', 'luxury', 'geometric', 'accessory'],
    images: [
      'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    uploaderId: 'user-6',
    uploaderName: 'Grace Lee',
    pointsValue: 40,
    status: 'available',
    approvalStatus: 'approved',
    uploadDate: '2024-01-20'
  }
];

export const mockSwapRequests: SwapRequest[] = [
  {
    id: 'swap-1',
    requesterId: 'user-7',
    requesterName: 'Tom Anderson',
    itemId: '1',
    itemTitle: 'Vintage Denim Jacket',
    offeredItemId: 'item-x',
    offeredItemTitle: 'Red Cardigan Sweater',
    message: 'Hi! I love your denim jacket and think it would be perfect for my style. Would you be interested in trading for my red cardigan?',
    status: 'pending',
    requestDate: '2024-01-21'
  }
];