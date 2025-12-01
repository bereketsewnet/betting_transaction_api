'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // All template keys with English defaults
    const templates = [
      // Start & Authentication
      {
        language_code: 'en',
        key_name: 'welcome_message',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'start_language_selection',
        content: '👋 Welcome! Please select your preferred language:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'start_what_to_do',
        content: 'What would you like to do?',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_phone_login',
        content: '📱 Login/Register',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_email_login',
        content: '📧 Login with Email',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'login_share_contact',
        content: '📱 Please click the button below to share your contact number for secure login/registration.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_share_contact',
        content: '📱 Share Contact',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_continue_guest',
        content: '👤 Continue as Guest',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'guest_created_success',
        content: '✅ You are now using the bot as a guest.\n\nYou can make transactions, but some features may be limited.\nTo access all features, please register.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'login_enter_username',
        content: '🔐 Login\n\nPlease enter your username (email):',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'login_enter_password',
        content: 'Please enter your password:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'login_success',
        content: '✅ Login successful! Welcome back to Betting Payment Manager!',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'login_failed',
        content: '❌ Login failed. Please check your credentials and try again.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'register_enter_email',
        content: '📝 Registration\n\nPlease enter your email address:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'register_enter_password',
        content: 'Please enter your password (min 6 characters):',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'register_enter_display_name',
        content: 'Please enter your display name:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'register_enter_phone',
        content: 'Please enter your phone number (optional):',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'register_success',
        content: '✅ Registration successful! Welcome to Betting Payment Manager!',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_no_languages',
        content: 'No languages available. Please contact support.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_start_failed',
        content: '❌ An error occurred while starting the bot.\n\nError: {error_type}\nPlease try again or contact support.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_generic',
        content: '❌ An error occurred. Please try again.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Main Menu
      {
        language_code: 'en',
        key_name: 'main_menu_title',
        content: '🏠 Main Menu\n\nSelect an option:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_deposit',
        content: '💵 Deposit',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_withdraw',
        content: '💸 Withdraw',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_history',
        content: '📜 History',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_open_browser',
        content: '🌐 Open in Browser',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_help',
        content: 'ℹ️ Help',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_logout',
        content: '🚪 Logout',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'admin_redirect_message',
        content: '👑 You are logged in as admin. Use the Admin Panel to manage transactions.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'agent_redirect_message',
        content: '👤 You are logged in as agent. Use the Agent Panel to manage your assigned transactions.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'web_app_description',
        content: '🌐 Web App\n\nClick the button below to open the web app in your browser:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'help_text',
        content: 'ℹ️ Help\n\nAvailable commands:\n• /start - Start the bot\n• /menu - Show main menu\n• /logout - Logout from your account\n• /help - Show this help message\n\nMain features:\n• 💵 Deposit - Make a deposit transaction\n• 💸 Withdraw - Make a withdrawal transaction\n• 📜 History - View your transaction history\n• 📱 Open App - Open mini app (Telegram Web App)\n• 🌐 Open in Browser - Open web app in browser\n• 🚪 Logout - Logout and login with another account\n\nFor support, please contact the administrator.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'logout_not_logged_in',
        content: 'ℹ️ You are not logged in. Nothing to logout.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'logout_success',
        content: '✅ Logout successful!\n\nYou can now:\n• /start - Login with another account\n• Continue as guest',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'logout_local_success',
        content: '✅ Logged out locally.\n\nNote: Backend logout may have failed, but you can still login with another account.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Deposit Flow
      {
        language_code: 'en',
        key_name: 'deposit_title',
        content: '💵 Deposit\n\nSelect a deposit bank:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_no_deposit_banks',
        content: '❌ No deposit banks available. Please contact support.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_bank_not_found',
        content: '❌ Bank not found.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'deposit_enter_amount',
        content: 'Enter the deposit amount:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_invalid_amount',
        content: '❌ Invalid amount. Please enter a valid number greater than 0.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'deposit_select_betting_site',
        content: 'Select a betting site:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_no_betting_sites',
        content: '❌ No betting sites available. Please contact support.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'deposit_enter_player_site_id',
        content: 'Enter your player ID on the betting site:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_invalid_player_site_id',
        content: '❌ Invalid player ID. Please enter a valid player ID.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'deposit_upload_screenshot',
        content: 'Upload a screenshot of your payment:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_invalid_file',
        content: '❌ Invalid file. Please send a photo (PNG, JPG, or JPEG).',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_file_too_large',
        content: '❌ File is too large. Maximum size is 5MB.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'deposit_confirm',
        content: 'Please confirm your deposit:\n\nAmount: {currency} {amount}\nBank: {bank_name}\nBetting Site: {site_name}\nPlayer ID: {player_site_id}',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_confirm',
        content: '✅ Confirm',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_cancel',
        content: '❌ Cancel',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'deposit_processing',
        content: '⏳ Processing your deposit, please wait...',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'transaction_created',
        content: '✅ Your transaction has been created successfully!\n\nTransaction ID: {transaction_uuid}\nAmount: {currency} {amount}\nStatus: {status}\n\nYou can check the status in your transaction history.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'transaction_processed',
        content: '🎉 Your transaction has been processed!\n\nTransaction ID: {transaction_uuid}\nStatus: {status}',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Withdraw Flow
      {
        language_code: 'en',
        key_name: 'withdraw_title',
        content: '💸 Withdraw\n\nSelect a withdrawal bank:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_no_withdrawal_banks',
        content: '❌ No withdrawal banks available. Please contact support.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'withdraw_enter_required_field',
        content: 'Please enter {field_label}:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'withdraw_enter_amount',
        content: 'Enter the withdrawal amount:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'withdraw_enter_address',
        content: 'Enter your withdrawal address:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'withdraw_confirm',
        content: 'Please confirm your withdrawal:\n\nAmount: {currency} {amount}\nBank: {bank_name}\nAddress: {address}\nBetting Site: {site_name}\nPlayer ID: {player_site_id}',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Transaction History
      {
        language_code: 'en',
        key_name: 'history_title',
        content: '📜 Transaction History\n\nFound {count} transaction(s). Select one to view details:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'history_empty',
        content: '📜 Transaction History\n\nNo transactions found.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_history_failed',
        content: '❌ An error occurred while fetching transaction history.\n\n{error_details}',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_transaction_not_found',
        content: '❌ Player not found.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_transaction_details_failed',
        content: '❌ Failed to load transaction details.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_back',
        content: '🔙 Back',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Admin Menu
      {
        language_code: 'en',
        key_name: 'admin_menu_title',
        content: '👑 Admin Panel\n\nSelect an option:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_all_transactions',
        content: '📋 All Transactions',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_recent_24h',
        content: '🕐 Recent (24h)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_by_date',
        content: '📅 By Date',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'admin_filter_by_date',
        content: '📅 Filter by Date\n\nPlease enter the date (YYYY-MM-DD):\nExample: 2025-11-08',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_admin_access_required',
        content: '❌ Please login as admin or agent to use this feature.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Agent Menu
      {
        language_code: 'en',
        key_name: 'agent_menu_title',
        content: '👤 Agent Panel\n\nSelect an option:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_my_transactions',
        content: '📋 My Transactions',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_my_stats',
        content: '📊 My Stats',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_agent_access_required',
        content: '❌ Agent access required.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Navigation Buttons
      {
        language_code: 'en',
        key_name: 'button_prev',
        content: '◀ Prev',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'button_next',
        content: 'Next ▶',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Error Messages
      {
        language_code: 'en',
        key_name: 'error_connection_failed',
        content: 'Cannot connect to server. Please try again.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_validation_failed',
        content: 'Validation error. Please contact support.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'error_unknown',
        content: '❌ An error occurred. Please try again.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Amharic translations for all templates
    const amharicTemplates = [
      // Start & Authentication
      {
        language_code: 'am',
        key_name: 'welcome_message',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'start_language_selection',
        content: '👋 እንኳን ደህና መጡ! እባክዎ የሚመርጡትን ቋንቋ ይምረጡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'start_what_to_do',
        content: 'ምን ማድረግ ይፈልጋሉ?',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_phone_login',
        content: '📱 ይግቡ/ይመዝገቡ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_email_login',
        content: '📧 በኢሜይል ይግቡ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'login_share_contact',
        content: '📱 ለደህንነቱ የተጠበቀ መግቢያ/ምዝገባ ስልክ ቁጥርዎን ለማጋራት እባክዎ ከታች ያለውን ቁልፍ ይጫኑ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_share_contact',
        content: '📱 ስልክ ቁጥር አጋራ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_continue_guest',
        content: '👤 እንደ እንግዳ ይቀጥሉ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'guest_created_success',
        content: '✅ አሁን እንደ እንግዳ በመጠቀም ነዎት።\n\nግብይቶችን ማድረግ ይችላሉ፣ ግን አንዳንድ ባህሪያት የተገደቡ ሊሆኑ ይችላሉ።\nሁሉንም ባህሪያት ለመድረስ፣ እባክዎ ይመዝግቡ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'login_enter_username',
        content: '🔐 ግባ\n\nእባክዎ የተጠቃሚ ስምዎን (ኢሜይል) ያስገቡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'login_enter_password',
        content: 'እባክዎ የይለፍ ቃልዎን ያስገቡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'login_success',
        content: '✅ ግባት በተሳካ ሁኔታ! ወደ ውርርድ ክፍያ አስተዳዳሪ እንኳን በደህና መጡ!',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'login_failed',
        content: '❌ ግባት አልተሳካም። እባክዎ የይለፍ ቃልዎን ያረጋግጡ እና እንደገና ይሞክሩ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'register_enter_email',
        content: '📝 ምዝግብ\n\nእባክዎ የኢሜይል አድራሻዎን ያስገቡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'register_enter_password',
        content: 'እባክዎ የይለፍ ቃልዎን ያስገቡ (ቢያንስ 6 ቁምፊዎች):',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'register_enter_display_name',
        content: 'እባክዎ የማሳያ ስምዎን ያስገቡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'register_enter_phone',
        content: 'እባክዎ የስልክ ቁጥርዎን ያስገቡ (አማራጭ):',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'register_success',
        content: '✅ ምዝግብ በተሳካ ሁኔታ! ወደ ውርርድ ክፍያ አስተዳዳሪ እንኳን በደህና መጡ!',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_no_languages',
        content: 'ምንም ቋንቋዎች አልተገኙም። እባክዎ ድጋፍ ያግኙ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_start_failed',
        content: '❌ ቦቱን ሲጀምሩ ስህተት ተፈጥሯል።\n\nስህተት: {error_type}\nእባክዎ እንደገና ይሞክሩ ወይም ድጋፍ ያግኙ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_generic',
        content: '❌ ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Main Menu
      {
        language_code: 'am',
        key_name: 'main_menu_title',
        content: '🏠 ዋና ምናሌ\n\nአንድን አማራጭ ይምረጡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_deposit',
        content: '💵 ክፍያ አስገባ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_withdraw',
        content: '💸 ክፍያ አውጣ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_history',
        content: '📜 ታሪክ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_open_browser',
        content: '🌐 በአሳሽ ውስጥ ክፈት',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_help',
        content: 'ℹ️ እርዳታ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_logout',
        content: '🚪 ውጣ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'admin_redirect_message',
        content: '👑 እንደ አስተዳዳሪ ገብተዋል። ግብይቶችን ለመስተዳደር የአስተዳዳሪ ፓነል ይጠቀሙ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'agent_redirect_message',
        content: '👤 እንደ ወኪል ገብተዋል። የተመደቡልዎ ግብይቶችን ለመስተዳደር የወኪል ፓነል ይጠቀሙ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'web_app_description',
        content: '🌐 የድር መተግበሪያ\n\nየድር መተግበሪያውን በአሳሽዎ ውስጥ ለመክፈት ከታች ያለውን ቁልፍ ይጫኑ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'help_text',
        content: 'ℹ️ እርዳታ\n\nየሚገኙ ትዕዛዞች:\n• /start - ቦቱን ይጀምሩ\n• /menu - ዋና ምናሌ ያሳዩ\n• /logout - ከመለያዎ ውጣ\n• /help - ይህንን የእርዳታ መልዕክት ያሳዩ\n\nዋና ባህሪያት:\n• 💵 ክፍያ አስገባ - የክፍያ አስገባት ግብይት ያድርጉ\n• 💸 ክፍያ አውጣ - የክፍያ ማውጣት ግብይት ያድርጉ\n• 📜 ታሪክ - የግብይት ታሪክዎን ይመልከቱ\n• 📱 መተግበሪያ ክፈት - ሚኒ መተግበሪያ ይክፈቱ (Telegram Web App)\n• 🌐 በአሳሽ ውስጥ ክፈት - የድር መተግበሪያ በአሳሽ ውስጥ ይክፈቱ\n• 🚪 ውጣ - ውጣ እና በሌላ መለያ ግባ\n\nለድጋፍ፣ እባክዎ አስተዳዳሪውን ያግኙ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'logout_not_logged_in',
        content: 'ℹ️ አልገቡም። ምንም ለመውጣት የለም።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'logout_success',
        content: '✅ ውጣት በተሳካ ሁኔታ!\n\nአሁን ይችላሉ:\n• /start - በሌላ መለያ ግባ\n• እንደ እንግዳ ይቀጥሉ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'logout_local_success',
        content: '✅ በአካባቢ ውጣዎት።\n\nማስታወሻ: የጀርባ ውጣት ሊያልቅ ይችላል፣ ግን አሁንም በሌላ መለያ መግባት ይችላሉ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Deposit Flow
      {
        language_code: 'am',
        key_name: 'deposit_title',
        content: '💵 ክፍያ አስገባ\n\nየክፍያ አስገባት ባንክ ይምረጡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_no_deposit_banks',
        content: '❌ ምንም የክፍያ አስገባት ባንኮች አልተገኙም። እባክዎ ድጋፍ ያግኙ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_bank_not_found',
        content: '❌ ባንክ አልተገኘም።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'deposit_enter_amount',
        content: 'የክፍያ አስገባት መጠን ያስገቡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_invalid_amount',
        content: '❌ የማይሰራ መጠን። እባክዎ ከ 0 በላይ የሆነ ትክክለኛ ቁጥር ያስገቡ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'deposit_select_betting_site',
        content: 'የውርርድ ጣቢያ ይምረጡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_no_betting_sites',
        content: '❌ ምንም የውርርድ ጣቢያዎች አልተገኙም። እባክዎ ድጋፍ ያግኙ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'deposit_enter_player_site_id',
        content: 'በውርርድ ጣቢያው ላይ ያለውን የተጫዋች መለያዎን ያስገቡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_invalid_player_site_id',
        content: '❌ የማይሰራ የተጫዋች መለያ። እባክዎ ትክክለኛ የተጫዋች መለያ ያስገቡ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'deposit_upload_screenshot',
        content: 'የክፍያዎን ስክሪንሾት ይጭኑ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_invalid_file',
        content: '❌ የማይሰራ ፋይል። እባክዎ ፎቶ (PNG, JPG, ወይም JPEG) ይላኩ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_file_too_large',
        content: '❌ ፋይሉ በጣም ትልቅ ነው። ከፍተኛው መጠን 5MB ነው።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'deposit_confirm',
        content: 'እባክዎ የክፍያ አስገባትዎን ያረጋግጡ:\n\nመጠን: {currency} {amount}\nባንክ: {bank_name}\nየውርርድ ጣቢያ: {site_name}\nየተጫዋች መለያ: {player_site_id}',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_confirm',
        content: '✅ ያረጋግጡ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_cancel',
        content: '❌ ይቅር',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'deposit_processing',
        content: '⏳ የክፍያ አስገባትዎን እያስተናገድን ነው፣ እባክዎ ይጠብቁ...',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'transaction_created',
        content: '✅ ግብይትዎ በተሳካ ሁኔታ ተፈጥሯል!\n\nየግብይት መለያ: {transaction_uuid}\nመጠን: {currency} {amount}\nሁኔታ: {status}\n\nሁኔታውን በግብይት ታሪክዎ ውስጥ ማረጋገጥ ይችላሉ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'transaction_processed',
        content: '🎉 ግብይትዎ ተስተናግዷል!\n\nየግብይት መለያ: {transaction_uuid}\nሁኔታ: {status}',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Withdraw Flow
      {
        language_code: 'am',
        key_name: 'withdraw_title',
        content: '💸 ክፍያ አውጣ\n\nየክፍያ ማውጣት ባንክ ይምረጡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_no_withdrawal_banks',
        content: '❌ ምንም የክፍያ ማውጣት ባንኮች አልተገኙም። እባክዎ ድጋፍ ያግኙ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'withdraw_enter_required_field',
        content: 'እባክዎ {field_label} ያስገቡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'withdraw_enter_amount',
        content: 'የክፍያ ማውጣት መጠን ያስገቡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'withdraw_enter_address',
        content: 'የክፍያ ማውጣት አድራሻዎን ያስገቡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'withdraw_confirm',
        content: 'እባክዎ የክፍያ ማውጣትዎን ያረጋግጡ:\n\nመጠን: {currency} {amount}\nባንክ: {bank_name}\nአድራሻ: {address}\nየውርርድ ጣቢያ: {site_name}\nየተጫዋች መለያ: {player_site_id}',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Transaction History
      {
        language_code: 'am',
        key_name: 'history_title',
        content: '📜 የግብይት ታሪክ\n\n{count} ግብይት(ዎች) ተገኝተዋል። ዝርዝሮችን ለመመልከት አንዱን ይምረጡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'history_empty',
        content: '📜 የግብይት ታሪክ\n\nምንም ግብይቶች አልተገኙም።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_history_failed',
        content: '❌ የግብይት ታሪክ ሲያገኙ ስህተት ተፈጥሯል።\n\n{error_details}',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_transaction_not_found',
        content: '❌ ተጫዋች አልተገኘም።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_transaction_details_failed',
        content: '❌ የግብይት ዝርዝሮችን ማስገባት አልተሳካም።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_back',
        content: '🔙 ተመለስ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Admin Menu
      {
        language_code: 'am',
        key_name: 'admin_menu_title',
        content: '👑 የአስተዳዳሪ ፓነል\n\nአንድን አማራጭ ይምረጡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_all_transactions',
        content: '📋 ሁሉም ግብይቶች',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_recent_24h',
        content: '🕐 ቅርብ (24ሰ)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_by_date',
        content: '📅 በቀን',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'admin_filter_by_date',
        content: '📅 በቀን ማጣሪያ\n\nእባክዎ ቀኑን ያስገቡ (YYYY-MM-DD):\nምሳሌ: 2025-11-08',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_admin_access_required',
        content: '❌ ይህንን ባህሪ ለመጠቀም እንደ አስተዳዳሪ ወይም ወኪል ይግቡ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Agent Menu
      {
        language_code: 'am',
        key_name: 'agent_menu_title',
        content: '👤 የወኪል ፓነል\n\nአንድን አማራጭ ይምረጡ:',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_my_transactions',
        content: '📋 የእኔ ግብይቶች',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_my_stats',
        content: '📊 የእኔ ስታትስቲክስ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_agent_access_required',
        content: '❌ የወኪል መዳረሻ ያስፈልጋል።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Navigation Buttons
      {
        language_code: 'am',
        key_name: 'button_prev',
        content: '◀ ቀዳሚ',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'button_next',
        content: 'ቀጣይ ▶',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Error Messages
      {
        language_code: 'am',
        key_name: 'error_connection_failed',
        content: 'ከሰርቨር ጋር መገናኘት አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_validation_failed',
        content: 'የማረጋገጫ ስህተት። እባክዎ ድጋፍ ያግኙ።',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'am',
        key_name: 'error_unknown',
        content: '❌ ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Combine English and Amharic templates
    const allTemplates = [...templates, ...amharicTemplates];

    // Check which templates already exist (composite key: language_code + key_name)
    const existingTemplates = await queryInterface.sequelize.query(
      `SELECT language_code, key_name FROM templates`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingTemplateKeys = existingTemplates.map(t => `${t.language_code}:${t.key_name}`);

    // Filter out templates that already exist
    const templatesToInsert = allTemplates.filter(t => 
      !existingTemplateKeys.includes(`${t.language_code}:${t.key_name}`)
    );

    if (templatesToInsert.length > 0) {
      await queryInterface.bulkInsert('templates', templatesToInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('templates', null, {});
  }
};
