# ExpenseAI Admin Access Information

## Admin Login Credentials
- **Email**: admin_001@expenseai.com
- **Account ID**: admin_001
- **Role**: Administrator
- **Permissions**: 
  - read_all_users
  - manage_users
  - view_analytics
  - manage_subscriptions
  - system_admin

## Admin Dashboard Access
- **URL**: `/admin`
- **Access Method**: Click "Sign In" on the homepage, then navigate to `/admin`
- **Requirements**: Must be logged in with admin role

## Admin Capabilities
1. **User Management**
   - View all registered users
   - See user roles and subscription status
   - Monitor user activity and login history
   - Update user roles and permissions

2. **System Analytics**
   - Total users count
   - Total receipts processed
   - Revenue tracking
   - Active subscriptions
   - Monthly receipt processing stats
   - Weekly signup metrics

3. **Administrative Operations**
   - System monitoring
   - User role management
   - Access control administration

## Login Process
1. Go to the ExpenseAI application
2. Click "Sign In" button
3. Use Replit authentication with admin_001@expenseai.com
4. After login, navigate to `/admin` in the URL
5. Admin dashboard will load with full system access

## Security Notes
- Admin access is protected by role-based authentication
- All admin routes require authentication + admin role verification
- Session-based security with database-backed sessions
- Unauthorized access attempts return 401/403 errors appropriately