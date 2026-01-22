import { calculateDistance, formatDistance, isValidCoordinates } from '../src/lib/utils/distance';

console.log('🧪 Testing Distance Calculation Functions\n');

// Test 1: Valid coordinates test
console.log('Test 1: Valid Coordinates Check');
console.log('  Valid (23.8, 90.4):', isValidCoordinates(23.8, 90.4)); // Should be true
console.log('  Invalid (null, 90.4):', isValidCoordinates(null, 90.4)); // Should be false
console.log('  Invalid (200, 90.4):', isValidCoordinates(200, 90.4)); // Should be false
console.log('');

// Test 2: Distance calculation (Dhaka examples)
console.log('Test 2: Distance Calculation');

// Mirpur to Dhanmondi (approximately 10-12 km)
const mirpurLat = 23.8103;
const mirpurLon = 90.4125;
const dhanmondiLat = 23.7465;
const dhanmondiLon = 90.3765;

const distance1 = calculateDistance(mirpurLat, mirpurLon, dhanmondiLat, dhanmondiLon);
console.log(`  Mirpur to Dhanmondi: ${distance1} km`);
console.log(`  Formatted: ${formatDistance(distance1)}`);
console.log('');

// Same location (should be ~0 km)
const distance2 = calculateDistance(mirpurLat, mirpurLon, mirpurLat, mirpurLon);
console.log(`  Same location: ${distance2} km`);
console.log(`  Formatted: ${formatDistance(distance2)}`);
console.log('');

// Very close distance (should be in meters)
const distance3 = calculateDistance(23.8103, 90.4125, 23.8108, 90.4130);
console.log(`  Very close (~500m): ${distance3} km`);
console.log(`  Formatted: ${formatDistance(distance3)}`);
console.log('');

// Test 3: Format distance
console.log('Test 3: Distance Formatting');
console.log('  0.5 km:', formatDistance(0.5)); // Should show "500 m"
console.log('  0.95 km:', formatDistance(0.95)); // Should show "950 m"
console.log('  1.2 km:', formatDistance(1.2)); // Should show "1.2 km"
console.log('  10.5 km:', formatDistance(10.5)); // Should show "10.5 km"
console.log('');

// Test 4: Real kitchen addresses from migration
console.log('Test 4: Kitchen Distance Examples');
console.log('  (Using example coordinates)');

// Example: User at Gulshan to Kitchen in Mirpur
const gulshanLat = 23.7808;
const gulshanLon = 90.4169;
const kitchenDistance = calculateDistance(gulshanLat, gulshanLon, mirpurLat, mirpurLon);
console.log(`  Gulshan to Mirpur Kitchen: ${formatDistance(kitchenDistance)}`);
console.log('');

console.log('✅ All tests completed!');
