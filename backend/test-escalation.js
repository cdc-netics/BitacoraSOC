// Test file to debug escalation routes issue
console.log('1. Loading auth middleware...');
const { authenticate } = require('./src/middleware/auth');
console.log('   authenticate type:', typeof authenticate);

console.log('2. Loading escalation controller...');
const controller = require('./src/controllers/escalationController');
console.log('   controller:', Object.keys(controller).slice(0, 5));
console.log('   getEscalationView type:', typeof controller.getEscalationView);

console.log('3. Testing route setup...');
const express = require('express');
const router = express.Router();
console.log('   router:', typeof router.get);

console.log('4. Attempting to register route...');
try {
  router.get('/view/:serviceId', authenticate, controller.getEscalationView);
  console.log('   ✓ Route registered successfully!');
} catch (error) {
  console.log('   ✗ Error:', error.message);
}

console.log('Done!');
