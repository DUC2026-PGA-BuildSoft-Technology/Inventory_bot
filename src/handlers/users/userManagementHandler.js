const userService = require('../../services/userService');

/**
 * Show the user directory list for management (Owner/Manager only)
 */
const showUserDirectory = async (ctx, editMode = false) => {
  const telegramId = ctx.from.id;
  const { user: currentUser } = await userService.findOrCreateUserByTelegram(ctx);

  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'manager')) {
    const accessDeniedMsg = '⚠️ Access Denied: Only Store Owners and Managers can manage user accounts.';
    if (editMode) {
      await ctx.editMessageText(accessDeniedMsg).catch(() => {});
    } else {
      await ctx.reply(accessDeniedMsg).catch(() => {});
    }
    return;
  }

  const users = await userService.listAllUsers();
  
  const text = [
    '👤 <b>User Accounts Directory</b>',
    'Select a registered user below to view details and adjust their role permissions:',
    '',
    `Total Registered: <b>${users.length}</b>`
  ].join('\n');

  const keyboard = users.map((u) => {
    const displayName = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || 'User';
    // Format role for user clarity
    const roleLabel = u.role.toUpperCase();
    return [
      {
        text: `${displayName} [${roleLabel}]`,
        callback_data: `user_select:${u.id}`
      }
    ];
  });

  // Main menu navigation
  keyboard.push([{ text: '📋 Main Menu', callback_data: 'menu_view' }]);

  if (editMode) {
    try {
      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
    } catch (e) {
      await ctx.deleteMessage().catch(() => {});
      await ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
    }
  } else {
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  }
};

/**
 * Show details and role/status options for a specific user
 */
