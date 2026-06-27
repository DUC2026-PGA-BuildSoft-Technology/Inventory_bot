const assert = require('assert');
const { createMockCtx, mockUsers } = require('./mocks');
const userService = require('../src/services/userService');

// We test the ban intercept middleware logic manually by recreating the bot middleware flow in our test context.
const runIntegrationTests = async () => {
  console.log('  🏃 Running Integration Tests...');

  // Test 1: Active User passes middleware checks
  let isNextCalled = false;
  const nextCallback = () => { isNextCalled = true; };

  const activeCtx = createMockCtx({ fromId: 22222, text: 'Hello Bot' });
  
  // Simulated middleware execution
  const simulateMiddleware = async (ctx, next) => {
    if (ctx.from && ctx.from.id) {
      const { user } = await userService.findOrCreateUserByTelegram(ctx).catch(() => ({ user: null }));
      if (user && user.status === 'banned') {
        if (ctx.callbackQuery) {
          await ctx.answerCbQuery('❌ Access Denied: Your account has been banned.', { show_alert: true });
        } else {
          await ctx.reply('❌ Access Denied: Your account has been banned by the administrator.');
        }
        return;
      }
    }
    return next();
  };

  await simulateMiddleware(activeCtx, nextCallback);
  assert.strictEqual(isNextCalled, true);
  assert.strictEqual(activeCtx.getReplies().length, 0);
  console.log('    ✓ Middleware allows active user through passed');

  // Test 2: Banned User blocked by middleware
  isNextCalled = false;
  const bannedCtx = createMockCtx({ fromId: 44444, text: 'Hello Bot' });
  await simulateMiddleware(bannedCtx, nextCallback);

  assert.strictEqual(isNextCalled, false);
  assert.strictEqual(bannedCtx.getReplies().length, 1);
  assert.ok(bannedCtx.getReplies()[0].text.includes('Access Denied'));
  console.log('    ✓ Middleware blocks banned user passed');

  // Test 3: Banned User Callback query blocked
  isNextCalled = false;
  const bannedCbCtx = createMockCtx({ fromId: 44444, callbackData: 'catalog_view' });
  await simulateMiddleware(bannedCbCtx, nextCallback);

  assert.strictEqual(isNextCalled, false);
  assert.strictEqual(bannedCbCtx.getCbAlerts().length, 1);
  assert.ok(bannedCbCtx.getCbAlerts()[0].text.includes('Access Denied'));
  console.log('    ✓ Middleware blocks banned user callback passed');
};

module.exports = { runIntegrationTests };
