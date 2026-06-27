// Test Runner Entry Point
console.log('================================================');
console.log('🛡️  SMART-STOCK INVENTORY BOT - TECHNICAL AUDIT  ');
console.log('================================================');

// Initialize Mocks First
require('./mocks');

const { runUnitTests } = require('./unit.test');
const { runIntegrationTests } = require('./integration.test');
const { runE2ETests } = require('./e2e.test');

const main = async () => {
  let passed = true;
  try {
    // 1. Run Unit Tests
    await runUnitTests();
    console.log('\n🟢 Unit Tests Completed Successfully!');
    console.log('------------------------------------------------');

    // 2. Run Integration Tests
    await runIntegrationTests();
    console.log('\n🟢 Integration Tests Completed Successfully!');
    console.log('------------------------------------------------');

    // 3. Run End-to-End Tests
    await runE2ETests();
    console.log('\n🟢 End-to-End Tests Completed Successfully!');
    console.log('------------------------------------------------');

  } catch (err) {
    passed = false;
    console.error('\n🔴 Test Suite Failed!');
    console.error(err);
    process.exit(1);
  }

  if (passed) {
    console.log('\n🌟 ALL TEST SUITES PASSED! [ZERO-CRASH AUDIT SUCCESS] 🌟\n');
    process.exit(0);
  }
};

main();