const showUserProfileCard = async (ctx, targetUserId) => {
  const users = await userService.listAllUsers();
  const targetUser = users.find(u => u.id === Number(targetUserId));

  if (!targetUser) {
    await ctx.answerCbQuery('User not found.');
    await showUserDirectory(ctx, true);
    return;
  }

  const displayName = [targetUser.first_name, targetUser.last_name].filter(Boolean).join(' ') || targetUser.username || 'User';
  const regDate = new Date(targetUser.created_at).toLocaleDateString();

  const text = [
    '👤 <b>User Profile Settings</b>',
    '',
    `<b>Name:</b> ${displayName}`,
    `<b>Username:</b> @${targetUser.username || '-'}`,
    `<b>Telegram ID:</b> <code>${targetUser.telegram_id}</code>`,
    `<b>Registered on:</b> ${regDate}`,
    `<b>Active Role:</b> <code>${targetUser.role}</code>`,
    `<b>Status:</b> <code>${targetUser.status}</code>`,
    '',
    'Modify permissions or set user status below:'
  ].join('\n');

  const banButtonText = targetUser.status === 'banned' ? '✅ Unban User' : '🚫 Ban User';
  const newStatusVal = targetUser.status === 'banned' ? 'active' : 'banned';

  const keyboard = [
    [
      { text: '👤 Seller', callback_data: `user_role:seller:${targetUserId}` },
      { text: '🔧 Stock Manager', callback_data: `user_role:stock-manager:${targetUserId}` }
    ],
    [
      { text: '👔 Manager', callback_data: `user_role:manager:${targetUserId}` },
      { text: '👑 Owner', callback_data: `user_role:owner:${targetUserId}` }
    ],
    [
      { text: banButtonText, callback_data: `user_status:${newStatusVal}:${targetUserId}` },
      { text: '🗑️ Delete User', callback_data: `user_delete_confirm:${targetUserId}` }
    ],
    [
      { text: '🔙 Back to Directory', callback_data: 'users_manage_view' }
    ]
  ];

  try {
    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (e) {
    await ctx.deleteMessage().catch(() => {});
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  }
};

/**
 * Show deletion confirmation prompt
 */
const showUserDeletionConfirm = async (ctx, targetUserId) => {
  const users = await userService.listAllUsers();
  const targetUser = users.find(u => u.id === Number(targetUserId));

  if (!targetUser) {
    await ctx.answerCbQuery('User not found.');
    await showUserDirectory(ctx, true);
    return;
  }

  const displayName = [targetUser.first_name, targetUser.last_name].filter(Boolean).join(' ') || targetUser.username || 'User';

  const text = [
    '⚠️ <b>Confirm User Deletion</b>',
    '',
    `Are you sure you want to permanently delete user <b>${displayName}</b>?`,
    '',
    'This will delete their user profile card from the database. Any matching transaction receipts and stock logs they wrote will remain intact but will have their user identity cleared (marked NULL).',
    '',
    '<i>This action cannot be undone.</i>'
  ].join('\n');

  const keyboard = [
    [
      { text: '👍 Yes, Delete', callback_data: `user_delete_exec:${targetUserId}` },
      { text: '👎 Cancel', callback_data: `user_select:${targetUserId}` }
    ]
  ];

  try {
    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (e) {
    await ctx.deleteMessage().catch(() => {});
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  }
};

const registerUserManagementHandler = (bot) => {
  // Command: /manage_users
  bot.command('manage_users', async (ctx) => {
    try {
      await showUserDirectory(ctx);
    } catch (err) {
      console.error('Error in /manage_users command:', err);
      await ctx.reply('Error loading user management directory.');
    }
  });

  // Action: Display list of users
  bot.action('users_manage_view', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      await showUserDirectory(ctx, true);
    } catch (err) {
      console.error('Error in users_manage_view action:', err);
      await ctx.answerCbQuery('Error loading user list');
    }
  });

  // Action: Select specific user card
  bot.action(/^user_select:(\d+)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const targetUserId = ctx.match[1];
      await showUserProfileCard(ctx, targetUserId);
    } catch (err) {
      console.error('Error in user_select action:', err);
      await ctx.answerCbQuery('Error loading profile card');
    }
  });

  // Action: Change user role in database
  bot.action(/^user_role:(.+):(\d+)$/, async (ctx) => {
    try {
      const newRole = ctx.match[1];
      const targetUserId = Number(ctx.match[2]);

      const { user: currentUser } = await userService.findOrCreateUserByTelegram(ctx);
      if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'manager')) {
        await ctx.answerCbQuery('Access Denied: Owner/Manager permissions required.', { show_alert: true });
        return;
      }

      const updatedUser = await userService.updateUserRole(targetUserId, newRole);

      if (updatedUser) {
        await ctx.answerCbQuery(`Role successfully updated to ${newRole}!`, { show_alert: true });
        await showUserProfileCard(ctx, targetUserId);
      } else {
        await ctx.answerCbQuery('Failed to update role. User not found.');
      }
    } catch (err) {
      console.error('Error in user_role action:', err);
      await ctx.answerCbQuery('Error modifying user role');
    }
  });

  // Action: Ban or Unban user in database
  bot.action(/^user_status:(.+):(\d+)$/, async (ctx) => {
    try {
      const newStatus = ctx.match[1];
      const targetUserId = Number(ctx.match[2]);

      const { user: currentUser } = await userService.findOrCreateUserByTelegram(ctx);
      if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'manager')) {
        await ctx.answerCbQuery('Access Denied: Owner/Manager permissions required.', { show_alert: true });
        return;
      }

      const updatedUser = await userService.updateUserStatus(targetUserId, newStatus);

      if (updatedUser) {
        const actionLabel = newStatus === 'banned' ? 'banned' : 'unbanned';
        await ctx.answerCbQuery(`User successfully ${actionLabel}!`, { show_alert: true });
        await showUserProfileCard(ctx, targetUserId);
      } else {
        await ctx.answerCbQuery('Failed to update user status.');
      }
    } catch (err) {
      console.error('Error in user_status action:', err);
      await ctx.answerCbQuery('Error modifying user status');
    }
  });

  // Action: Open deletion confirmation dialog
  bot.action(/^user_delete_confirm:(\d+)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const targetUserId = ctx.match[1];
      await showUserDeletionConfirm(ctx, targetUserId);
    } catch (err) {
      console.error('Error in user_delete_confirm action:', err);
      await ctx.answerCbQuery('Error loading confirmation dialog');
    }
  });

  // Action: Execute user deletion
  bot.action(/^user_delete_exec:(\d+)$/, async (ctx) => {
    try {
      const targetUserId = Number(ctx.match[1]);

      const { user: currentUser } = await userService.findOrCreateUserByTelegram(ctx);
      if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'manager')) {
        await ctx.answerCbQuery('Access Denied: Owner/Manager permissions required.', { show_alert: true });
        return;
      }

      const deleted = await userService.deleteUser(targetUserId);

      if (deleted) {
        await ctx.answerCbQuery('User deleted successfully.', { show_alert: true });
        await showUserDirectory(ctx, true);
      } else {
        await ctx.answerCbQuery('User not found.');
      }
    } catch (err) {
      console.error('Error in user_delete_exec action:', err);
      await ctx.answerCbQuery('Error deleting user account');
    }
  });
};

module.exports = {
  registerUserManagementHandler,
  showUserDirectory,
};
